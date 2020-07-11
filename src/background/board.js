// const Firmata = require('firmata');
// const board = new Firmata('/dev/ttyUSB0');
const { toCelsius, scaleOutput } = require('./utils/math-operators');
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
    // this.board = new Firmata(boardPath);
    this.pidConsts = {
      pb: 30, // proportional band width
      ti: 1.27, // integral time
      td: 6, // derivativeTime
    };
  }
  onReady(callback) {
    this.board.on('ready', callback);
  }
  getVoltage() {
    return scaleOutput(this.output, 'to [0,5]');
  }
  getTemp() {
    const sumTemps = (total, el) => total + toCelsius(el.value);
    const averageTemp = this.therms.reduce(sumTemps, 0) / 5;
    return averageTemp;
  }
  setSetPoint(evt, newSetPoint) {
    this.setpoint = Number(newSetPoint);
  }
  setPidConsts(newPidConsts) {
    this.pidConsts = newPidConsts;
  }
  setOpenLoopVoltage(evt, voltage) {
    this.openLoopVoltage = voltage;
    clearInterval(this.openLoopTimeLapse);
    this.startControlling('Open loop');
  }
  setPins(evt, pins = ['A0', 'A1', 'A2', 'A3', 'A4']) {
    // descomentar depois
    // for (let i = 0; i < 5; i++) {
    //   this.therms[i] = new Sensor({ pin: pins[i], freq: 100 });
    // }

    // comentar depois
    this.therms[0] = { value: 0 };
    this.therms[1] = { value: 0 };
    this.therms[2] = { value: 0 };
    this.therms[3] = { value: 0 };
    this.therms[4] = { value: 0 };

    this.therms.forEach((therm) => {
      setInterval(
        () => (therm.value = Math.round(Math.random() * 70 + 400)),
        500
      );
    });
  }
  stopControlling() {
    clearInterval(this.openLoopTimeLapse);
    clearInterval(this.onOffTimeLapse);
    clearInterval(this.pidTimeLapse);
  }
  startControlling(mode) {
    switch (mode) {
      case 'PID':
        this.pidTimeLapse = setInterval(() => this.controlViaPid(), 100);
        break;
      case 'ON/OFF':
        this.onOffTimeLapse = setInterval(() => this.controlViaOnOff(), 100);
        break;
      case 'Open loop':
        this.output = scaleOutput(this.openLoopVoltage);
        this.openLoopTimeLapse = setInterval(() => {
          // arduino.analogWrite(9, this.output);
        }, 100);
        break;
    }
  }
  controlViaOnOff() {
    this.output = this.getTemp() < this.setpoint ? 255 : 0;
    // arduino.analogWrite(9, this.output);
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
    // arduino.analogWrite(9, this.output);
  }
};
