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
import eventBus from './event-bus';

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
      openNavButtonState: undefined,
      screenWidth: undefined,
      styles: {
        sideNavStyle: {
          width: undefined
        },
        mainContentStyle: {
          'margin-left': undefined
        }
      }
    };
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    eventBus.$on('set-control-mode', this.setControlMode);
    if (this.screenWidth > 992) {
      this.showHamburger = false;
      this.openNav();
    } else {
      this.showHamburger = true;
    }
  },
  methods: {
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