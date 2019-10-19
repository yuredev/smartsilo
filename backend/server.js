const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend
let setPoint = null; // valor de setpoint passado pelo usuário  
let pinsWasInit = false

// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: "COM6" });
let therm1, therm2;
// executar quando o arduino estiver pronto
arduino.on('ready', () => {
	io.on('connection', socket => {
		if (!pinsWasInit)
			setPins();;
		socket.on('setPins', pins => setPins(pins));
		startSending(socket, socket.id);
	});
	// ouvir na porta declarada 
	http.listen(port, () => {
		console.log('============ SISTEMA PRONTO ============');
		console.log(`   Abrir em: http://localhost:${port}`);
		console.log('>> ========================================');
	});
});
// setar canais A0 e A1 por padrão 
function setPins(pins = ['A0', 'A1']) {
	therm1 = new five.Sensor({ pin: pins[0] });
	therm2 = new five.Sensor({ pin: pins[1] });
	console.log(`Canais setados: ${pins[0]} e ${pins[1]}`);
	pinsWasInit = true;
}
// começa a mandar os dados para o arduino
function startSending(socket, clientId) {
	console.log('Mandando dados para ' + clientId);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
	socket.on('changingSetPoint', newSetPoint => {
		setPoint = newSetPoint;
		socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual 
		console.log(`Set point mudado para ${setPoint}`);
	});
	tempSend(socket, therm1, 'newTemperature1');
	tempSend(socket, therm2, 'newTemperature2');
	setInterval(() => {
		socket.emit('controlBitValue', (toCelsius(therm1.value) > setPoint && toCelsius(therm2.value) > setPoint) ? 1 : 0);
	}, 400);
}
// faz os dados de um potenciômetro começarem a ser mandados pros clientes via socket.io
function tempSend(socket, therm, socketMsg) {
	// setInterval(() => socket.emit(socketMsg, toCelsius(Math.random() * 100 + 420)), 400);
	therm.on('change', () => {
		setInterval(() => socket.emit(socketMsg, therm.value), 400);
	});
}
// converte valor ADC em Celsius
function toCelsius(rawADC) {
	let temp = Math.log(((10240000 / rawADC) - 10000));
	temp = 1 / (0.001129148 + (0.000234125 * temp) + (0.0000000876741 * temp ** 3));
	temp = temp - 273.15;   // Kelvin para Celsius 
	return temp;
}
