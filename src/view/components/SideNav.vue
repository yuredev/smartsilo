<template>
  <div class="sidenav" :style="sideNavStyle">
    <div>
      <span v-show="showHamburger" id="hamburger" @click="closeNav">&#9776;</span>
      <div id="logo-div">
        <img 
          src="../assets/smart.png" 
          alt="logo do sistema" 
          id="logo" 
          @click="openUrl('http://smartsilo.netlify.com')"
        />
      </div>
    </div>
    <Forms :optionDisabled="optionDisabled" />
    <footer>
      <div class="img-div">
        <img id="ufrn-logo" src="../assets/ufrn-logo.png" alt="logo da ufrn">
      </div>
      <div id="team">
        <p>
          Developed by:
          <span class="link" @click="openUrl('http://github.com/yuredev')">Yure Matias</span> and 
          <span class="link" @click="openUrl('http://lattes.cnpq.br/0503501772199456')">Josenalde Oliveira</span>
        </p>  
      </div>  
      <p id="institutions">
        <span class="link" @click="openUrl('http://tapioca.eaj.ufrn.br/')">TAPIOCA-LAB</span>
        <span class="link" @click="openUrl('http://www.eaj.ufrn.br/site/')">EAJ-UFRN</span>
      </p>
    </footer>
  </div>
</template>

<script>

import Forms from './Forms';
import { shell } from 'electron';

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
    },
    openUrl(url) {
      shell.openExternal(url);
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
footer {
  font-size: .9rem;
  background-color: #00000021;
  margin-top: 27px !important;
  padding: 4px 10px !important;
  display: flex;
  flex-direction: column;
  height: 130px;
  justify-content: space-around;
}
footer > #team > p {
  text-align: center;
  justify-content: center;
  padding: 2px;
}
footer > #team > p > .link {
  color: #FAFAFA;
  font-weight: 500;
  text-decoration: none;
}
footer > #team > p > .link:hover {
  text-decoration: underline;
}
footer > .img-div {
  display: flex;
  justify-content: center;
}
footer > .img-div > #ufrn-logo {
  width: 40px;
  cursor: pointer;
}
footer > #institutions {
  display: flex;
  justify-content: space-between;
}
footer > #institutions .link {
  color: #FAFAFA;
  text-decoration: none;
  font-weight: 600;
}
footer > #institutions .link:hover {
  text-decoration: underline;
}
.link {
  cursor: pointer;
}
</style>