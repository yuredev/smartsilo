<template>
  <div>
    <SideNav @closeNav="closeNav(true)" :showHamburger="showHamburger" :sideNavStyle="styles.sideNavStyle"/>
    <Navbar @openNav="openNav(true)" @chartChange="currentChart = $event"/>
    <!-- <div id="main" :style="styles.mainContentStyle">
      <Chart :type="currentChart" />
    </div> -->
    <MainContent :mainStyle="styles.mainContentStyle" :currentChart="currentChart"/>
  </div>
</template>

<script>
// BOOTSTRAP SIZES 
// xs (for phones - screens less than 768px wide)
// sm (for tablets - screens equal to or greater than 768px wide)
// md (for small laptops - screens equal to or greater than 992px wide)
// lg (for laptops and desktops - screens equal to or greater than 1200px wide)

import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import MainContent from './components/MainContent'

export default {
  components: {
    MainContent,
    Navbar,
    SideNav
  },
  data() {
    return {
      currentChart: 'Temperatura',
      showHamburger: false,
      openNavButtonState: undefined,
      screenWidth: undefined,
      styles: {
        sideNavStyle: {
          'width': undefined
        },
        mainContentStyle: {
          'margin-left': undefined
        }
      },
    }
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    if (this.screenWidth > 992) {
      this.showHamburger = false; 
      this.openNav();
    } else {
      this.showHamburger = true; 
    }
  },
  beforeUpdate() {
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
  methods: {
    handleResize() {
      this.screenWidth = window.innerWidth;
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
    },
  }
}
</script>

<style scoped>
 
</style>