<template>
  <div class="controlPane">
    <div class="checkDiv">
      <label for="checkControl">control signal</label>
      <input type="checkbox" id="checkControl" v-model="controlChartVisibility" />
    </div>
    <button @click="resumeChart" v-if="chartPaused">resume</button>
    <button v-else @click="pauseChart">pause</button>
    <div v-show="currentControlMode != 'Open loop'">
      <button @click="stopExperiment" v-if="experimentOccurring">stop acquisition</button>
      <button @click="startExperiment" v-else>start acquisition</button>
    </div>
  </div>
</template>

<script>
import eventBus from '../utils/event-bus';
import websocketBus from '../utils/websocket-bus';

export default {
  data() {
    return {
      controlChartVisibility: true,
      chartPaused: false,
      experimentOccurring: false,
      currentControlMode: 'Open loop'
    };
  },
  created() {
    eventBus.$on('set-control-mode', this.setControlMode);
  },
  watch: {
    controlChartVisibility() {
      eventBus.$emit(
        'set-control-chart-visibility',
        this.controlChartVisibility
      );
    }
  },
  methods: {
    setControlMode(newControlMode) {
      this.currentControlMode = newControlMode;
    },
    pauseChart() {
      this.chartPaused = true;
      eventBus.$emit('pause-chart');
    },
    resumeChart() {
      this.chartPaused = false;
      eventBus.$emit('resume-chart');
    },
    startExperiment() {
      this.experimentOccurring = true;

      // disable the select form in the SideNav component
      // to prevent that the control mode be changed
      eventBus.$emit('set-option-disabled', true); 
      
      websocketBus.$emit('start-experiment', this.currentControlMode);
    },
    stopExperiment() {
      this.experimentOccurring = false;
      this.$emit('showLoadingScreen');
      eventBus.$emit('set-option-disabled', false);
      websocketBus.$emit('stop-experiment');
    }
  }
};
</script>

<style scoped>
button {
  background-color: rgb(37, 42, 63);
  border-style: solid;
  border-width: 1px;
  border-color: rgba(240, 248, 255, 0.226);
  box-shadow: 0 0 0.1em rgba(240, 248, 255, 0.226);
  font-size: 0.95rem;
  color: #dddddd;
  font-family: Helvetica, sans-serif;
}
label {
  color: #dddddd;
  font-size: 1.1rem;
}
button:hover,
.checkDiv:hover {
  transform: scale(1.02);
  color: #fdfdfd;
}
.checkDiv {
  user-select: none;
}
@media screen and (max-width: 992px) {
  .controlPane > * {
    margin-left: 15px;
    margin-right: 15px;
  }
}
@media screen and (min-width: 992px) {
  .controlPane > * {
    margin-left: 50px;
    margin-right: 50px;
  }
}
.controlPane {
  margin-top: 4px;
  margin-bottom: 4px;
  display: flex;
  justify-content: center;
}
</style>