const { app } = require('electron');
const path = require('path');

// receives the root path of the smartsilo application
const root = path.resolve(app.getPath('exe'), '..'); 
// path of the experiments folder
const experiments = path.resolve(root, 'experiments');
// path of the plots folder
const plots = path.resolve(root, 'experiments', 'plots');

function getPathToSaveImg() {
  const time = new Date();
  const imgName = `${time.getDate()}-${time.getMonth() + 1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}.png`;
  const savedImgPath = path.resolve(plots, imgName);  
  return savedImgPath;
}

module.exports = {
  root,
  plots,
  experiments,
  getPathToSaveImg,
}