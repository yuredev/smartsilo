<template>
  <div class="sidenav" :style="sideNavStyle">
    <div>
      <span v-show="showHamburger" id="hamburger" @click="closeNav">&#9776;</span>
      <div id="logo-div">
        <img 
          src="../assets/smart.png" 
          alt="logo do sistema" 
          id="logo" 
        />
      </div>
    </div>
    <Forms :optionDisabled="optionDisabled" />
    <bottom>
      <div class="img-div">
        <img id="ufrn-logo" src="../assets/ufrn-logo.png" alt="logo da ufrn">
      </div>
      <div id="team">
        <p>
          Developed by:
          <a id="git-yure" href="http://github.com/yuredev">Yure Matias</a> and 
          <a id="lattes-josenalde" href="http://lattes.cnpq.br/0503501772199456">Josenalde Oliveira</a>
        </p>  
      </div>  
      <p id="institutions">
        <a id="tapioca-page" href="http://tapioca.eaj.ufrn.br/">TAPIOCA-LAB</a>
        <a id="eaj-page" href="http://www.eaj.ufrn.br/site/">EAJ-UFRN</a>
      </p>
    </bottom>
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
#logo-div {
  display: flex;
  justify-content: center;
}
#logo {
  cursor: pointer;
  width: 180px;
  margin-bottom: 25px;
}
bottom {
  font-size: .9rem;
  background-color: #00000021;
  margin-top: 27px !important;
  padding: 4px 10px !important;
  display: flex;
  flex-direction: column;
  height: 130px;
  justify-content: space-around;
}
bottom > #team > p {
  text-align: center;
  justify-content: center;
  padding: 2px;
}
bottom > #team > p > a {
  color: #FAFAFA;
  font-weight: 500;
  text-decoration: none;
}
bottom > #team > p > a:hover {
  text-decoration: underline;
}
bottom > .img-div {
  display: flex;
  justify-content: center;
}
bottom > .img-div > #ufrn-logo {
  width: 40px;
  cursor: pointer;
}
bottom > #institutions {
  display: flex;
  justify-content: space-between;
}
bottom > #institutions a {
  color: #FAFAFA;
  text-decoration: none;
  font-weight: 600;
}
bottom > #institutions a:hover {
  text-decoration: underline;
}
</style>