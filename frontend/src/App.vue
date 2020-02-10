<template>
  <div>
    <SideNav @closeNav="closeNav()" :data="styles.sideNavData"/>
    <Navbar @openNav="openNav()" :data="styles.outerHamburgerData" @chartChange="currentChart = $event"/>
    <div id="main" :style="styles.mainData">
      <Chart :type="currentChart" />
    </div>
  </div>
</template>

<script>

import Chart from './components/Chart'
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';

export default {
  components: {
    Chart,
    Navbar,
    SideNav
  },
  data() {
    return {
      currentChart: 'Temperatura',
      styles: {
        sideNavData: {
          'width': undefined
        },
        mainData: {
          'margin-left': undefined
        }, 
        outerHamburgerData: {
          'display': undefined
        }
      },
    }
  },
  mounted() {
    this.openNav();
  },
  methods: {
    closeNav() {
      this.styles.sideNavData.width = '0px';
      this.styles.mainData['margin-left'] = '0px';
      // this.styles.outerHamburgerData.display = 'inline';
    }, 
    openNav() {
      this.styles.sideNavData.width = '250px';
      this.styles.mainData['margin-left'] = '250px';
      // this.styles.outerHamburgerData.display = 'none';
    }
  }
}
</script>

<style scoped>
  #main {
    transition: margin-left .5s;
    margin: 0px;
    padding: 0px;
    border: 0px;
  }
</style>