// const express = require('express');
const http = require('http');
const io = require('socket.io')(http);
const Firmata = require('firmata');
const WEBSOCKET_PORT = 3333;
// const HTTP_PORT = 3333;

const Board = require('./board');

const board = new Board('COM3');

board.onReady(() => {
  console.log('✔ board ready');
  board.setPins(3, 4, 5);
  board.startControlling('Open loop');
  io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    startSending(socket);
    startSocketListening(socket);
  });
});

function startSocketListening(socket) {
  socket.on('start-experiment', (controlMode) => {
    startExperiment(controlMode);
  });
  // socket.on('stop-experiment', stopExperiment);
  socket.on('set-open-loop-voltage', (v) => board.setOpenLoopVoltage(v));
  socket.on('set-setpoint', (setP) => board.setSetPoint(setP));
  socket.on('set-pins', (pins) => board.setPins(pins));
  socket.on('set-pid-consts', (pidConsts) => board.setPidConsts(pidConsts));
}

function startSending(socket, freq = 500) {
  if (!socket) {
    throw new Error('missing parameter socket');
  }
  setInterval(() => {
    // o output gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5
    socket.emit('new-data', {
      type: 'Control',
      value: board.getVoltage()
    }),
    socket.emit('new-data', { type: 'Temperature', value: board.getTemp() });
    socket.emit('new-data', { type: 'Mass', value: Math.random() * 1 });
  }, freq);
}

io.listen(WEBSOCKET_PORT);
console.log(`✔ Websocket working at http://localhost:${WEBSOCKET_PORT}`);


