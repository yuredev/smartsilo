const fs = require('fs');
const path = require('path');
const { exec: terminalExec, exec } = require('child_process');
const axios = require('axios');
const { base_url } = require('../../package.json');
const { ipcMain } = require('electron');
const projectPaths = require('./utils/project-paths');

function main() {
  initializeFolders();
  startListeners();
}
main();

function initializeFolders() {
  terminalExec(`mkdir ${projectPaths.experiments}`);
  terminalExec(`mkdir ${projectPaths.plots}`);
}

function startListeners() {
  ipcMain.on('save-chart', (evt, urlPlotNamePath) => {
    saveChartImg(evt, urlPlotNamePath);
  });
}
function saveChartImg(evt, urlPlotNamePath) {
  function getFileName() {
    const time = new Date();
    return `${time.getDate()}-${time.getMonth() + 1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
  }
  const pathToSaveImg = path.join(projectPaths.plots, getFileName()) + '.png';
  downloadImage(base_url + urlPlotNamePath, pathToSaveImg).then((err) => {
    if (err) {
      evt.reply('chart-not-saved');
      exec('start cmd');
      console.log(err);
      return;
    }
    evt.reply('chart-saved', base_url + urlPlotNamePath);
  });
}

function downloadImage(url, imagePath) {
  return axios({
    url,
    responseType: 'stream'
  }).then(res => {
    return new Promise((resolve, reject) => {
      res.data
        .pipe(fs.createWriteStream(imagePath))
        .on('finish', () => resolve())
        .on('error', e => reject(e));
    });
  });
}

// function startExperiment(controlMode) {
//   board.stopControlling();
//   board.startControlling(controlMode);
//   startSaving();
// }
// function stopExperiment(evt) {
//   clearInterval(savingTimeLapse);
//   board.stopControlling();
//   board.startControlling('Open loop');
//   octavePlot()
//     .then((currentPlotPath) => {
//       evt.reply('chart-ready', currentPlotPath);
//     })
//     .catch((error) => console.log(error));
// }
// function octavePlot() {
//   const isLinux = process.platform === 'linux';
//   const command = isLinux ? 'octave' : 'octave-cli';

//   return new Promise((resolve, reject) => {
//     terminalExec(
//       `${command} ${projectPaths.octaveFile} ${txtFileName} ${projectPaths.rawData} ${projectPaths.plots}`,
//       (error) => {
//         if (error) {
//           reject(error);
//         }
//         resolve(path.resolve(projectPaths.plots, '__current-plot.png'));
//       }
//     );
//   });
// }
// começa a salvar em arquivo txt
// function startSaving() {
//   const getTextToSave = () =>
//     `${board.getTemp()},${board.getVoltage()},${board.errorValue},${board.setpoint}\n`;

//   const pathToNewTxt = projectPaths.getNewTxt();
//   txtFileName = path.basename(pathToNewTxt);
//   txtFileName = txtFileName.split('.')[0];

//   const writeInTxt = () => {
//     fs.appendFile(pathToNewTxt, getTextToSave(), () => {});
//   };
//   savingTimeLapse = setInterval(writeInTxt, 250);
// }
// começa a mandar os dados para o arduino
// function startSending(evt, freq = 500) {
//   if (!evt) {
//     throw new Error('missing parameter evt');
//   }
//   setInterval(() => {
//     // o output gerado está na escala 0 a 255 assim é preciso converte-lo para a escala 0 a 5
//     evt.reply('new-data', {
//       type: 'Control',
//       value: board.getVoltage()
//     }),
//     evt.reply('new-data', { type: 'Temperature', value: board.getTemp() });
//     evt.reply('new-data', { type: 'Mass', value: Math.random() * 1 });
//   }, freq);
// }

// will be useful
