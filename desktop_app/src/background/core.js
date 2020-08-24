const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const { ipcMain } = require('electron');
const { base_url } = require('../../package.json');
const projectPaths = require('./project-paths');

(function main() {
  initializeFolders();
  startListeners();
})();

function initializeFolders() {
  exec(`mkdir ${projectPaths.experiments}`);
  exec(`mkdir ${projectPaths.plots}`);
}

function startListeners() {
  ipcMain.on('save-chart', (evt, urlPlotNamePath) => {
    saveChartImg(evt, urlPlotNamePath);
  });
}
function saveChartImg(evt, urlPlotNamePath) {
  const pathToSaveImg = projectPaths.getPathToSaveImg();

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