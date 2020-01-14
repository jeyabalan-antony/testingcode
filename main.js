// var http = require('http');
// var fs = require('fs');

// var server = http.createServer(function(req,res){
// 	console.log('request was made: '+req.url);
// 	res.writeHead(200,{'Content-Type':'text/html'});
// 	var myReadStream = fs.createReadStream(__dirname + '/index.html','utf8');
// 	myReadStream.pipe(res);
// });

// server.listen(3000,'127.0.0.1');
// console.log('Hi this is hari, deploying a sample app, now listening to port 3000');


// flushCfg
// dfeDataOutputMode 1
// channelCfg 15 5 0
// adcCfg 2 1
// adcbufCfg 0 1 0 1
// profileCfg 0 77 429 7 57.14 0 0 70 1 240 4884 0 0 30
// chirpCfg 0 0 0 0 0 0 0 1
// chirpCfg 1 1 0 0 0 0 0 4
// frameCfg 0 1 16 0 100 1 0
// lowPower 0 1
// guiMonitor 1 1 0 0 0 1
// cfarCfg 0 2 8 4 3 0 1280
// peakGrouping 1 1 1 1 229
// multiObjBeamForming 1 0.5
// clutterRemoval 0
// calibDcRangeSig 0 -5 8 256
// compRangeBiasAndRxChanPhase 0.0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0
// measureRangeBiasAndRxChanPhase 0 1.5 0.2
// CQRxSatMonitor 0 3 5 123 0
// CQSigImgMonitor 0 119 4
// analogMonitor 1 1
// sensorStart

const configcmds = ['sensorStop\n','flushCfg\n','dfeDataOutputMode 1\n','channelCfg 15 5 0\n','adcCfg 2 1\n','adcbufCfg 0 1 0 1\n',
'profileCfg 0 77 429 7 57.14 0 0 70 1 240 4884 0 0 30\n','chirpCfg 0 0 0 0 0 0 0 1\n','chirpCfg 1 1 0 0 0 0 0 4\n','frameCfg 0 1 16 0 100 1 0\n',
'lowPower 0 1\n','guiMonitor 1 1 0 0 0 1\n','cfarCfg 0 2 8 4 3 0 1280\n','peakGrouping 1 1 1 1 229\n','multiObjBeamForming 1 0.5\n',
'clutterRemoval 0\n','calibDcRangeSig 0 -5 8 256\n','compRangeBiasAndRxChanPhase 0.0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0\n',
'measureRangeBiasAndRxChanPhase 0 1.5 0.2\n','CQRxSatMonitor 0 3 5 123 0\n','CQSigImgMonitor 0 119 4\n','analogMonitor 1 1\n','sensorStart\n'];

const SerialPort = require('serialport')
const parsers = SerialPort.parsers

// Use a `\r\n` as a line terminator
const parser = new parsers.Readline({
  delimiter: '\r\n',
})

// 921600
const port = new SerialPort('/dev/ttyACM0', {
  baudRate: 115200,
})

const port1 = new SerialPort('/dev/ttyACM1', {
	baudRate: 921600,
})
  
port1.pipe(parser)

port.on('open', () => console.log('Port open'))
parser.on('data', console.log)
var i=1;
var time=1000
configcmds.forEach(dat => { 
    
	setTimeout(function(){
    console.log(dat);
	port.write(dat, () => {
	    console.log('Write completed ',dat);
    });
},time*i);
i++;
});

// port.write('version\n', () => {
//  	console.log('Write completed ');
//  })
port.on('data', data => {
	console.log(data.toString('utf8'))
})

port.on('error', data => {
	console.log(data.toString('utf8'))
})

port1.on('data', data => {
	console.log(data.toString('utf8'))
})
