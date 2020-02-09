<template>
  <div class="sidenav" :style="data">
    <span id="menuHamburger" class="hamburger" @click="closeNav">&#9776; close</span>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Clients</a>
    <a href="#">Contact</a>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default() {
        return {width: '0px'}
      }
    }
  },
  methods: {
    closeNav() {
      this.data.width = '0px';
      this.$emit('closeNav');
    }
  },
}
</script>


<style scoped>
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

  @media screen and (max-height: 450px) {
    .sidenav {padding-top: 15px;}
    .sidenav a {font-size: 18px;}
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
</style>