<template>
  <div class="formsDiv">
    <div class="formsArea">
      <div class="centralize-self" style="margin-top: 10px;">
        <label for="setPoint">Setpoint:</label>
        <div class="row">
          <input
            type="number"
            id="setPoint"
            name="setPoint"
            v-model="setpointTemp"
            @keyup.enter="sendSetpoint"
          />
          <button id="button-change" @click="sendSetpoint">Change</button>
        </div>
      </div>
      <div class="centralize-self">
        <label for="controlMode">Control Mode:</label>
        <select name="controlMode" :disabled="disableControlModeSelection" v-model="selectedControlMode">
          <option>Open loop</option>
          <option>PID</option>
          <option>ON/OFF</option>
        </select>
      </div>
      <div class="radioButtonDiv" v-show="selectedControlMode == 'Open loop'">
        <input type="radio" name="voltageRadioBtn" id="voltage0v" @click="setOpenLoopVoltage(0)" checked />
        <label for="voltage0v">0v</label>
        <input type="radio" name="voltageRadioBtn" id="voltage3v" @click="setOpenLoopVoltage(3)" />
        <label for="voltage3v">3v</label>
      </div>
      <div id="pid-consts-div" v-show="selectedControlMode == 'PID'">
        <label>PID Settings:</label>
        <div class="flex-bet">
          <abbr class="input-abbr flex-bet" title="Proportional band width. Must be between 0 and 100">
            <span>PB: </span>
            <input 
              :disabled="disableControlModeSelection"
              class="input-pid"
              type="number"
              v-model="pidConsts.pb"
              placeholder="Proportional band width"  
              min="0"
              max="100"
              @keyup.enter="sendPidConsts"
            >
          </abbr>
          <div class="flex-bet academic-label">
            <span>KP: </span>
            <span>{{kp.toFixed(2)}}</span>
          </div>
        </div>
        <div class="flex-bet">
          <abbr class="input-abbr flex-bet" title="Integrative time">
            <span>TI: </span>
            <input 
              :disabled="disableControlModeSelection"
              class="input-pid"
              type="number"
              v-model="pidConsts.ti"
              placeholder="Integrative time"  
              @keyup.enter="sendPidConsts"
            >
          </abbr>
          <div class="flex-bet academic-label">
            <span>KI: </span>
            <span>{{ki.toFixed(2)}}</span>
          </div>
        </div>
        <div class="flex-bet">
          <abbr class="input-abbr flex-bet" title="Derivative time">
            <span>TD: </span>
            <input 
              :disabled="disableControlModeSelection"
              class="input-pid"
              type="number"
              v-model="pidConsts.td"
              placeholder="Derivative time"  
              @keyup.enter="sendPidConsts"
            >
          </abbr>
          <div class="flex-bet academic-label">
            <span>KD: </span>
            <span>{{kd.toFixed(2)}}</span>
          </div>
        </div>
        <div class="flex-evenly">
          <button :disabled="disableControlModeSelection" @click="resetPidConsts">Reset</button>
          <button :disabled="disableControlModeSelection" @click="sendPidConsts">Confirm</button>
        </div>
      </div>

    </div>
    <div class="formsArea" style="margin-top: 27px;">
      <div class="centralize-self" style="margin-top: 10px">
        <label for="pin">Pins:</label>
        <div v-for="pin of 5" :key="pin">
          <label>{{pin}}° </label>
          <select id="pin" v-model="pins[pin-1]" :disabled="disableControlModeSelection">
            <option v-for="avaliablePin of 6" :key="avaliablePin">{{'A'+(avaliablePin-1)}}</option>
          </select>
        </div>
        <button :disabled="disableControlModeSelection" @click="setPins">Set Pins</button>
      </div>
    </div>
  </div>
</template>

<script>
import eventBus from '../utils/event-bus';
import websocketBus from '../utils/websocket-bus';
import sweetAlert from '../utils/sweet-alert';
import haveEqualItens from '../services/array-have-equal-itens';

export default {
  data() {
    return {
      pins: ['A0', 'A1', 'A2', 'A3', 'A4'],
      selectedControlMode: 'Open loop',
      setpointTemp: null,
      disableControlModeSelection: false,
      controlModes: ['Open loop', 'PID', 'ON/OFF'],
      pidConsts: {
        pb: null,
        ti: null,
        td: null,
      }
    };
  },
  mounted() {
    eventBus.$on('set-option-disabled', this.switchSelectState);

    websocketBus.$on('set-setpoint', this.setSetPoint);
    websocketBus.$on('set-pid-consts', this.setPidConsts);

    setTimeout(() => {
      websocketBus.$emit('get-setpoint');
      websocketBus.$emit('get-pid-consts');
    }, 2000);
  },
  computed: {
    kp() {
      return 1 / (this.pidConsts.pb / 100);
    },
    ki() {
      return this.kp / this.pidConsts.ti;
    },
    kd() {
      return this.kp * this.pidConsts.td;
    }
  },
  methods: {
    resetPidConsts() {
      this.pidConsts =  {
        pb: 30,   // proportional band width 
        ti: 1.27, // integral time
        td: 6     // derivative time
      };
      websocketBus.$emit('set-pid-consts', this.pidConsts);
      sweetAlert.fire('success', 'Pid constants changed successfully');
    },
    setPidConsts(newPidConsts) {
      this.pidConsts = newPidConsts;
    },
    sendPidConsts() {
      if (!this.pidConsts.pb || !this.pidConsts.ti || !this.pidConsts.td) {
        sweetAlert.fire(
          'error', 
          'Sorry, but you can\'t do this', 
          'You have to fill all of the pid constants fields to change'
        );
        return;
      } 
      if (this.pidConsts.pb < 0 || this.pidConsts.pb > 100) {
        sweetAlert.fire(
          'error', 
          'Sorry, but you can\'t do this', 
          'You have to insert a value between 0 and 100'
        );
        return;
      }
      websocketBus.$emit('set-pid-consts', this.pidConsts);
      sweetAlert.fire('success', 'Pid settings changed successfully');
    },
    setOpenLoopVoltage(voltage) {
      websocketBus.$emit('set-open-loop-voltage', voltage);
    },
    switchSelectState(disableControlModeSelection) {
      this.disableControlModeSelection = disableControlModeSelection;
    },
    setPins() {
      if (haveEqualItens(this.pins)) {
        sweetAlert.fire(
          'error',
          'Sorry, but you can\'t do this',
          'There are pins with equal values, each pin must have a different value'
        );
      } else {
        websocketBus.$emit('set-pins', this.pins);
        sweetAlert.fire('success', 'Pins changed successfully');
      }
    },
    setSetPoint(newSetpoint) {
      this.setpointTemp = newSetpoint;
    },
    sendSetpoint() {
      if (this.setpointTemp > 40) {
        sweetAlert.fire(
          'error', 
          'Sorry, but you can\'t do this',
          'The value is too high, please reduce for not damage the hardware'
        );
        return;
      }
      // send the new setpoint to the Chart Component
      eventBus.$emit('set-setpoint', this.setpointTemp);
      websocketBus.$emit('set-setpoint', this.setpointTemp);
    }
  },
  watch: {
    selectedControlMode() {
      eventBus.$emit('set-control-mode', this.selectedControlMode);
    }
  },
};
</script>

<style scoped>

* {
  font-family: Helvetica, sans-serif;
}

button, select {
  cursor: pointer;
}

button,
select,
input {
  background-color: rgb(255, 255, 255, 0.90);
  border-style: solid;
  border-color: rgb(255, 255, 255, 0.40);
  border-radius: 2px;
  transition: .1s;
}

button:hover,
select:hover,
input:hover {
  filter: brightness(88%);
}

#pid-consts-div {
  display: flex;
  flex-direction: column;
  padding: 0px 13px;
  margin-top: 7px;
}

#pid-consts-div .input-abbr > .input-pid {
  width: 60px;
  height: 16px;
  text-align: right;
}

#pid-consts-div .input-abbr {
  width: 95px;
  text-decoration: none;
  margin-bottom: 0px;
  box-sizing: border-box;
}

#pid-consts-div .academic-label {
  width: 75px;
}

#pid-consts-div > label {
  margin-bottom: 8px;
}

.flex-bet {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1px !important;
}

.flex-evenly {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 1px !important;
}

.flex-evenly > button {
  width: 93px;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
#button-change {
  display: flex;
  justify-content: center;
  width: 55px;
  margin-left: 1px;
}
.formsDiv {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
label,
h2 {
  font-size: 1rem;
}
.centralize-self {
  display: flex;
  flex-direction: column;
  align-self: center;
}
input,
select {
  width: 190px;
  border-width: 1px;
}
input#setPoint {
  width: 132px;
  text-align: right;
}
select#pin {
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
.radioButtonDiv {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100px;
  align-self: flex-end;
  margin-right: 15px;
}
</style>