const Board = require('firmata');

const board = new Board('COM3');

board.on('ready', () => {
  console.log('ready');
});