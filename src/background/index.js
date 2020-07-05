const fs = require('fs');
const path = require('path');
const { exec: terminalExec } = require('child_process');

const { ipcMain } = require('electron');

const projectPaths = require('./services/project-paths');

// will be copied to an plot.m file, that are executable by octave-cli
const octaveCode = require('./octave/plot.m');

let txtFileName;

// will store the Timeout of the setInverval that saves the data in txt files
let savingTimeLapse;

const HardwareHandler = require('./hardware-handler');
// console.log(typeof new HardwareHandler());
const hardHandler = new HardwareHandler();

// hardHandler.onBoardReady(main);

(function main() {
  initializeFolders();
  hardHandler.setPins();
  // arduino.pinMode(9, Pin.PWM);
  hardHandler.startControlling('Open loop');
  startListeners();
})();

function initializeFolders() {
  terminalExec(`mkdir ${projectPaths.experiments}`);
  terminalExec(`mkdir ${projectPaths.plots}`);
  terminalExec(`mkdir ${projectPaths.rawData}`);
  terminalExec(`mkdir ${projectPaths.octaveScripts}`);
  fs.writeFile(projectPaths.octaveFile, octaveCode, () => {}); // create the octave file
}

function startListeners() {
  ipcMain.once('ready', (evt) => startSending(evt));
  ipcMain.on('start-experiment', (evt, controlMode) =>
    startExperiment(controlMode)
  );
  ipcMain.on('stop-experiment', stopExperiment);
  ipcMain.on('set-open-loop-voltage', (evt, v) => hardHandler.setOpenLoopVoltage(evt, v));
  ipcMain.on('set-setpoint', (evt, sp) => hardHandler.setSetPoint(evt, sp));
  ipcMain.on('set-pins', (evt, p) => hardHandler.setPins(evt, p));
  ipcMain.on('set-pid-consts', (evt, consts) => hardHandler.setPidConsts(consts));
}

function startExperiment(controlMode) {
  hardHandler.stopControlling();
  hardHandler.startControlling(controlMode);
  startSaving();
}
function stopExperiment(evt) {
  clearInterval(savingTimeLapse);
  hardHandler.stopControlling();
  hardHandler.startControlling('Open loop');
  octavePlot()
    .then((currentPlotPath) => {
      evt.reply('chart-ready', currentPlotPath);
    })
    .catch((error) => console.log(error));
}
function octavePlot() {
  const isLinux = process.platform === 'linux';
  const command = isLinux ? 'octave' : 'octave-cli';

  return new Promise((resolve, reject) => {
    terminalExec(
      `${command} ${projectPaths.octaveFile} ${txtFileName} ${projectPaths.rawData} ${projectPaths.plots}`,
      (error) => {
        if (error) {
          reject(error);
        }
        resolve(path.resolve(projectPaths.plots, '__current-plot.png'));
      }
    );
  });
}
// começa a salvar em arquivo txt
function startSaving() {
  const getTextToSave = () =>
    `${hardHandler.getTemp()},${hardHandler.getVoltage()},${hardHandler.errorValue},${hardHandler.setpoint}\n`;

  const pathToNewTxt = projectPaths.getNewTxt();
  txtFileName = path.basename(pathToNewTxt);
  txtFileName = txtFileName.split('.')[0];

  const writeInTxt = () => {
    fs.appendFile(pathToNewTxt, getTextToSave(), () => {});
  };
  savingTimeLapse = setInterval(writeInTxt, 250);
}
// começa a mandar os dados para o arduino
function startSending(evt, freq = 500) {
  if (!evt) {
    throw new Error('missing parameter evt');
  }
  setInterval(() => {
    // o output gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5
    evt.reply('new-data', {
      type: 'Control',
      value: hardHandler.getVoltage()
    }),
    evt.reply('new-data', { type: 'Temperature', value: hardHandler.getTemp() });
    evt.reply('new-data', { type: 'Mass', value: Math.random() * 1 });
  }, freq);
}