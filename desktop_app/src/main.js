import Vue from 'vue';
import App from './web_contents/App.vue';

Vue.config.productionTip = false;

new Vue({
	render: h => h(App),
}).$mount('#app');