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
          <label for="controlMode">Modo de controle:</label>
          <select name="controlMode" id="" :disabled="optionDisabled">
            <option value="controlMode" v-for="(controlMode, index) of controlModes" :key="index" @click="setControlMode(controlMode)">
              {{controlMode}}
            </option>
          </select>
        </div>
        <div class="radioButtonDiv">
          <input type="radio" name="voltageRadioBtn" id="voltage0v">
          <label for="voltage0v">0v</label> 
          <input type="radio" name="voltageRadioBtn" id="voltage3v">
          <label for="voltage3v">3v</label> 
        </div>
      </div>
      <div class="formsArea" style="margin-top: 40px;">
        <div class="centralize-self" style="margin-top: 10px">
          <label for="pin">Canais</label>
          <div v-for="pin of 6" :key="pin">  
            <label for="">{{pin}}° </label>
            <select name="" id="pin">
              <option :key="-n" :value="n" v-for="n of 5">A{{n}}</option>
            </select>
          </div>
          <button>Setar canais</button>
        </div>
      </div>
    </div>

</template>


<script>
export default {
  data() {
    return {
      currentControlMode: 'Malha aberta',
      setPointTemp: undefined,
      controlModes: [
        'Malha aberta',
        'PID',
        'ON/OFF'
      ]
    }
  },
  props: {
    optionDisabled: Boolean
  },
  mounted() {
    this.$socket.emit('getSetPoint');
  },
  sockets: {
    changeSetPoint(newSetPoint) {
      this.setPointTemp = newSetPoint;
    },
  },
  methods: {
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
    /* height: 100%; */
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
  .radioButtonDiv{
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100px;
    align-self: flex-end;
    margin-right: 15px;
  }
</style>