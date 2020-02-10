<template>
  <div class="sidenav" :style="sideNavStyle">
    <span v-show="showHamburger" id="hamburger" @click="closeNav">&#9776;</span>
  </div>
</template>

<script>
export default {
  props: {
    showHamburger: {
      type: Boolean,
      required: true
    },
    sideNavStyle: {
      type: Object,
      default() {
        return {width: '0px'}
      }
    }
  },
  methods: {
    closeNav() {
      this.sideNavStyle.width = '0px';
      this.$emit('closeNav');
    }
  },
}
</script>

<style scoped>
  .sidenav *{
    margin: 0px 0px 0px 15px;
    border: 0;
    padding: 0;
  }

  .sidenav {
    display: flex;
    flex-direction: column;
    padding: 4px 0px 4px 0px;
    height: 100%;
    width: 0;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: #242337;
    overflow-x: hidden;
    transition: 0.15s;
  }

  #hamburger{
    font-size: 28px;
    cursor:pointer; 
    color: #f7f7f7;
  }
</style>