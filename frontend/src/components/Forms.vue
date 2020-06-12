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
            v-model="setPointTemp"
            @keyup.enter="setSetPoint"
          />
          <button id="buttonOk" @click="setSetPoint">OK</button>
        </div>
      </div>
      <div class="centralize-self">
        <label for="controlMode">Control Mode:</label>
        <select name="controlMode" :disabled="optionDisabled" v-model="currentControlMode">
          <option>Open loop</option>
          <option>PID</option>
          <option>ON/OFF</option>
        </select>
      </div>
      <div class="radioButtonDiv" v-show="currentControlMode == 'Open loop'">
        <input type="radio" name="voltageRadioBtn" id="voltage0v" @click="setOpenLoopVoltage(0)" />
        <label for="voltage0v">0v</label>
        <input type="radio" name="voltageRadioBtn" id="voltage3v" @click="setOpenLoopVoltage(3)" />
        <label for="voltage3v">3v</label>
      </div>
    </div>
    <div class="formsArea" style="margin-top: 40px;">
      <div class="centralize-self" style="margin-top: 10px">
        <label for="pin">Pins:</label>
        <div v-for="pin of 5" :key="pin">
          <label for>{{pin}}°</label>
          <select name id="pin">
            <option
              :selected="pin == n"
              v-for="n of 5"
              :key="-n"
              @click="addPin(pin, `A${n-1}`)"
            >A{{n-1}}</option>
          </select>
        </div>
        <button @click="setPins">Set Pins</button>
      </div>
    </div>
  </div>
</template>

<script>
import { haveEqualItens } from "../utils/arrayCustomFunctions";
import { eventBus } from "../eventBus";
import serverHandler from "../services/serverHandler";

export default {
  data() {
    return {
      pins: ["A0", "A1", "A2", "A3", "A4"],
      currentControlMode: "Open loop",
      setPointTemp: undefined,
      optionDisabled: false,
      controlModes: ["Open loop", "PID", "ON/OFF"]
    };
  },
  created() {
    eventBus.$on("set-option-disabled", this.switchSelectState);
  },
  mounted() {
    this.$socket.emit("getSetPoint");
  },
  methods: {
    setOpenLoopVoltage(voltage) {
      this.$socket.emit("setOpenLoopVoltage", voltage);
    },
    switchSelectState(optionDisabled) {
      this.optionDisabled = optionDisabled;
    },
    setPins() {
      if (haveEqualItens(this.pins)) {
        alert(
          "Error, there are pins with equal values, each pin must have a different value"
        );
        return;
      }
      serverHandler
        .post("/pins", {
          pins: this.pins
        })
        .then(() => {
          alert("Pins successfully exchanged");
        })
        .catch(() => console.log("error in setting pins, please try again"));
    },
    addPin(pin, value) {
      this.pins.splice(pin - 1, 1, value);
    },
    setSetPoint() {
      if (this.setPointTemp > 45) {
        alert(
          "The value is too high, please reduce for not damage the hardware"
        );
        return;
      }
      try {
        serverHandler.post("setpoint", {
          setpoint: this.setPointTemp
        });
      } catch (error) {
        alert("error in setpoint changing, please try again");
      }
    }
  },
  watch: {
    currentControlMode() {
      eventBus.$emit("set-control-mode", this.currentControlMode);
    }
  },
  sockets: {
    changeSetPoint(newSetPoint) {
      this.setPointTemp = newSetPoint;
    }
  }
};
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
#buttonOk {
  display: flex;
  justify-content: center;
  width: 30px;
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
  width: 156px;
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