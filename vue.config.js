// vue.config.js
module.exports = {
	pluginOptions: {
		electronBuilder: {
			externals: ['firmata', 'vue-plotly'],
			nodeModulesPath: ['./node_modules']
		}
	}
}