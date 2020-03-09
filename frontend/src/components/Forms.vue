<template>
    <div class="formsDiv">
      <div class="formsArea">
        <div class="centralize-self" style="margin-top: 10px;">
          <label for="setPoint">Setpoint: </label>
          <div class="row">
            <input type="number" id="setPoint" name="setPoint" v-model="setPointTemp" @keyup.enter="setSetPoint">
            <button id="buttonOk" @click="setSetPoint">OK</button>
          </div>
        </div>
        <div class="centralize-self">
          <label for="controlMode">Control Mode:</label>
          <select name="controlMode" id="" :disabled="optionDisabled">
            <option value="controlMode" v-for="(controlMode, index) of controlModes" :key="index" @click="setControlMode(controlMode)">
              {{controlMode}}
            </option>
          </select>
        </div>
        <div class="radioButtonDiv" v-show="currentControlMode == 'Malha aberta'">
          <input type="radio" name="voltageRadioBtn" id="voltage0v">
          <label for="voltage0v">0v</label> 
          <input type="radio" name="voltageRadioBtn" id="voltage3v">
          <label for="voltage3v">3v</label> 
        </div>
        <div class="centralize-self" id="pid-consts" v-show="currentControlMode == 'PID'" style="margin-top: 0px;">
          <div class="row">
            <label for="kp">
              <abbr title="Proportional Band Width">pbw:</abbr>
            </label> 
            <input type="text" name="kp" v-model="pidConsts.KP" placeholder="em porcentagem">
          </div>
          <div class="row">
            <label for="ki">
              <abbr title="Integrative Time">it: </abbr>
            </label> 
            <input type="text" name="ki" v-model="pidConsts.KI">
          </div>
          <div class="row">
            <label for="kd">
              <abbr title="Derivative Time">
                dt: 
              </abbr>
            </label> 
            <input type="text" name="kd" v-model="pidConsts.KD">
          </div>
          <div class="row">
            <label for="h">
              <abbr title="Sampling Time">
                T: 
              </abbr>
            </label> 
            <input type="text" name="h" v-model="pidConsts.H">
          </div>
          <button @click="setPidConsts">Set constants</button>
        </div>
      </div>
      <div class="formsArea" style="margin-top: 40px;">
        <div class="centralize-self" style="margin-top: 10px">
          <label for="pin">Analog Channels</label>
          <div v-for="pin of 5" :key="pin">  
            <label for="">{{pin}}° </label>
            <select name="" id="pin">
              <option :selected="pin == n" v-for="n of 5" :key="-n" @click="addPin(pin, `A${n-1}`)">A{{n-1}}</option>
            </select>
          </div>
          <button @click="setPins">Set Pins</button>
        </div>
      </div>
    </div>

</template>


<script>
export default {
  data() {
    return {
      pins: ['A0','A1','A2','A3','A4'],
      currentControlMode: 'Malha aberta',
      setPointTemp: undefined,
      controlModes: [
        'Malha aberta',
        'PID',
        'ON/OFF'
      ],
      pidConsts: {
        KI: '1.27',
        KP: '30',
        KD: '6',
        H: '0.1'
      }
    }
  },
  props: {
    optionDisabled: Boolean
  },
  mounted() {
    this.$socket.emit('getSetPoint');
    Array.prototype.haveEqualItens = function() {
      for (let i = 0; i < this.length; i++) {
        for (let j = i + 1; j < this.length; j++) {
          if (this[i] == this[j]) {
              return true;
          }
        }
      }
      return false;
    }
  },
  sockets: {
    changeSetPoint(newSetPoint) {
      this.setPointTemp = newSetPoint;
    },
  },
  methods: {
    setPidConsts() {
      alert('Constantes de pid alteradas');
      this.$socket.emit('setPidConsts', this.pidConsts);
    },
    setPins() {
      if (this.pins.haveEqualItens()) {
        alert('Error, there are pins with equal values, each pin must have a different value');
      } else {
        alert('Pins successfully exchanged');
        this.$socket.emit('setPins', this.pins);
      }
    },
    addPin(pin, value) {
      this.pins.splice(pin-1, 1, value);
    },
    setSetPoint() {
      if (this.setPointTemp > 45) {
        alert('O Valor informado é alto demais, isso pode comprometer o hardware');
      } else {
        this.$socket.emit('changingSetPoint', this.setPointTemp);
      }
    },
    setControlMode(controlMode) {
      this.currentControlMode = controlMode;
      this.$emit('setControlMode', this.currentControlMode);
    }
  }
}
</script>


<style scoped>

  abbr {
    text-decoration: none;
  }

  .row > label {
    margin-right: 5px;
  }

  .row input{
    width: 132px;
  }

  .row{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  #buttonOk{
    display: flex;
    justify-content: center;
    width: 30px;
    margin-left: 1px;
  }

  .formsDiv{
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  label, h2{
    font-size: 1.0rem;
  }
  .centralize-self{
    display: flex;
    flex-direction: column;
    align-self: center;
  }

  input, select{
    width: 190px;
    border-width: 1px;
  }

  input#setPoint{
    width: 156px;
    text-align: right;
  }

  select#pin{
    width: 167px;
  }

  .formsArea {
    background-color: #00000021;
    display: flex;
    flex-direction: column;
  }
  .formsArea * {
    margin-bottom: 5px;
  }
  .formsArea > * {
    margin-left: 4px;
  }
  
  #pid-consts{
    width: 86.5%;
  }

  .row > label{
    width: 40px;
  }

  .radioButtonDiv{
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100px;
    align-self: flex-end;
    margin-right: 15px;
  }
</style>