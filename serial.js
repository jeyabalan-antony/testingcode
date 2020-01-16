"use strict";
const logger = require("../logger");
const SerialPort = require("serialport");
const util = require("./util");
module.exports = class serial {
    constructor(_triggerEvent) {
        this._triggerEvent = _triggerEvent;
        this.openPortCache = new Map();
    }
    static _setUpDisplayName(ports) {
        ports.forEach((port) => {
            if (port.manufacturer) {
                port.displayName = `${port.comName} (${port.manufacturer})`;
            }
            else if (port.pnpId) {
                port.displayName = `${port.comName} (${port.pnpId})`;
            }
            else {
                port.displayName = port.comName;
            }
        });
        return ports;
    }
    async onClose() {
        const promises = [];
        for (const comName of this.openPortCache.keys()) {
            const serialPort = this.openPortCache.get(comName);
            promises.push(util.ctxPromisify(serialPort, serialPort.close)());
        }
        await util.allSettled(promises);
        this.openPortCache.clear();
    }
    async list() {
        try {
            const ports = await util.ctxPromisify(SerialPort, SerialPort.list)();
            Serial._setUpDisplayName(ports);
            return ({ ports });
        }
        catch (error) {
            logger.info(`list exception : ${error.message}`);
            throw error;
        }
    }
    // temp fix, need to make serial hooked up to websocket connections, refer to TICLD-2024
    async open(portInfo) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        if (serialPort) {
            logger.info(`Serial port already opened : ${portInfo.comName}`);
            throw new Error("Serial port already opened.");
        }
        return await this.createSerialPort(portInfo);
    }
    async write(portInfo, dataToWrite) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        if (serialPort) {
            try {
                await util.ctxPromisify(serialPort, serialPort.write)(dataToWrite);
                return portInfo;
            }
            catch (err) {
                logger.info(err.message);
                throw err;
            }
        }
        else {
            const msg = `Trying to write to a closed port: ${comName}`;
            logger.info(msg);
            throw new Error(msg);
        }
    }
    /**
     * Set control flags on an open port.  All options are operating system default when the port is opened.
     * Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
     */
    async setSignals(portInfo, options) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        if (serialPort) {
            try {
                await util.ctxPromisify(serialPort, serialPort.set)(options);
                return portInfo;
            }
            catch (err) {
                logger.info(err.message);
                throw err;
            }
        }
        else {
            const msg = `Trying to call setSignals on a closed port: ${comName}`;
            logger.info(msg);
            throw new Error(msg);
        }
    }
    /**
     *  Returns the control flags (CTS, DSR, DCD) on the open port.
     */
    async getSignals(portInfo) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        if (serialPort) {
            try {
                return await util.ctxPromisify(serialPort, serialPort.get)();
            }
            catch (err) {
                logger.info(err.message);
                throw err;
            }
        }
        else {
            const msg = `Trying to call getSignals on a closed port: ${comName}`;
            logger.info(msg);
            throw new Error(msg);
        }
    }
    async overrideBaudRate(portInfo, baudRateArg) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        try {
            return await util.ctxPromisify(serialPort, serialPort.update)({ baudRate: +baudRateArg });
        }
        catch (err) {
            const errObj = err && err.message ? err : new Error(err);
            throw errObj;
        }
    }
    async close(portInfo) {
        const comName = portInfo.comName;
        const serialPort = this.openPortCache.get(comName);
        if (serialPort) {
            try {
                await util.ctxPromisify(serialPort, serialPort.close)();
                this.openPortCache.delete(comName);
                return portInfo;
            }
            catch (err) {
                const msg = `Could not close serial port: ${err.message}`;
                logger.info(msg);
                throw err;
            }
        }
        else {
            const msg = `Trying to close an already closed port: ${comName}`;
            logger.info(msg);
            throw new Error(msg);
        }
    }
    /* users use list() to obtain a list of com ports of PortInfo type and
       augment it with options from OpenOptions then pass back to us.
    */
    async createSerialPort(portInfoAndOpenOptions) {
        try {
            // handle backward compatibility, notice the camelCase difference "baudrate" and "baudRate"
            if (portInfoAndOpenOptions.baudrate && !portInfoAndOpenOptions.baudRate) {
                portInfoAndOpenOptions.baudRate = Number(portInfoAndOpenOptions.baudrate);
                delete portInfoAndOpenOptions.baudrate;
            }
            // They really shouldn't set the new version as a string, but this is safe regardless
            portInfoAndOpenOptions.baudRate = Number(portInfoAndOpenOptions.baudRate);
            const comName = portInfoAndOpenOptions.comName;
            const type = portInfoAndOpenOptions.type;
            // create the serial port
            try {
                const serialPort = new SerialPort(comName, portInfoAndOpenOptions, (err) => {
                    if (err) {
                        throw err;
                    }
                });
                serialPort.on("close", () => {
                    logger.info(`Serial port connection closed: ${comName}`);
                    if (this.openPortCache.has(comName)) {
                        this.openPortCache.delete(comName);
                    }
                    this._triggerEvent("serialClose", {
                        port: portInfoAndOpenOptions,
                    });
                });
                serialPort.on("data", (data) => {
                    //console.log(data.toString('utf8'));
                    const dataJSON = JSON.stringify(data);
                    const dataPOD = JSON.parse(dataJSON);
                    console.log(dataPOD);

                    if(type == 'com') {
                        this._triggerEvent.send(JSON.stringify(dataPOD.data));
                    }
                    // this._triggerEvent("serialout", {
                    //     buffer: dataPOD.data,
                    //     comName: portInfoAndOpenOptions.comName,
                    // });
                });
                this.openPortCache.set(comName, serialPort);
                return portInfoAndOpenOptions;
            }
            catch (err) {
                const error = err && err.message ? err : new Error(err);
                error.message = `${comName} could not be opened: ${error.message}`;
                throw error;
            }
        }
        catch (err1) {
            const error1 = err1 && err1.message ? err1 : new Error(err1);
            logger.info(error1.message);
            throw error1;
        }
    }
}

