// const { Sensor, Pin, Board } = require('johnny-five');
const http = require('http');
const io = require('socket.io')(http);
const Controller = require('node-pid-controller');
const { promisify } = require('util');
const fs = require('fs');
const cmd = require('node-cmd');
const { toCelsius, scale } = require('./mathOperators');

const express = require('express');
const routes = express.Router();
const app = express();
const cors = require('cors');
const httpPort = 8124;

routes.get('/', async (req, res) => {
    const readFile = promisify(fs.readFile);
    file = await readFile('./experiments/currentPlot.png');
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end(file); 
});

routes.post('/pins', (req, res) => {
    setPins(req.body.pins);
    res.sendStatus(201);
});

app.use(cors());
app.use(express.json());
app.use(routes);
app.listen(httpPort);
// a porta abaixo é válida para Linux, no Windows ela precisa ser COM1 ou algo parecido
// descomentar depois 
// const arduino = new Board({ port: '/dev/ttyACM0' });

let file;

let setPoint = 30;
let u, e = 0;    // valor de saída e valor do erro  
let therms = [];  // sensores 
let pidInterval, onOffInterval, offInterval, savingInterval; // será usado para armazenar os setIntervals 
let offControlValue = 0;
let fileName;
let dryerBusy = false;

io.listen(3000);
console.log('Websocket funcionando na porta ' + 3000);

// descomentar depois
// arduino.on('ready', startApplication);

startApplication();

// função para startar a aplicaçãos
function startApplication() {
    setPins();
 
    // arduino.pinMode(9, Pin.PWM);
    startControling('Open loop'); 
    io.on('connection', socket => {
        startSending(socket, socket.id);               // começa a mandar os dados para os clientes
        startSocketListening(socket);
    });
}

function startSocketListening(socket) {    
    // socket.on('changingSetPoint', setPointReceived => setSetPoint(setPointReceived, socket)); // mudar o setpoint 
    
    routes.post('/setpoint', (req, res) => {
        setSetPoint(req.body.setpoint, socket);
        res.sendStatus(201);
    });
    
    socket.on('startExperiment', startExperiment);
    socket.on('stopExperiment', () => stopExperiment(socket));
    socket.on('switchOffController', () => switchOffController());
    socket.on('getSetPoint', () => socket.emit('changeSetPoint', setPoint));
    socket.on('getHardwareState', () => socket.emit('setHardwareState', dryerBusy));
}

// começa o experimento
function startExperiment(controlMode) {
    dryertBusy = true;
    const time = new Date();
    fileName = `${time.getDate()}-${time.getMonth()+1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
    startSaving(fileName);
    clearInterval(offInterval);
    clearInterval(onOffInterval);
    clearInterval(pidInterval);
    startControling(controlMode);
}
// parar experimento 
function stopExperiment(socket) {
    dryerBusy = false;
    clearInterval(offInterval);
    clearInterval(onOffInterval);
    clearInterval(pidInterval);
    clearInterval(savingInterval);
    startControling('Open loop');
    octavePlot(fileName, socket);
}
// mudar voltagem de 0 a 3 para malha aberta 
function switchOffController() {
    offControlValue = offControlValue == 0 ? 3 : 0;
    clearInterval(offControling);
    offControling(offControlValue);
}

// interpreta o script draw.m para o Octave gerar a imagem do gráfico e logo após starta o servidor para a imagem
async function octavePlot(fileName, socket) {
    const cmdGet = promisify(cmd.get);
    
    await cmdGet(`octave-cli ./src/octavePlot.m "${fileName}"`);
    
    socket.emit('chartReady');
    console.log('The chart can be accessed in: http://localhost:8124/');
}

// função para setar novos canais no Arduino 
function setPins(pins = ['A0', 'A1', 'A2', 'A3', 'A4']) {
    
    // descomentar depois
    // therm1 = new Sensor({ pin: pins[0], freq: 100 });
    // therm2 = new Sensor({ pin: pins[1], freq: 100 });
    // therm3 = new Sensor({ pin: pins[2], freq: 100 });
    // therm4 = new Sensor({ pin: pins[3], freq: 100 });
    // therm5 = new Sensor({ pin: pins[4], freq: 100 });

    // comentar depois 
    therms[0] = {value: 0};
    therms[1] = {value: 0};
    therms[2] = {value: 0};
    therms[3] = {value: 0};
    therms[4] = {value: 0};

    therms.forEach(therm => {
        setInterval(() => therm.value = Math.round(Math.random() * 70 + 400), 500);
    });

    console.log(`Pins setted: ${pins}`);
}
// começa a salvar em arquivo txt 
function startSaving(nomeArq) {
    savingInterval = setInterval(() => {
        cmd.run(`echo ${getTemp()},${scale(u, 'to [0,5]')},${e},${setPoint} >> experiments/data/${nomeArq}.txt`);
    }, 250);
}
// começa a controlar o secador de grãos a partir do modo passado 
function startControling(mode) {
    switch (mode) {
        case 'PID': pidControling(); break;       // controle por pid
        case 'ON/OFF': onOffControling(); break;  // controle por liga/desliga
        case 'Open loop': offControling(0); break; // controle desligado, valor constante de 3v
    }
}
// controle por malha aberta 
function offControling(value) {
    u = scale(value);

    // descomentar depois  
    // offInterval = setInterval(() => {
    //     arduino.analogWrite(9, scale(value));
    // }, 100);
}
// controle por liga/desliga 
function onOffControling() {
    onOffInterval = setInterval(() => {
        u = getTemp() < setPoint ? 255 : 0;

        // descomentar depois
        // arduino.analogWrite(9, u);
    }, 100);
}
// controle por pid 
function pidControling() {
    pidInterval = setInterval(() => {
        const KP = 1 / 0.3, KI = KP / 1.27, H = 0.1, KD = KP * 6;
        let control = new Controller(KP, KI, KD, H);
        control.setTarget(setPoint);
        let output = getTemp();
        e = getTemp() - setPoint;
        u = control.update(output);
        if (u < 2 && setPoint > 30)
            u *= 1.05;
        if (u > 255)
            u = 255;
        else if (u < 0)
            u = 0;

        // descomentar depois
        // arduino.analogWrite(9, u);
    }, 100);
}

// returns the average temp of the therms array
const getTemp = () => {
    const sumTemps = (total, el) => total + toCelsius(el.value);
    const averageTemp = therms.reduce(sumTemps, 0) / 5;
    return averageTemp;
};

// mudar o setPoint 
function setSetPoint(newSetPoint, socket) {
    console.log(newSetPoint);
    setPoint = Number(newSetPoint); // garantir que será um número
    socket.emit('changeSetPoint', setPoint); // enviando para o cliente atual 
    socket.broadcast.emit('changeSetPoint', setPoint); // enviando o resto dos clientes
    console.log(`Setpoint changed to: ${setPoint}`);
}
// começa a mandar os dados para o arduino
function startSending(socket, clientId) {

    // o u gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5 
    setInterval(() => socket.emit('newData', { type: 'Control', value: scale(u, 'to [0,5]') }), 500);

    console.log('Sending data to ' + clientId);
    
    // passar o setPoint atual para o novo usuário conectado
    socket.emit('changeSetPoint', setPoint);

    setInterval(() => {
        socket.emit('newData', {type: 'Temperature', value: getTemp()});
        socket.emit('newData', {type: 'Mass', value: Math.random() * 1});
    }, 500);
}