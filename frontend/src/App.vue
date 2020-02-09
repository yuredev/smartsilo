<template>
  <div class="background">
    <div id="mySidenav" class="sidenav" :style="styles.sideNavData">
      <span id="menuHamburger" class="hamburger" @click="closeNav">&#9776; close</span>
      <a href="#">About</a>
      <a href="#">Services</a>
      <a href="#">Clients</a>
      <a href="#">Contact</a>
    </div>

    <div id="main" :style="styles.mainData">
      <span id="outerHamburger" class="hamburger" :style="styles.outerHamburgerData"  @click="openNav">&#9776; open</span>
    </div>

  </div>
</template>

<script>
export default {
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
  
  .background {
    background-color: black;
    height: 100%;
  }

  .sidenav {
    height: 100%;
    width: 0;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: #114;
    overflow-x: hidden;
    transition: 0.5s;
    padding-top: 60px;
  }

  .sidenav a {
    padding: 8px 8px 8px 32px;
    text-decoration: none;
    font-size: 25px;
    color: #818181;
    display: block;
    transition: 0.3s;
  }

  .sidenav a:hover {
    color: #f1f1f1;
  }

  .hamburger{
    font-size:30px;
      cursor:pointer; 
      color: white;
  }

  #outerHamburger{
    background-color: "white";	
  }

  #menuHamburger{
    background-color: "white";
  }

  #main {
    transition: margin-left .5s;
    padding: 16px;
  }

  @media screen and (max-height: 450px) {
    .sidenav {padding-top: 15px;}
    .sidenav a {font-size: 18px;}
  }
</style>