const Board = require('firmata');

const board = new Board('COM4');

board.on('ready', () => {
  const thermistors = [];
  for (let i = 1; i <= 5; i++) {
    board.analogRead(i, (value) => {
      thermistors[i] = value;
    });
  } 
  setInterval(() => {
    console.log('--------------------------------');
    for (let i = 1; i <= 5; i++) {
      console.log(`A${i}: ${toCelsius(thermistors[i])}`);
    } 
    console.log('--------------------------------');
  }, 500)
});

function toCelsius(rawADC) {
  let temp = Math.log(10240000 / rawADC - 10000);
  temp = 1 / (0.001129148 + 0.000234125 * temp + 0.0000000876741 * temp ** 3);
  temp = temp - 273.15; // Kelvin para Celsius
  return temp.toFixed(2);
}
