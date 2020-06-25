<template>
  <div class="sidenav" :style="sideNavStyle">
    <div>
      <span v-show="showHamburger" id="hamburger" @click="closeNav">&#9776;</span>
      <div id="logoDiv">
        <img src="../assets/smart.png" alt="logo do sistema" id="logo" />
      </div>
    </div>
    <Forms :optionDisabled="optionDisabled" />
  </div>
</template>

<script>
import Forms from './Forms';

export default {
  components: {
    Forms
  },
  props: {
    optionDisabled: Boolean,
    showHamburger: {
      type: Boolean,
      required: true
    },
    sideNavStyle: {
      type: Object,
      default() {
        return { width: '0px' };
      }
    }
  },
  methods: {
    closeNav() {
      this.sideNavStyle.width = '0px';
      this.$emit('closeNav');
    }
  }
};
</script>

<style scoped>
.sidenav * {
  margin: 0px 0px 0px 0px;
  border: 0;
  padding: 0;
}
.sidenav > * {
  margin: 0px 15px 4px 15px;
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
  background-color: rgb(37, 42, 63);
  /* background-color: #242337; */
  overflow-x: hidden;
  transition: 0.15s;
}
#hamburger {
  font-size: 28px;
  cursor: pointer;
  color: #f7f7f7;
}
#logo {
  width: 180px;
  margin-top: 5px;
  margin-bottom: 50px;
  margin-left: 17px;
}
</style>