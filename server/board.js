const Firmata = require('firmata');
// const board = new Firmata('/dev/ttyUSB0');
const { toCelsius, scaleOutput } = require('../desktop_app/src/background/utils/math-operators');
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
    this.board = new Firmata(boardPath);
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
    const sumTemps = (acc, cur) => acc + toCelsius(cur);
    const averageTemp = this.therms.reduce(sumTemps, 0) / this.therms.length;
    return averageTemp;
  }
  setSetPoint(newSetPoint) {
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
  setPins(...pins) {
    for (let i = 0; i < pins.length; i++) {
      this.board.analogRead(pins[i], (value) => {
        this.therms[i] = value;
      });
    }
  }
  stopControlling() {
    clearInterval(this.openLoopTimeLapse);
    clearInterval(this.onOffTimeLapse);
    clearInterval(this.pidTimeLapse);
  }
  startControlling(mode) {
    this.board.pinMode(9, this.board.MODES.PWM);
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
