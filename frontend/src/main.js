import Vue from 'vue';
import App from './App.vue';
import VueSocketIO from 'vue-socket.io';

Vue.config.productionTip = false;

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://10.77.12.230:3000'
}));

new Vue({
  render: h => h(App),
}).$mount('#app');
