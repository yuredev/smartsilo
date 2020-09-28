const Firmata = require('../esp32_firmata/firmata/lib/firmata');

const DIGITAL_WRITE = 0x01;
const ADC_READ = 0x02;
const DIGITAL_READ = 0x03;
const PWM_OUTPUT = 0x04;
const PWM_CHANNEL = 0;

/**
 * A Class to handle with the ESP32 inputs and outputs
 */
class Esp32IO {
  /**
   * The default constructor of the Esp32IO class
   * @param {string} usbPath The usb path for the board
   * @param {Object} config The esp32 configuration
   */
  constructor(usbPath, { pwmFreq = 10, pwmResolution = 8 }) {
    this.firmata = new Firmata(usbPath);
    this.HIGH = 1;
    this.LOW = 0;
    this.pwmFreq = pwmFreq;
    this.pwmResolution = pwmResolution;
  }
  /**
   * Execute something after the board is ready
   * @param {Function} callback the callback to be called when the board is ready
   */
  onReady(callback) {
    if (!callback) {
      throw new Error('Missing callback');
    }
    this.firmata.on('ready', callback);
  }
  /**
    Asks the ESP32 to read analog data. 
    @param {number} pin The pin to read analog data
    @param {Function} callback A function to call when we have the analog data.
   */
  analogRead(pin, callback) {
    if (!callback) {
      throw new Error('Missing callback');
    }
    this.firmata.sysexCommand([ADC_READ, pin]);
    this.firmata.sysexResponse(ADC_READ, (data) => {
      const rawValue = Firmata.decode(data);
      callback(rawValue.reduce((acc, cur) => acc + cur));
    });
  }
  /**
    Write a PWM value Asks the ESP32 to write an analog message.
    @param {number} pin The pin to write analog data to.
    @param {number} pwmValue The data to write to the pin between 0 and 255
   */
  analogWrite(pin, pwmValue) {
    const maxValue = 2 ** this.pwmResolution - 1;
    if (pwmValue > maxValue) {
      throw new Error('Value to high for the pwm resolution');
    }
    const slicedPwmValue = pwmValue > 255 ? slicePwmValue(pwmValue) : [pwmValue];
    this.firmata.sysexCommand([
      PWM_OUTPUT,
      pin,
      PWM_CHANNEL,
      this.pwmFreq,
      this.pwmResolution,
      ...slicedPwmValue,
    ]);
  }
  /**
    Asks the ESP32 to read digital data. 
    @param {number} pin The pin to read data from
    @param {Function} callback The function to call when data has been received
   */
  digitalRead(pin, callback) {
    if (callback) {
      throw new Error('Missing callback');
    }
    this.firmata.sysexCommand([DIGITAL_READ, pin]);
    this.firmata.sysexResponse(DIGITAL_READ, (data) => {
      callback(Firmata.decode(data)[0]);
    });
  }
  /**
    Asks the Esp32 to write a value to a digital pin
    @param {number} pin The pin you want to write a value to.
    @param {number} value The value you want to write. Must be 0 or 1
   */
  digitalWrite(pin, value) {
    if (value !== 0 && value !== 1) {
      throw new Error('Invalid digital value. Must be 0 or 1');
    }
    this.firmata.sysexCommand([DIGITAL_WRITE, pin, value]); //command, argc, argv = data
  }
}
/**
 * Slice the pwm value in 8 bits parts
 * @param {number} pwmValue The pwmValue to be spliced
 * @returns {number[]} An array containing the pwmValue
 * spliced in 8 bit values
 */
function slicePwmValue(pwmValue) {
  const quotient = Math.trunc(pwmValue / 255);
  const rest = pwmValue % 255;
  const splicedPwmValue = [];
  for (let i = 0; i < quotient; i++) {
    splicedPwmValue.push(255);
  }
  splicedPwmValue.push(rest);
  return splicedPwmValue;
}

module.exports = Esp32IO;
