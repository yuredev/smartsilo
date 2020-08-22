// const express = require('express');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const Board = require('./board');
const PORT = 3333;

const server = app.listen(PORT, () => {
  console.log('✔ Server working at http://127.0.0.1:' + PORT);
});

const io = socketIO(server);
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
  
  socket.on('get-setpoint', () => {
    socket.emit('set-setpoint', board.setpoint);
    console.log('setpoint getted');
  });

  socket.on('get-pid-consts', () => {
    socket.emit('set-pid-consts', board.setpoint);
    console.log('pid consts getted');
  });

  socket.on('set-setpoint-server', (newSetpoint) => {
    board.setSetPoint(newSetpoint);
    // send new setpoint to the others clients connected
    socket.broadcast.emit('set-setpoint', board.setpoint);
    console.log('setpoint seted: ' + board.setpoint);
  });

  socket.on('set-pins', (pins) => {
    board.setPins(pins)
    console.log('pins seted: ' + board.therms);
  });
  
  socket.on('set-pid-consts', (pidConsts) => {
    board.setPidConsts(pidConsts)
    // send new pid consts to the others clients connected
    socket.broadcast.emit('set-pid-consts', pidConsts);
  });
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

// io.listen(PORT);
// console.log(`✔ Websocket working at http://localhost:${WEBSOCKET_PORT}`);


