// vue.config.js
module.exports = {
  pluginOptions: {
    electronBuilder: {
      externals: ['firmata', 'vue-plotly'],
      nodeModulesPath: ['./node_modules'],
      mainProcessFile: 'src/electron-entrypoint.js',
      mainProcessWatch: ['src/background/*'],
    },
  },
};
