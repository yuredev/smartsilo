<template>
  <div>
    <SideNav @closeNav="closeNav()" :data="styles.sideNavData"/>
    <div id="main" :style="styles.mainData">
      <Navbar @openNav="openNav()" :data="styles.outerHamburgerData"/>
    </div>
  </div>
</template>

<script>

import SideNav from './components/SideNav';
import Navbar from './components/Navbar';

export default {
  components: {
    Navbar,
    SideNav
  },
  data() {
    return {
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
      this.styles.mainData.marginLeft = '0px';
      // this.styles.outerHamburgerData.display = 'inline';
    }, 
    openNav() {
      this.styles.sideNavData.width = '250px';
      this.styles.mainData.marginLeft = '250px';
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