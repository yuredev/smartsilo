<template>
  <div>
    <SideNav @closeNav="closeNav(true)" :showHamburger="showHamburger" :data="styles.sideNavData"/>
    <Navbar @openNav="openNav(true)" @chartChange="currentChart = $event"/>
    <div id="main" :style="styles.mainData">
      <Chart :type="currentChart" />
      {{window.height}} x {{window.width}}
    </div>
  </div>
</template>

<script>

    // BOOTSTRAP SIZES 
    // xs (for phones - screens less than 768px wide)
    // sm (for tablets - screens equal to or greater than 768px wide)
    // md (for small laptops - screens equal to or greater than 992px wide)
    // lg (for laptops and desktops - screens equal to or greater than 1200px wide)



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
      showHamburger: false,
      sideNavKeepOpen: undefined,
      window: {
        width: undefined,
        height: undefined
      },
      styles: {
        sideNavData: {
          'width': undefined
        },
        mainData: {
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
    if (this.window.width > 992) {
      this.showHamburger = false; 
      this.openNav();
    } else {
      this.showHamburger = true; 
    }
  },
  beforeUpdate() {
    if (this.window.width > 992) {
      this.sideNavKeepOpen = false;
      this.showHamburger = false; 
      this.openNav();
    } else {
      this.closeNav();
      if (this.sideNavKeepOpen) {
        this.openNav();
      }
      this.showHamburger = true;
    }
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    closeNav(a) {
      if (a) {
        this.sideNavKeepOpen = false;
      }
      this.styles.sideNavData.width = '0px';
      this.styles.mainData['margin-left'] = '0px';
    }, 
    openNav(a) {

      if (a) {
        this.sideNavKeepOpen = true;
      }
      this.styles.sideNavData.width = '250px';
      this.styles.mainData['margin-left'] = '250px';
    },
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