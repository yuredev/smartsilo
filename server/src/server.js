// const express = require('express');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const Board = require('./board');
const PORT = 3333;
const board = new Board('COM3');

app.get('/state', (req, res) => {
  const { setpoint, pidConsts, isControlling, openLoopVoltage } = board;
  return res.json({ setpoint, pidConsts, isControlling, openLoopVoltage });
});

const server = app.listen(PORT, () => {
  console.log('✔ Server working at http://127.0.0.1:' + PORT);
});
const io = socketIO(server);

board.onReady(() => {
  console.log('✔ board ready');
  board.updatePins(3, 4, 5);
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

  socket.on('update-open-loop-voltage-server', (v) => {
    board.updateOpenLoopVoltage(v)
    socket.broadcast.emit('update-open-loop-voltage-client', board.openLoopVoltage);
  });

  socket.on('update-setpoint-server', (newSetpoint) => {
    board.updateSetpoint(newSetpoint);
    // send new setpoint to the others clients connected
    socket.broadcast.emit('update-setpoint-client', board.setpoint);
    console.log('setpoint updated to: ' + board.setpoint);
  });

  socket.on('update-pins', (pins) => {
    board.updatePins(pins);
    console.log('pins updated to: ' + board.therms);
  });

  socket.on('update-pid-consts-server', (pidConsts) => {
    board.updatePidConsts(pidConsts);
    // send new pid consts to the others clients connected
    socket.broadcast.emit('update-pid-consts-client', pidConsts);
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

// io.listen(PORT);
// console.log(`✔ Websocket working at http://localhost:${WEBSOCKET_PORT}`);
