<template>
  <div class="sidenav" :style="sideNavStyle">
    <div>
      <span v-show="showHamburger" id="hamburger" @click="closeNav">&#9776;</span>
      <div id="logoDiv">
        <img src="../assets/smart.png" alt="logo do sistema" id="logo">
      </div>
    </div>
    <div class="formsArea">
      <div class="centralize-self" style="margin-top: 10px;">
        <label for="setpoint">Setpoint: </label>
        <input type="number" name="setpoint" id="">
      </div>
      <div class="centralize-self">
        <label for="controlMode">Modo de controle:</label>
        <select name="controlMode" id="">
          <option value="">Malha aberta</option>
          <option value="">PID</option>
          <option value="">ON/OFF</option>
        </select>
      </div>
      <div class="radioButtonDiv">
        <label for="voltage0v">0v</label> 
        <input type="radio" name="voltageRadioBtn" id="voltage0v">
        <label for="voltage3v">3v</label> 
        <input type="radio" name="voltageRadioBtn" id="voltage3v">
      </div>
    </div>
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
  .centralize-self{
    display: flex;
    flex-direction: column;
    align-self: center;
  }
  .sidenav *{
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
    background-color: #242337;
    overflow-x: hidden;
    transition: 0.15s;
  }

  #hamburger{
    font-size: 28px;
    cursor:pointer; 
    color: #f7f7f7;
  }

  #logo{
    width: 180px;
    margin-top: 5px;
    margin-bottom: 40px;
    margin-left: 17px;
  }
  
  @media screen and (max-width: 992px){
    #logo{
      display: none;
    }
  }

  input, select{
    width: 190px;
  }

  .formsArea{
    background-color: #00000021;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    /* align-items: center; */
  }
  .formsArea * {
    margin-bottom: 5px;
  }
  .formsArea > * {
    margin-left: 4px;
  }
  .radioButtonDiv{
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100px;
    align-self: flex-end;
  }

</style>