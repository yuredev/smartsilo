const Firmata = require('firmata');
const Controller = require('node-pid-controller');

module.exports = class Board {
  constructor(boardPath) {
    this.setpoint = 30;
    this.errorValue = null;
    this.output = 0; // save the output in the scale of 0 to 255
    this.openLoopTimeLapse = null;
    this.onOffTimeLapse = null;
    this.pidTimeLapse = null;
    this.openLoopVoltage = 0;
    this.therms = [];
    this.isControlling = false;
    this.board = new Firmata(boardPath);
    this.pidConsts = {
      pb: 30, // proportional band width
      ti: 1.27, // integral time
      td: 6, // derivativeTime
    };
  }
  /**
   * Executa uma função quando a placa estiver pronta
   * @param {Function} callback Função a ser executada
   */
  onReady(callback) {
    this.board.on('ready', callback);
  }
  /**
   * Retorna o valor de voltagem da saída PWM da placa
   * @returns {Number} Voltagem
   */
  getVoltage() {
    return this.scaleOutput(this.output, 'to [0,5]');
  }
  /**
   * Converte em Celsius o valor bruto do termistor lido da placa
   * @param {Number} rawADC valor entre 0 e 1023 lido da placa
   * @returns {Number} Temperatura em Celsius
   */
  toCelsius(rawADC) {
    let temp = Math.log(10240000 / rawADC - 10000);
    temp = 1 / (0.001129148 + 0.000234125 * temp + 0.0000000876741 * temp ** 3);
    temp = temp - 273.15; // Kelvin para Celsius
    return temp;
  }
  // retorna correspondente do valor em outra escala
  scaleOutput(value, inverse = false) {
    let from;
    let to;
    if (!inverse) {
      (from = [0, 5]), (to = [0, 255]);
    } else {
      (from = [0, 255]), (to = [0, 5]);
    }
    let scale = (to[1] - to[0]) / (from[1] - from[0]);
    let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    return capped * scale + to[0];
  }
  /**
   * Retorna a temperatura média em °C, lida dos sensores
   * ligados a placa
   * @returns {Number} Temperatura média em °C
   */
  getTemp() {
    const sumTemps = (acc, cur) => acc + this.toCelsius(cur);
    const averageTemp = this.therms.reduce(sumTemps, 0) / this.therms.length;
    return averageTemp;
  }
  updateSetpoint(newSetPoint) {
    this.setpoint = Number(newSetPoint);
  }
  updatePidConsts(newPidConsts) {
    this.pidConsts = newPidConsts;
  }
  updateOpenLoopVoltage(voltage) {
    this.openLoopVoltage = voltage;
    clearInterval(this.openLoopTimeLapse);
    this.startControlling('Open loop');
  }
  updatePins(...pins) {
    for (let i = 0; i < pins.length; i++) {
      this.board.analogRead(pins[i], (value) => {
        this.therms[i] = value;
      });
    }
  }
  stopControlling() {
    this.isControlling = false;
    clearInterval(this.openLoopTimeLapse);
    clearInterval(this.onOffTimeLapse);
    clearInterval(this.pidTimeLapse);
  }
  startControlling(mode) {
    this.board.pinMode(9, this.board.MODES.PWM);
    switch (mode) {
      case 'PID':
        this.isControlling = true;
        this.pidTimeLapse = setInterval(() => this.controlViaPid(), 100);
        break;
      case 'ON/OFF':
        this.isControlling = true;
        this.onOffTimeLapse = setInterval(() => this.controlViaOnOff(), 100);
        break;
      case 'Open loop':
        this.output = this.scaleOutput(this.openLoopVoltage);
        this.openLoopTimeLapse = setInterval(() => {
          this.board.pwmWrite(9, this.output);
        }, 100);
        break;
    }
  }
  controlViaOnOff() {
    this.output = this.getTemp() < this.setpoint ? 255 : 0;
    this.board.pwmWrite(9, this.output);
  }
  controlViaPid() {
    const { pb, ti, td } = this.pidConsts;
    const KP = 1 / (pb / 100); // proportionalBand
    const KI = KP / ti; // integrativeTime
    const KD = KP * td; // derivativeTime
    const H = 0.1;

    const pidController = new Controller(KP, KI, KD, H);
    const temperature = this.getTemp();
    this.errorValue = this.getTemp() - this.setpoint;

    pidController.setTarget(this.setpoint);
    this.output = pidController.update(temperature);

    if (this.output < 2 && this.setpoint > 30) {
      this.output *= 1.05;
    }
    if (this.output > 255) {
      this.output = 255;
    } else if (this.output < 0) {
      this.output = 0;
    }
    this.board.pwmWrite(9, this.output);
  }
};
