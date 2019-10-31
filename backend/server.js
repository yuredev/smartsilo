const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 
const fs = require('fs');
const ss = require('smartsilo');

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend
let setPoint = 30; // valor de setpoint passado pelo usuário  
let u;
let iant = 0, eant = 0;
let e;

// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: 'COM6' });
let therm1, therm2, therm3, therm4, therm5;
let hist = fs.readFileSync(__dirname + '/hist.txt', 'utf-8');

// executar quando o arduino estiver pronto
arduino.on('ready', () => {
	ss.setPins();
	ss.startSaving();
	arduino.pinMode(9, five.Pin.PWM);
	setInterval(() => arduino.analogWrite(9, ss.scaleValue(ss.generatePID(ss.getTemp()))), 100);
	io.on('connection', socket => {
		silo.startSending(socket, socket.id);
		socket.on('setPins', pins => ss.setPins(pins));
		socket.on('changingSetPoint', newSetPoint => ss.setSetPoint(socket, newSetPoint));
	});
	http.listen(port, () => {
		console.log('============ SISTEMA PRONTO ============');
		console.log(`   Abrir em: http://localhost:${port}`);
		console.log('>> ========================================');
	});
});