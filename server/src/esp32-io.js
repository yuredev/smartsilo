const Firmata = require('../esp32_firmata/firmata/lib/firmata');

const ADCREAD = 0x02;
const PWMOUTPUT = 0x04;
const pwmChannel = 0;
const pwmFreq = 10;
const pwmResolution = 8;

module.exports = class Esp32 {
  constructor(usbPath) {
    this.firmata = new Firmata(usbPath);
  }
  onReady(callback) {
    this.firmata.on('ready', callback);
  }
  analogRead(pin, callback) {
    if (!callback) {
      throw new Error('Missing Callback');
    }
    firmata.sysexCommand([ADCREAD, pin]);
    firmata.sysexResponse(ADCREAD, (data) => {
      const rawValue = Firmata.decode(data);
      callback(rawValue.reduce((acc, cur) => acc + cur))
    });
  }
  analogWrite(pinToWrite, pwmValue) {
    this.firmata.sysexCommand([
      PWMOUTPUT,
      pinToWrite,
      pwmChannel,
      pwmFreq,
      pwmResolution,
      pwmValue,
    ]);
  }
}
