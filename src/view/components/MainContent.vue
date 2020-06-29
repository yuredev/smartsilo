<template>
  <div id="main" :style="mainStyle">
    <div class="centralize-content chartArea" v-if="showChart">
      <img :src="'file:///' + plotPath" id="chartResult" alt="gráfico gerado" />
      <button @click="showChart = false">voltar</button>
    </div>
    <div v-show="!showChart">
      <div class="centralize-content chartArea" v-if="showLoadingScreen">
        <img src="../assets/load.gif" alt />
        <h2>Please wait while the chart is being plotted</h2>
      </div>
      <div v-show="!showLoadingScreen">
        <Chart
          v-show="currentChart == 'Temperature'"
          type="Temperature"
          :paused="chartIsPaused"
          key="chart1"
        />
        <Chart v-show="currentChart == 'Mass'" type="Mass" :paused="chartIsPaused" key="chart2" />
        <ControlPane @pauseChart="pauseChart" @showLoadingScreen="showLoadingScreen = true" />
        <Chart v-show="controlChartVisibility" type="Control" />
      </div>
    </div>
  </div>
</template>

<script>
import Chart from './Chart';
import ControlPane from './ControlPane';
import { eventBus } from '../eventBus';
import { ipcRenderer } from 'electron';

export default {
  components: {
    Chart,
    ControlPane
  },
  data() {
    return {
      plotPath: null,
      showChart: false,
      chartIsPaused: false,
      showLoadingScreen: false,
      controlChartVisibility: true
    };
  },
  created() {
    eventBus.$on(
      'set-control-chart-visibility',
      this.setControlChartVisibility
    );
  },
  mounted() {
    ipcRenderer.on('chart-ready', (evt, plotPath) => {
      this.showLoadingScreen = false;
      this.showChart = true;
      this.plotPath = plotPath;
    })
  },
  props: {
    currentControlMode: {
      type: String,
      required: true
    },
    currentChart: {
      type: String,
      required: true
    },
    mainStyle: {
      type: Object,
      required: true
    }
  },
  methods: {
    setControlChartVisibility(newVisibility) {
      this.controlChartVisibility = newVisibility;
    },
    pauseChart() {
      this.chartIsPaused = !this.chartIsPaused;
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
button:hover {
  transform: scale(1.02);
  color: #fdfdfd;
}
.chartArea {
  border-radius: 7px;
  padding: 10px 0px 10px 0px;
  background-color: rgb(37, 42, 63);
}
.centralize-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#chartResult {
  max-width: 750px;
  width: 80%;
  margin-bottom: 5px;
}
#main {
  transition: margin-left 0.5s;
  margin: 0px;
  border: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 14px;
  background-color: #202537;
}
</style>