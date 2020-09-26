const Firmata = require('../esp32_firmata/firmata/lib/firmata');

const DIGITAL_WRITE = 0x01;
const ADC_READ = 0x02;
const DIGITAL_READ = 0x03;
const PWM_OUTPUT = 0x04;
const PWM_CHANNEL = 0;
const PWM_FREQ = 10;
const PWM_RESOLUTION = 8;

/**
 * A Class to handle with the ESP32 inputs and outputs
 */
class Esp32IO {
  /**
   * The default constructor of the Esp32IO class
   * @param {string} usbPath the usb path for the board
   */
  constructor(usbPath) {
    this.firmata = new Firmata(usbPath);
    this.HIGH = 1;
    this.LOW = 0;
  }
  /**
   * Execute something after the board is ready
   * @param {Function} callback the callback to be called when the board is ready
   */
  onReady(callback) {
    this.firmata.on('ready', callback);
  }
  /**
    Asks the ESP32 to read analog data. 
    @param {number} pin The pin to read analog data
    @param {Function} callback A function to call when we have the analog data.
   */
  analogRead(pin, callback) {
    if (!callback) {
      throw new Error('Missing Callback');
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
    this.firmata.sysexCommand([
      PWM_OUTPUT,
      pin,
      PWM_CHANNEL,
      PWM_FREQ,
      PWM_RESOLUTION,
      pwmValue,
    ]);
  }
  /**
    Asks the ESP32 to read digital data. 
    @param {number} pin The pin to read data from
    @param {Function} callback The function to call when data has been received
   */
  digitalRead(pin, callback) {
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
      throw new Error('Invalid Value. Must be 0 or 1');
    }
    this.firmata.sysexCommand([DIGITAL_WRITE, pin, value]); //command, argc, argv = data
  }
};

module.exports = Esp32IO;
