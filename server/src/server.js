const socketIO = require('socket.io');
const express = require('express');
const app = express();
const Board = require('./board');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3333;
const PLOTS_PATH = path.join('..', 'experiments', 'plots');
const RAW_DATA_PATH = path.join('..', 'experiments', 'raw_data');
const OCTAVE_SCRIPT_PATH = path.join('octave-plot.m');
const CURRENT_PLOT_PATH = path.join('..', 'experiments', 'plots', '__current-plot.png');

let fileName;
let savingTimeLapse;

const board = new Board('COM4', {
  setpoint: 28,
  pins: [1, 2, 3, 4, 5],
});

app.get('/state', (req, res) => {
  const { setpoint, pidConsts, isControlling, openLoopVoltage, pins } = board;
  return res.json({ setpoint, pidConsts, isControlling, openLoopVoltage, pins });
});

const server = app.listen(PORT, () => {
  console.log('✔ Server working at http://192.168.0.9:' + PORT);
});
const io = socketIO(server);

board.onReady(() => {
  console.log('✔ board ready');
  board.startThermsReading();
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

  socket.on('stop-experiment', () => {
    stopExperiment(socket)
  });

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

function startExperiment(controlMode) {
  if (board.isControlling) {
    return;
  }
  board.stopControlling();
  board.startControlling(controlMode);
  startSaving();
}

// começa a salvar em arquivo txt
function startSaving() {
  function getFileName() {
    const time = new Date();
    return `${time.getDate()}-${time.getMonth() + 1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
  }
  
  function getTextToSave() {
    return `${board.getTemp()},${board.getVoltage()},${board.errorValue},${board.setpoint}\n`;
  }

  const pathToNewTxt = path.join('..', 'experiments', 'raw_data', `${getFileName()}.txt`);
  fileName = path.basename(pathToNewTxt).split('.')[0];
  
  savingTimeLapse = setInterval(() => {
    fs.appendFile(pathToNewTxt, getTextToSave(), () => {});
  }, 250);
}

async function stopExperiment(socket) {
  clearInterval(savingTimeLapse);
  board.stopControlling();
  board.startControlling('Open loop');

  try {
    await octavePlot({
      fileName,
      plotsPath: PLOTS_PATH,
      octaveScriptPath: OCTAVE_SCRIPT_PATH,
      rawDataPath: RAW_DATA_PATH,
    });
    startImageServer(CURRENT_PLOT_PATH, '/experiment-chart');
    socket.emit('chart-ready', '/experiment-chart');
  } catch (error) {
    console.log(error);
  }
}

function startImageServer(imgPath, getMappingPath) {
  fs.readFile(imgPath, (err, data) => {
    removePreviousImageServer(getMappingPath);
    if (err) {
      throw err; 
    } 
    app.get(getMappingPath, (req, res) => {
      res.contentType('image/jpeg');
      res.send(data);
    });
  });
}

function removePreviousImageServer(getMappingPath) {
  const routes = app._router.stack;
  routes.forEach((route, i, routes) => {
    if (route.path === getMappingPath) {
      routes.splice(i, 1);
    }
  });
} 

function octavePlot({ fileName, rawDataPath, plotsPath, octaveScriptPath }) {
  const isLinux = process.platform === 'linux';
  const octaveCommand = isLinux ? 'octave' : 'octave-cli';

  return new Promise((resolve, reject) => {
    exec(
      `${octaveCommand} ${octaveScriptPath} ${fileName} ${rawDataPath} ${plotsPath}`,
      (error) => {
        if (error) {
          reject(error);
        }
        const currentPlotPath = path.resolve(plotsPath, '__current-plot.png');
        resolve(currentPlotPath);
      }
    );
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
    });
    socket.emit('new-data', { type: 'Temperature', value: board.getTemp() });
    socket.emit('new-data', { type: 'Mass', value: Math.random() * 1 });
  }, freq);
}