const express = require('express'); // importando o Express 
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); // importando Socket.io
const five = require('johnny-five'); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 
const fs = require('fs');
const Controller = require('node-pid-controller');

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend
let setPoint = 30; // valor de setpoint passado pelo usuário  
let u;
let iant = 0, eant = 0;
let e;
let state = true;

// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: 'COM6' });


let therm1, therm2, therm3, therm4, therm5;
let hist = fs.readFileSync(__dirname + '/hist.txt', 'utf-8');

// começa a mandar valores para o secador de grãos 
function controlDryer() {
	const KP = 1 / 0.6, KI = KP / 1.77, H = 0.1, KD = KP * 6;
	// 							k_p, k_i, k_d, dt
	let control = new Controller(KP, KI, KD, 1);

	if (state == true) {
		control.setTarget(setPoint);
		let output = getTemp();
		e = getTemp() - setPoint;
		u = control.update(output);
		if (u > 255)
			u = 255
		else if (u < 30)
			u = 30
	}
	if (getTemp() <= setPoint - 1) {
		state = true;
	} else if (getTemp() >= setPoint + 1) {
		u = 0;
		state = false;
	}
	arduino.analogWrite(9, u);
}

// executar quando o arduino estiver pronto
arduino.on('ready', () => {
	setPins();
	startSaving();
	arduino.pinMode(9, five.Pin.PWM);
	setInterval(controlDryer, 100);
	// setInterval(() => arduino.analogWrite(9, scale(generatePID(getTemp()))), 100);
	io.on('connection', socket => {
		startSending(socket, socket.id);
		socket.on('setPins', pins => setPins(pins));
		socket.on('changingSetPoint', newSetPoint => setSetPoint(socket, newSetPoint));
	});
	http.listen(port, () => {
		console.log('============ SISTEMA PRONTO ============');
		console.log(`   Abrir em: http://localhost:${port}`);
		console.log('>> ========================================');
	});
});
// comecça a salvar em arquivo txt 
function startSaving() {
	setInterval(() => {
		hist += `t: ${getTemp().toFixed(2)}, u: ${scale(u, 'inverse').toFixed(2)}, e: ${e.toFixed(2)}, s: ${setPoint.toFixed(2)}\n`;
		fs.writeFile(__dirname + '/hist.txt', hist, error => {
			if (error) console.log(error);
		});
	}, 500);
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
// setar canais do A5 ao A1 por padrão 
function setPins(pins = ['A5', 'A4', 'A3', 'A2', 'A1']) {
	therm1 = new five.Sensor({ pin: pins[0], freq: 100 });
	therm2 = new five.Sensor({ pin: pins[1], freq: 100 });
	therm3 = new five.Sensor({ pin: pins[2], freq: 100 });
	therm4 = new five.Sensor({ pin: pins[3], freq: 100 });
	therm5 = new five.Sensor({ pin: pins[4], freq: 100 });
	console.log(`Canais setados: ${pins}`);
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
// // gerar o PID
// function generatePID(temp) {
// 	const KP = 10, KI = 5, H = 0.1, IMAX = 5, KD = 0;
// 	// const KP = 1 / 0.6, KI = KP / 1.77, H = 0.1, IMAX = 5, KD = KP * 6;
// 	e = temp - setPoint;
// 	let p = KP * e;
// 	let i = iant + (KI * H) * (e + eant);
// 	if (i > IMAX) {
// 		i = IMAX;
// 	} else if (i < 0) {
// 		i = 0;
// 	}
// 	let d = (KD / H) * (e - eant);
// 	// let u;
// 	// console.log(e);

// 	if (e > 0.2) {
// 		u = 0;
// 	} else if (e < -1) {
// 		u = 5;
// 	}
// 	// let u = p + i + d;
// 	// if (u > IMAX) {
// 	// 	u = IMAX;
// 	// } else if (u < 0) {
// 	// 	u = 0;
// 	// }
// 	eant = e;
// 	iant = i;
// 	return u;
// }
