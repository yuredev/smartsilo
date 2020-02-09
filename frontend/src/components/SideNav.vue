<template>
  <div class="sidenav" :style="data">
    <span id="menuHamburger" class="hamburger" @click="closeNav">&#9776; close</span>
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
    color: #A8A8A8;
    display: block;
    transition: 0.3s;
  }

  .sidenav a:hover {
    color: #f7f7f7;
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
    background-color: #2d3744;
    overflow-x: hidden;
    transition: 0.5s;
    padding-top: 10px;
  }

  .hamburger{
    font-size:30px;
    cursor:pointer; 
    color: white;
  }

</style>