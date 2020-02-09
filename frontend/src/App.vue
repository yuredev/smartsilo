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
      <span class="hamburger" :style="styles.outerHamburgerData"  @click="openNav">&#9776; open</span>
      <p>
        Mussum Ipsum, cacilds vidis litro abertis. Posuere libero varius. Nullam a nisl ut ante blandit hendrerit. Aenean sit amet nisi. Atirei o pau no gatis, per gatis num morreus. Copo furadis é disculpa de bebadis, arcu quam euismod magna. Si num tem leite então bota uma pinga aí cumpadi!
        Diuretics paradis num copo é motivis de denguis. Todo mundo vê os porris que eu tomo, mas ninguém vê os tombis que eu levo! Mais vale um bebadis conhecidiss, que um alcoolatra anonimis. Casamentiss faiz malandris se pirulitá.
        A ordem dos tratores não altera o pão duris. Nullam volutpat risus nec leo commodo, ut interdum diam laoreet. Sed non consequat odio. Per aumento de cachacis, eu reclamis. Nec orci ornare consequat. Praesent lacinia ultrices consectetur. Sed non ipsum felis.
      </p>
    </div>

  </div>
</template>

<script>

import SideNav from './components/SideNav'


export default {
  components: {
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
    // this.openNav();
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
      cursor:pointer; 
    cursor:pointer; 
    color: white;
  }

  #main {
    transition: margin-left .5s;
    padding: 16px;
  }

</style>