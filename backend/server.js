const http = require('http');
const io = require('socket.io')(http);
const five = require('johnny-five');
const cmd = require('node-cmd');
const Controller = require('node-pid-controller');
const fs = require('fs');

let KP = 1 / 0.3, KI = KP / 1.27, H = 0.1, KD = KP * 6;
// a porta abaixo é válida para Linux, no Windows ela precisa ser COM1 ou algo parecido
// descomentar depois 
const board = new five.Board({ port: 'COM3' });

let setPoint = 30;
let u, e = 0;    // valor de saída e valor do erro  
let therm1, therm2, therm3, therm4, therm5;  // sensores 
let pidInterval, onOffInterval, offInterval, savingInterval; // será usado para armazenar os setIntervals 
let offControlValue = 0;
let fileName;
let dryerBusy = false;

let server;
io.listen(3000);
console.log('Websocket funcionando na porta ' + 3000);

// descomentar depois
board.on('ready', startApplication);

// startApplication();

// função para startar a aplicaçãos
function startApplication() {
    setPins();
    board.pinMode(9, five.Pin.PWM);
    startControling('Malha aberta'); 
    io.on('connection', socket => {
        startSending(socket, socket.id);               // começa a mandar os dados para os clientes
        startSocketListening(socket);
    });
}

function startSocketListening(socket) {
    socket.on('vueConnected', () => console.log('Cliente Vue conectado'));
    socket.on('setPins', pins => setPins(pins));      // mudar os canais do board 
    socket.on('changingSetPoint', setPointReceived => setSetPoint(setPointReceived, socket)); // mudar o setpoint 
    socket.on('startExperiment', controlMode => startExperiment(controlMode));
    socket.on('stopExperiment', () => stopExperiment(socket));
    socket.on('switchOffController', () => switchOffController());
    socket.on('getSetPoint', () => socket.emit('changeSetPoint', setPoint));
    socket.on('getHardwareState', () => socket.emit('setHardwareState', dryerBusy));
    socket.on('setPidConsts', (pidConsts) => setPidConsts(pidConsts));
}

function setPidConsts (pidConsts) {
    H = Number(pidConsts.H);
    KP = 1 / (pidConsts.KP / 100);
    KD = KP * pidConsts.KD;
    KI = KP / pidConsts.KI;
    
    console.log('------------------------');
    console.log('Novas constantes de PID ');
    console.log('------------------------');
    console.log('KP: ', KP);
    console.log('KD: ', KD);
    console.log('KI: ', KI);
    console.log('H: ', H);
}

// começa o experimento
function startExperiment(controlMode) {
    dryertBusy = true;
    const time = new Date();
    fileName = `${time.getDate()}-${time.getMonth()}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
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
    startControling('Malha aberta');
    octavePlot(fileName, socket);
}
// mudar voltagem de 0 a 3 para malha aberta 
function switchOffController() {
    offControlValue = offControlValue == 0 ? 3 : 0;
    clearInterval(offControling);
    offControling(offControlValue);
}
// interpreta o script draw.m para o Octave gerar a imagem do gráfico e logo após starta o servidor para a imagem
function octavePlot(fileName, socket) {
    cmd.get(`octave-cli backend/draw.m "${fileName}"`, (e, dt) => {
        if (!e) {
            console.log('Gráfico gerado');
            fs.readFile('./experiments/currentPlot.png', (err, data) => {
                if (err) throw err;
                if (server) {
                    server.close(); 
                }
                server = http.createServer( (req, res)  => {
                  res.writeHead(200, {'Content-Type': 'image/jpeg'});
                  res.end(data); 
                }).listen(8124);
                console.log('The chart can be accessed in: http://localhost:8124/');
                socket.emit('chartReady');
            });
        } else {
            console.log(e);
        }
    });
}

// função para setar novos canais no board 
function setPins(pins = ['A1', 'A2', 'A3', 'A4', 'A5']) {
    
    // descomentar depois
    therm1 = new five.Sensor({ pin: pins[0], freq: 100 });
    therm2 = new five.Sensor({ pin: pins[1], freq: 100 });
    therm3 = new five.Sensor({ pin: pins[2], freq: 100 });
    therm4 = new five.Sensor({ pin: pins[3], freq: 100 });
    therm5 = new five.Sensor({ pin: pins[4], freq: 100 });

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
    offInterval = setInterval(() => {
        board.analogWrite(9, scale(value));
    }, 100);
}
// controle por liga/desliga 
function onOffControling() {
    onOffInterval = setInterval(() => {
        u = getTemp() < setPoint ? 255 : 0;
        board.analogWrite(9, u);
    }, 100);
}
// controle por pid 
function pidControling() {
    pidInterval = setInterval(() => {
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

        board.analogWrite(9, u);
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
// começa a mandar os dados para o board
function startSending(socket, clientId) {

    // o u gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5 
    setInterval(() => socket.emit('newData', { type: 'Control', value: scale(u, 'to [0,5]') }), 500);

    console.log('Mandando dados para ' + clientId);
    
    // passar o setPoint atual para o novo usuário conectado
    socket.emit('changeSetPoint', setPoint);

    setInterval(() => {
        socket.emit('newData', {type: 'Temperature', value: getTemp()});
        socket.emit('newData', {type: 'Mass', value: Math.random() * 1});
    }, 500);

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