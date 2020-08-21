const { app } = require('electron');
const path = require('path');
const getTxtFileName = require('./get-txt-file-name');

// receives the root path of the smartsilo application
const rootPath = path.resolve(app.getPath('exe'), '..'); 
// path of the experiments folder
const experimentsPath = path.resolve(rootPath, 'experiments');
// path of the plots folder
const plotsPath = path.resolve(rootPath, 'experiments', 'plots');
// path of the raw_data folder
const rawDataPath = path.resolve(plotsPath, '..', 'raw_data');
// path of the octave scripts folder
const octaveScriptsPath = path.resolve(rootPath, 'octave_scripts');
// path of the plot.m file in octave_scripts folder
const octaveFilePath = path.resolve(octaveScriptsPath, 'plot.m');
// path of the new txt file that will be generated at the start of the experiment
const getNewTxtPath = () => (
  path.resolve(rawDataPath, `${getTxtFileName()}.txt`)
);

module.exports = {
  root: rootPath,
  rawData: rawDataPath, 
  octaveScripts: octaveScriptsPath,
  octaveFile: octaveFilePath,
  plots: plotsPath,
  getNewTxt: getNewTxtPath,
  experiments: experimentsPath
}