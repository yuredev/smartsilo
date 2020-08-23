// const express = require('express');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const Board = require('./board');
const PORT = 3333;

const board = new Board('COM3', {
  setpoint: 28,
  pins: [0, 1, 2],
});

app.get('/state', (req, res) => {
  const { setpoint, pidConsts, isControlling, openLoopVoltage, pins } = board;
  return res.json({ setpoint, pidConsts, isControlling, openLoopVoltage, pins });
});

const server = app.listen(PORT, () => {
  console.log('✔ Server working at http://127.0.0.1:' + PORT);
});
const io = socketIO(server);

board.onReady(() => {
  console.log('✔ board ready');
  board.startThermsReading();
  // board.updatePins([3, 4, 5]);
  board.startControlling('Open loop');
  io.on('connection', (socket) => {
    console.log(`> ${socket.id} connected`);
    startSending(socket);
    startSocketListening(socket);
  });
});

function startSocketListening(socket) {
  socket.on('start-experiment', (controlMode) => {
    startExperiment(controlMode);
  });

  // socket.on('stop-experiment', stopExperiment);

  socket.on('update-server-open-loop-voltage', (v) => {
    board.updateOpenLoopVoltage(v)
    socket.broadcast.emit('update-client-open-loop-voltage', board.openLoopVoltage);
  });

  socket.on('update-server-setpoint', (newSetpoint) => {
    board.updateSetpoint(newSetpoint);
    // send new setpoint to the others clients connected
    socket.broadcast.emit('update-client-setpoint', board.setpoint);
  });

  socket.on('update-pins', (pins) => {
    board.updatePins(pins);
  });

  socket.on('update-server-pid-consts', (pidConsts) => {
    board.updatePidConsts(pidConsts);
    // send new pid consts to the others clients connected
    socket.broadcast.emit('update-client-pid-consts', pidConsts);
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
      value: board.getVoltage(),
    }),
      socket.emit('new-data', { type: 'Temperature', value: board.getTemp() });
    socket.emit('new-data', { type: 'Mass', value: Math.random() * 1 });
  }, freq);
}

