const express = require('express'); // importando o Express 
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); // importando Socket.io
const five = require('johnny-five'); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 
const fs = require('fs');
const cmd = require('node-cmd');
const Controller = require('node-pid-controller');

const port = 80;
// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: 'COM6' });
let setPoint = 30; // valor do setpoint   
let u, e = 0;    // valor de saída e valor do erro 
let state = true;   // determina se o controlador deve estar ligado 
let therm1, therm2, therm3, therm4, therm5;  // sensores 
let hist = fs.readFileSync(__dirname + '/hist.txt', 'utf-8'); // lendo arquivo de texto 
let saving;
// let iant = 0, eant = 0;

// atender requisições com pasta a frontend
app.use(express.static(path.resolve(__dirname + "/../frontend")));
// executar quando o arduino estiver pronto
arduino.on('ready', () => {
	setPins();
	arduino.pinMode(9, five.Pin.PWM);
	startControling();
	setTimeout(() => startSaving(), 100);
	// setInterval(() => arduino.analogWrite(9, scale(generatePID(getTemp()))), 100);
	io.on('connection', socket => {
		startSending(socket, socket.id);
		socket.on('setPins', pins => setPins(pins));
		socket.on('changingSetPoint', newSetPoint => setSetPoint(socket, newSetPoint));
		socket.on('plotChart', () => {
			clearInterval(saving);
			cmd.get('octave-cli backend/draw.m', (e, dt) => {
				console.log(e ? e : '')
				if (!e) socket.emit('chartReady', null);
			});
			startSaving();
		});
	});
	http.listen(port, () => {
		console.log('============ SISTEMA PRONTO ============');
		console.log(`   Abrir em: http://localhost:${port}`);
		console.log('>> ========================================');
	});
});
// função para setar novos canais no Arduino
// setar canais do A5 ao A1 por padrão 
function setPins(pins = ['A5', 'A4', 'A3', 'A2', 'A1']) {
	therm1 = new five.Sensor({ pin: pins[0], freq: 100 });
	therm2 = new five.Sensor({ pin: pins[1], freq: 100 });
	therm3 = new five.Sensor({ pin: pins[2], freq: 100 });
	therm4 = new five.Sensor({ pin: pins[3], freq: 100 });
	therm5 = new five.Sensor({ pin: pins[4], freq: 100 });
	console.log(`Canais setados: ${pins}`);
}
// comecça a salvar em arquivo txt 
function startSaving() {
	saving = setInterval(() => {
		hist += `${getTemp().toFixed(2)}, ${scale(u, 'inverse').toFixed(2)}, ${e.toFixed(2)}, ${setPoint.toFixed(2)}\n`;
		fs.writeFile(__dirname + '/hist.txt', hist, error => {
			if (error) console.log(error);
		});
	}, 100);
}
// começa a controlar o secador de grãos através de PID 
function startControling() {
	setInterval(() => {
		const KP = 1 / 0.3, KI = KP / 1.27, H = 0.1, KD = KP * 6;
		// 							k_p, k_i, k_d, dt
		let control = new Controller(KP, KI, KD, H);
		control.setTarget(setPoint);
		let output = getTemp();
		e = getTemp() - setPoint;
		u = control.update(output);

		if (u < 2 && setPoint > 30) {
			u *= 1.1;
		}
		if (u > 255)
			u = 255;
		else if (u < 0)
			u = 0;

		arduino.analogWrite(9, u);
	}, 100);
}
// retorna a temperatura media
function getTemp() {
	return ((toCelsius(therm1.value) + toCelsius(therm2.value) +
		toCelsius(therm3.value) + toCelsius(therm4.value) + toCelsius(therm5.value)) / 5);
}
// mudar o setPoint 
function setSetPoint(socket, newSetPoint) {
	setPoint = Number(newSetPoint); // garantir que será um número
	socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual 
	console.log(`Set point mudado para ${setPoint}`);
}
// começa a mandar os dados para o arduino
function startSending(socket, clientId) {
	setInterval(() => socket.emit('controlBitValue', scale(u, 'inverse')), 500);
	console.log('Mandando dados para ' + clientId);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
	tempSend(socket, therm1, 'newTemperature1');
	tempSend(socket, therm2, 'newTemperature2');
	tempSend(socket, therm3, 'newTemperature3');
	tempSend(socket, therm4, 'newTemperature4');
	tempSend(socket, therm5, 'newTemperature5');
}
// faz os dados de um termistor começarem a ser mandados pros clientes via socket.io
function tempSend(socket, therm, socketMsg) {
	// setInterval(() => socket.emit(socketMsg, toCelsius(Math.random() * 100 + 420)), 400);
	therm.on('data', () => socket.emit(socketMsg, toCelsius(therm.value)));
}
// converte valor ADC em Celsius
function toCelsius(rawADC) {
	let temp = Math.log(((10240000 / rawADC) - 10000));
	temp = 1 / (0.001129148 + (0.000234125 * temp) + (0.0000000876741 * temp ** 3));
	temp = temp - 273.15;   // Kelvin para Celsius 
	return temp;
}
// retorna correspondente do valor em outra escala  
function scale(value, inverse = false) {
	let from;
	if (!inverse) {
		from = [0, 5], to = [0, 255];
	} else {
		from = [0, 255], to = [0, 5];
	}
	var scale = (to[1] - to[0]) / (from[1] - from[0]);
	var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return (capped * scale + to[0]);
}