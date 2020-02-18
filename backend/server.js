const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const five = require('johnny-five');
const path = require('path');
const cmd = require('node-cmd');
const Controller = require('node-pid-controller');

// a porta abaixo é válida para Linux, no Windows ela precisa ser COM1 ou algo parecido

// descomentar depois 
// const arduino = new five.Board({ port: '/dev/ttyACM0' });

let setPoint = 30;
let u, e = 0;    // valor de saída e valor do erro  
let therm1, therm2, therm3, therm4, therm5;  // sensores 
let pidInterval, onOffInterval, offInterval, savingInterval; // será usado para armazenar os setIntervals 
let offControlValue = 0;
let fileName;
let dryerBusy = false;

const port = 3000;
io.listen(port);
console.log('websocket funcionando na porta ' + port);

// descomentar depois
// arduino.on('ready', startApplication);

startApplication();

// função para startar a aplicaçãos
function startApplication() {
    setPins();
    // arduino.pinMode(9, five.Pin.PWM);
    startControling('Malha aberta'); 
    io.on('connection', socket => {
        startSending(socket, socket.id);               // começa a mandar os dados para os clientes
        socket.on('vueConnected', (data) => console.log('Cliente Vue conectado'));
        socket.on('setPins', pins => setPins(pins));      // mudar os canais do Arduino 
        socket.on('changingSetPoint', setPointReceived => setSetPoint(setPointReceived, socket)); // mudar o setpoint 
        socket.on('startExperiment', controlMode => startExperiment(controlMode, socket));
        socket.on('stopExperiment', () => stopExperiment(socket));
        socket.on('switchOffController', () => switchOffController());
        socket.on('getSetPoint', () => socket.emit('changeSetPoint', setPoint));
    });
}
// começa o experimento
function startExperiment(controlMode, socket) {
    if (!dryerBusy) {
        dryertBusy = true;
        const time = new Date();
        fileName = `${time.getDay()}-${time.getMonth()}-${time.getUTCFullYear()}-${time.getHours()}-${time.getSeconds()}`;
        if (controlMode != 'Malha aberta') {
            startSaving(fileName);
        }
        clearInterval(offInterval);
        clearInterval(onOffInterval);
        clearInterval(pidInterval);
        startControling(controlMode);
        socket.emit('dryerAvaliable')
    } else {
        socket.emit('dryerBusy', null);
    }
}
// parar experimento 
function stopExperiment(socket) {
    dryerBusy = false;
    clearInterval(offInterval);
    clearInterval(onOffInterval);
    clearInterval(pidInterval);
    clearInterval(savingInterval);
    startControling('Malha aberta');
    octavePlot(fileName, socket);
}
// mudar voltagem de 0 a 3 para malha aberta 
function switchOffController() {
    offControlValue = offControlValue == 0 ? 3 : 0;
    clearInterval(offControling);
    offControling(offControlValue);
}
// interpreta o script draw.m para o Octave gerar a imagem do gráfico 
function octavePlot(fileName, socket) {
    cmd.get(`octave-cli backend/draw.m "${fileName}"`, (e, dt) => {
        if (!e) {
            console.log('Gráfico gerado');
            socket.emit('chartReady', null); // confirmar pro cliente que o gráfico está pronto
        } else {
            console.log(e);
        }
    });
}
// função para setar novos canais no Arduino 
function setPins(pins = ['A5', 'A4', 'A3', 'A2', 'A1']) {
    
    // descomentar depois
    // therm1 = new five.Sensor({ pin: pins[0], freq: 100 });
    // therm2 = new five.Sensor({ pin: pins[1], freq: 100 });
    // therm3 = new five.Sensor({ pin: pins[2], freq: 100 });
    // therm4 = new five.Sensor({ pin: pins[3], freq: 100 });
    // therm5 = new five.Sensor({ pin: pins[4], freq: 100 });

    // comentar depois 
    therm1 = {value: 0};
    therm2 = {value: 0};
    therm3 = {value: 0};
    therm4 = {value: 0};
    therm5 = {value: 0};

    setInterval(() => therm1.value = Math.round(Math.random() * 512 + 200), 500);
    setInterval(() => therm2.value = Math.round(Math.random() * 512 + 200), 500);
    setInterval(() => therm3.value = Math.round(Math.random() * 512 + 200), 500);
    setInterval(() => therm4.value = Math.round(Math.random() * 512 + 200), 500);
    setInterval(() => therm5.value = Math.round(Math.random() * 512 + 200), 500);

    console.log(`Canais setados: ${pins}`);
}
// comecça a salvar em arquivo txt 
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
        case 'Malha aberta': offControling(0); break; // controle desligado, valor constante de 3v
    }
}
// controle desligado, valor constante de 3v
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
// retorna a temperatura media
function getTemp() {
    return ((toCelsius(therm1.value) + toCelsius(therm2.value) +
        toCelsius(therm3.value) + toCelsius(therm4.value) + toCelsius(therm5.value)) / 5);
}
// mudar o setPoint 
function setSetPoint(newSetPoint, socket) {
    console.log(newSetPoint);
    setPoint = Number(newSetPoint); // garantir que será um número
    socket.emit('changeSetPoint', setPoint); // enviando para o cliente atual 
    socket.broadcast.emit('changeSetPoint', setPoint); // enviando o resto dos clientes
    console.log(`Set point mudado para ${setPoint}`);
}
// começa a mandar os dados para o arduino
function startSending(socket, clientId) {

    // o u gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5 
    setInterval(() => socket.emit('newData', { type: 'Controle', value: scale(u, 'to [0,5]') }), 500);

    console.log('Mandando dados para ' + clientId);
    
    // passar o setPoint atual para o novo usuário conectado
    socket.emit('changeSetPoint', setPoint);
    // quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 

    // tempSend(socket, therm1, 'newTemperature1');
    // tempSend(socket, therm2, 'newTemperature2');
    // tempSend(socket, therm3, 'newTemperature3');
    // tempSend(socket, therm4, 'newTemperature4');
    // tempSend(socket, therm5, 'newTemperature5');
    setInterval(() => {
        let temperature = (toCelsius(therm1.value) + toCelsius(therm2.value) + toCelsius(therm3.value) + toCelsius(therm4.value) + toCelsius(therm5.value)) / 5;
        socket.emit('newData', {type: 'Temperatura', value: temperature});
        socket.emit('newData', {type: 'Massa', value: Math.random() * 1});
    }, 500);

}
// faz os dados de um termistor começarem a ser mandados pros clientes via socket.io
function tempSend(socket, therm, socketMsg) {
    // setInterval(() => socket.emit(socketMsg, toCelsius(Math.random() * 100 + 420)), 400);

    // descomentar depois 
    // therm.on('data', () => socket.emit(socketMsg, toCelsius(therm.value)));

    // comentar depois 
    // setInterval(() => socket.emit(socketMsg, toCelsius(therm.value)), 500);
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