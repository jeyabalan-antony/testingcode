const WebSocket = require('ws');
const serial = require('./serialPortCom/serial');

//config commands to configure
//TODO need to move to a seperate file
const configcmds = ['sensorStop\n', 'flushCfg\n', 'dfeDataOutputMode 1\n', 'channelCfg 15 5 0\n', 'adcCfg 2 1\n', 'adcbufCfg 0 1 0 1\n',
    'profileCfg 0 77 429 7 57.14 0 0 70 1 240 4884 0 0 30\n', 'chirpCfg 0 0 0 0 0 0 0 1\n', 'chirpCfg 1 1 0 0 0 0 0 4\n', 'frameCfg 0 1 16 0 100 1 0\n',
    'lowPower 0 1\n', 'guiMonitor 1 1 0 0 0 1\n', 'cfarCfg 0 2 8 4 3 0 1280\n', 'peakGrouping 1 1 1 1 229\n', 'multiObjBeamForming 1 0.5\n',
    'clutterRemoval 0\n', 'calibDcRangeSig 0 -5 8 256\n', 'compRangeBiasAndRxChanPhase 0.0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0\n',
    'measureRangeBiasAndRxChanPhase 0 1.5 0.2\n', 'CQRxSatMonitor 0 3 5 123 0\n', 'CQSigImgMonitor 0 119 4\n', 'analogMonitor 1 1\n', 'sensorStart\n'];


const uartPort = {
    'type': 'uart',
    'comName': '/dev/ttyACM0',
    'baudRate': 115200
}

const comPort = {
    'type': 'com',
    'comName': '/dev/ttyACM1',
    'baudRate': 921600
}

const wss = new WebSocket.Server({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});

wss.on('connection', function connection(ws) {
    console.log("Inside the connection");
    
    const serialPortObj = new serial(ws);
    serialPortObj.open(uartPort);
    serialPortObj.open(comPort);

    ws.on('message', function incoming(message) {
        if (message == 'Start') {
            var i = 1;
            var time = 1000;
            configcmds.forEach(dat => {

                setTimeout(function () {
                    console.log(dat);
                    serialPortObj.write(uartPort,dat);
                }, time * i);
                i++;
            });
        }

        console.log('received: %s', message);
    });

    ws.on('close', function closing() {
        serialPortObj.close(uartPort);
        serialPortObj.close(comPort);
    });

    //ws.send('something');
});
