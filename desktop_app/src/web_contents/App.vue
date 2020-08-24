<template>
  <div>
    <SideNav
      @closeNav="closeNav(true)"
      :optionDisabled="optionDisabled"
      :showHamburger="showHamburger"
      :sideNavStyle="styles.sideNavStyle"
    />
    <Navbar @openNav="openNav(true)" @chartChange="currentChart = $event" />
    <MainContent
      :mainStyle="styles.mainContentStyle"
      :currentChart="currentChart"
      :currentControlMode="currentControlMode"
    />
  </div>
</template>

<script>
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import MainContent from './components/MainContent';
import eventBus from './utils/event-bus';
import websocketBus from './utils/websocket-bus';
import socketIOClient from 'socket.io-client';
import config from '../../package.json';

const baseUrl = config.base_url;
const socket = socketIOClient(baseUrl);

export default {
  components: {
    MainContent,
    Navbar,
    SideNav
  },
  data() {
    return {
      optionDisabled: false,
      currentControlMode: 'Open loop',
      currentChart: 'Temperature',
      showHamburger: false,
      openNavButtonState: null,
      screenWidth: null,
      styles: {
        sideNavStyle: {
          width: null
        },
        mainContentStyle: {
          'margin-left': null
        }
      }
    };
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    this.addSocketListener('update-client-setpoint');
    this.addSocketListener('update-client-pid-consts');
    this.addSocketListener('update-client-open-loop-voltage');
    this.addSocketListener('new-data');
    this.addSocketListener('chart-ready');

    this.addSocketEmitter('start-experiment');
    this.addSocketEmitter('stop-experiment');
    this.addSocketEmitter('update-server-open-loop-voltage');
    this.addSocketEmitter('update-server-setpoint');
    this.addSocketEmitter('update-pins');
    this.addSocketEmitter('update-server-pid-consts');

    eventBus.$on('set-control-mode', this.setControlMode);
    if (this.screenWidth > 992) {
      this.showHamburger = false;
      this.openNav();
    } else {
      this.showHamburger = true;
    }
  },
  methods: {
    addSocketListener(eventName) {
      // console.log(eventName);
      socket.on(eventName, (data) => websocketBus.$emit(eventName, data));
    },
    addSocketEmitter(eventName) {
      websocketBus.$on(eventName, (data) => {
        socket.emit(eventName, data)
      });
    },
    setControlMode(newControlMode) {
      this.currentControlMode = newControlMode;
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth > 992) {
        this.openNavButtonState = false;
        this.showHamburger = false;
        this.openNav();
      } else {
        this.closeNav();
        if (this.openNavButtonState) {
          this.openNav();
        }
        this.showHamburger = true;
      }
    },
    closeNav(actionFromButton) {
      if (actionFromButton) {
        this.openNavButtonState = false;
      }
      this.styles.sideNavStyle.width = '0px';
      this.styles.mainContentStyle['margin-left'] = '0px';
    },
    openNav(actionFromButton) {
      if (actionFromButton) {
        this.openNavButtonState = true;
      }
      if (this.screenWidth < 415) {
        this.styles.sideNavStyle.width = '100%';
      } else {
        this.styles.sideNavStyle.width = '250px';
        this.styles.mainContentStyle['margin-left'] = '250px';
      }
    }
  }
};
</script>

<style>

button, select {
  cursor: pointer;
}

h2#swal2-title.swal2-title {
  font-size: 1.15em;
}
</style>