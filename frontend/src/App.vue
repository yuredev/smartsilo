<template>
  <div>
    <!-- <div class="sidenav" :style="styles.sideNavData">
      <span id="menuHamburger" class="hamburger" @click="closeNav">&#9776; close</span>
      <a href="#">About</a>
      <a href="#">Services</a>
      <a href="#">Clients</a>
      <a href="#">Contact</a>
    </div> -->
    
    <SideNav @closeNav="closeNav()" :data="styles.sideNavData"/>

    <div id="main" :style="styles.mainData">
      <Header />
      <span class="hamburger" :style="styles.outerHamburgerData"  @click="openNav">&#9776; open</span>
    </div>
  </div>
</template>

<script>

import SideNav from './components/SideNav';
import Header from './components/Header';

export default {
  components: {
    Header,
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
      this.styles.outerHamburgerData.display = 'inline';
    }, 
    openNav() {
      this.styles.sideNavData.width = '250px';
      this.styles.mainData.marginLeft = '250px';
      this.styles.outerHamburgerData.display = 'none';
    }
  }
}
</script>

<style scoped>
   
  .hamburger{
    font-size:30px;
    cursor:pointer; 
    color: white;
  }

  #main {
    transition: margin-left .5s;
    margin: 0px;
    padding: 0px;
    border: 0px;
  }

</style>