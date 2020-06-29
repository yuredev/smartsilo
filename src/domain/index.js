// const Firmata = require('firmata');
// const board = new Firmata('/dev/ttyUSB0');
const Controller = require('node-pid-controller');
const fs = require('fs');
const path = require('path');
const { exec: terminalExec } = require('child_process');

const { ipcMain } = require('electron');

const { toCelsius, scaleOutput } = require('./utils/math-operators'); 
const projectPaths = require('./utils/project-paths');

// will be copied to an plot.m file, that are executable by octave-cli
const octaveCode = require('./octave/plot.m');

let setPoint = 30;
let output,
  errorValue = 0; // valor de saída errorValue valor do erro
let therms = []; // sensores

let txtFileName;

let pidConsts = {
  pb: 30,  // proportional band width 
  ti: 1.27,  // integral time 
  td: 6 // derivativeTime
}

// variables that will be used to store the Timeouts of the setIntervals that refers to 
// output and write control to the dryer
let openLoopTimeLapse;
let onOffTimeLapse;
let pidTimeLapse;
// will store the Timeout of the setInverval that saves the data in txt files
let savingTimeLapse; 

let openLoopVoltage = 0;

(function main() {
  initializeFolders();
  setPins();
  // arduino.pinMode(9, Pin.PWM);
  startControlling('Open loop');
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
  ipcMain.once('ready', evt => startSending(evt));
  ipcMain.on('start-experiment', (evt, controlMode) => startExperiment(controlMode));
  ipcMain.on('stop-experiment', stopExperiment);
  ipcMain.on('set-open-loop-voltage', setOpenLoopVoltage);
  ipcMain.on('set-setpoint', setSetPoint);
  ipcMain.on('set-pins', setPins);
  ipcMain.on('set-pid-consts', (evt, consts) => setPidConsts(consts));
}

function setPidConsts(newPidConsts) {
  pidConsts = newPidConsts;
}

function startExperiment(controlMode) {
  stopControlling();
  startControlling(controlMode);
  startSaving();
}

function stopControlling() {
  clearInterval(openLoopTimeLapse);
  clearInterval(onOffTimeLapse);
  clearInterval(pidTimeLapse);
}

function stopExperiment(evt) {
  clearInterval(savingTimeLapse);
  stopControlling();
  startControlling('Open loop');
  octavePlot().then(currentPlotPath => {
    evt.reply('chart-ready', currentPlotPath);
  }).catch(error => console.log(error)); 
}

function octavePlot() {
  const isLinux = process.platform === 'linux';
  const command = isLinux ? 'octave' : 'octave-cli';

  return new Promise((resolve, reject) => {
    terminalExec(`${command} ${projectPaths.octaveFile} ${txtFileName} ${projectPaths.rawData} ${projectPaths.plots}`, error => {
      if (error) {
        reject(error);
      } 
      resolve(path.resolve(projectPaths.plots  , '__current-plot.png'));
    });
  });
}

// mudar voltagem de 0 a 3 para malha aberta
function setOpenLoopVoltage(evt, voltage) {
  openLoopVoltage = voltage;
  clearInterval(openLoopTimeLapse);
  startControlling('Open loop');
}

// função para setar novos canais no Arduino
function setPins(evt, pins = ['A0', 'A1', 'A2', 'A3', 'A4']) {
  // descomentar depois
  // therm1 = new Sensor({ pin: pins[0], freq: 100 });
  // therm2 = new Sensor({ pin: pins[1], freq: 100 });
  // therm3 = new Sensor({ pin: pins[2], freq: 100 });
  // therm4 = new Sensor({ pin: pins[3], freq: 100 });
  // therm5 = new Sensor({ pin: pins[4], freq: 100 });

  // comentar depois
  therms[0] = { value: 0 };
  therms[1] = { value: 0 };
  therms[2] = { value: 0 };
  therms[3] = { value: 0 };
  therms[4] = { value: 0 };

  therms.forEach(therm => {
    setInterval(
      () => (therm.value = Math.round(Math.random() * 70 + 400)),
      500
    );
  }); 
  console.log(`Pins setted: ${pins}`);
}

// começa a salvar em arquivo txt
function startSaving() {
  const getTextToSave = () => (
    `${getTemp()},${scaleOutput(output,'to [0,5]')},${errorValue},${setPoint}\n`
  );

  const pathToNewTxt = projectPaths.getNewTxt();
  txtFileName = path.basename(pathToNewTxt);
  txtFileName = txtFileName.split('.')[0];

  const writeInTxt = () => {
    fs.appendFile(pathToNewTxt, getTextToSave(), () => {});
  }
  savingTimeLapse = setInterval(writeInTxt, 250);
}

function controlViaPid() {
  const KP = 1 / (pidConsts.pb / 100); // proportionalBand
  const KI = KP / pidConsts.ti; // integrativeTime 
  const KD = KP * pidConsts.td; // derivativeTime 
  const H = 0.1;

  const pidController = new Controller(KP, KI, KD, H);
  const temperature = getTemp();
  errorValue = getTemp() - setPoint;
  
  pidController.setTarget(setPoint);
  output = pidController.update(temperature);

  if (output < 2 && setPoint > 30) {
    output *= 1.05;
  }
  if (output > 255) {
    output = 255;
  } else if (output < 0) {
    output = 0;
  }
  // arduino.analogWrite(9, output);
}

function controlViaOnOff() {
  output = getTemp() < setPoint ? 255 : 0;
  // arduino.analogWrite(9, output);
}

// começa a controlar o secador de grãos a partir do modo passado
function startControlling(mode) {
  switch (mode) {
    case 'PID':
      pidTimeLapse = setInterval(controlViaPid, 100);
      break; 
    case 'ON/OFF':
      onOffTimeLapse = setInterval(controlViaOnOff, 100);
      break; 
    case 'Open loop':
      output = scaleOutput(openLoopVoltage);
      openLoopTimeLapse = setInterval(() => {
        // arduino.analogWrite(9, output);
      }, 100);
      break;
  }
}

// returns the average temp of the therms array
const getTemp = () => {
  const sumTemps = (total, el) => total + toCelsius(el.value);
  const averageTemp = therms.reduce(sumTemps, 0) / 5;
  return averageTemp;
};

// mudar o setPoint
function setSetPoint(evt, newSetPoint) {
  setPoint = Number(newSetPoint);
}

// começa a mandar os dados para o arduino
function startSending(evt, freq = 500) {
  if (!evt) {
    throw new Error('missing parameter evt');
  }
  setInterval(() => {
    // o output gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5
    evt.reply('new-data', { type: 'Control', value: scaleOutput(output, 'to [0,5]') }),
    evt.reply('new-data', { type: 'Temperature', value: getTemp() });
    evt.reply('new-data', { type: 'Mass', value: Math.random() * 1 });
  }, freq);
}