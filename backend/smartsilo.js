module.exports = {
    // comecça a salvar em arquivo txt 
    startSaving() {
        setInterval(() => {
            hist += `t: ${getTemp().toFixed(2)}, u: ${u.toFixed(2)}, e: ${e.toFixed(2)}\n`;
            fs.writeFile(__dirname + '/hist.txt', hist, error => {
                if (error) console.log(error);
            });
        }, 500);
    },
    // retorna a temperatura media
    getTemp() {
        return ((toCelsius(therm1.value) + toCelsius(therm2.value) +
            toCelsius(therm3.value) + toCelsius(therm4.value) + toCelsius(therm5.value)) / 5);
    },
    // mudar o setPoint 
    setSetPoint(socket, newSetPoint) {
        setPoint = newSetPoint;
        socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual 
        console.log(`Set point mudado para ${setPoint}`);
    },
    // setar canais do A5 ao A1 por padrão 
    setPins(pins = ['A5', 'A4', 'A3', 'A2', 'A1']) {
        therm1 = new five.Sensor({ pin: pins[0], freq: 100 });
        therm2 = new five.Sensor({ pin: pins[1], freq: 100 });
        therm3 = new five.Sensor({ pin: pins[2], freq: 100 });
        therm4 = new five.Sensor({ pin: pins[3], freq: 100 });
        therm5 = new five.Sensor({ pin: pins[4], freq: 100 });
        console.log(`Canais setados: ${pins}`);
    },
    // começa a mandar os dados para o arduino
    startSending(socket, clientId) {
        setInterval(() => {
            u = generatePID(getTemp());
            socket.emit('controlBitValue', u);
        }, 500);
        console.log('Mandando dados para ' + clientId);
        // passar o setPoint atual para o novo usuário conectado
        socket.emit('changeSetPoint', setPoint);
        // quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
        tempSend(socket, therm1, 'newTemperature1');
        tempSend(socket, therm2, 'newTemperature2');
        tempSend(socket, therm3, 'newTemperature3');
        tempSend(socket, therm4, 'newTemperature4');
        tempSend(socket, therm5, 'newTemperature5');
    },
    // faz os dados de um termistor começarem a ser mandados pros clientes via socket.io
    tempSend(socket, therm, socketMsg) {
        // setInterval(() => socket.emit(socketMsg, toCelsius(Math.random() * 100 + 420)), 400);
        therm.on('data', () => socket.emit(socketMsg, toCelsius(therm.value)));
    },
    // converte valor ADC em Celsius
    toCelsius(rawADC) {
        let temp = Math.log(((10240000 / rawADC) - 10000));
        temp = 1 / (0.001129148 + (0.000234125 * temp) + (0.0000000876741 * temp ** 3));
        temp = temp - 273.15;   // Kelvin para Celsius 
        return temp;
    },
    // retorna correspondente do valor na escala de 0 a 255  
    scaleValue(value) {
        let from = [0, 5], to = [0, 255];
        var scale = (to[1] - to[0]) / (from[1] - from[0]);
        var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
        return Math.floor(capped * scale + to[0]);
    },
    // gerar o PID
    generatePID(temp) {
        const KP = 10, KI = 5, H = 0.1, IMAX = 5, KD = 0;
        // const KP = 1 / 0.6, KI = KP / 1.77, H = 0.1, IMAX = 5, KD = KP * 6;
        e = temp - setPoint;
        let p = KP * e;
        let i = iant + (KI * H) * (e + eant);
        if (i > IMAX) {
            i = IMAX;
        } else if (i < 0) {
            i = 0;
        }
        let d = (KD / H) * (e - eant);
        // let u;
        // console.log(e);

        if (e > 0.2) {
            u = 0;
        } else if (e < -1) {
            u = 5;
        }
        // let u = p + i + d;
        // if (u > IMAX) {
        // 	u = IMAX;
        // } else if (u < 0) {
        // 	u = 0;
        // }
        eant = e;
        iant = i;
        return u;
    }
}