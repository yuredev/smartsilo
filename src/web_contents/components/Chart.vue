<template>
  <div class="chartArea color">
    <h2 class="centralizeSelf">{{type}}</h2>
    <Plotly :data="data" :layout="layout" :display-mode-bar="false" ref="chart" />
    <div class="no-user-select" id="info">
      <span v-if="type != 'Control'" id="stopwatch">elapsed time: {{time}}</span>
      <div class="centralizeSelf" id="value-div">
        <span>{{value.toFixed(2)}}</span>
        <span v-if="type == 'Temperature'">°C</span>
        <span v-else-if="type == 'Mass'">g</span>
        <span v-else>v</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { Plotly } from 'vue-plotly';
import eventBus from '../utils/event-bus';
import Stopwatch from '../utils/stopwatch';
import getTracesConfig from '../services/get-traces-config';

export default {
  components: {
    Plotly
  },
  data() {
    return {
      stopwatch: null,
      paused: false,
      time: null,
      chartInterval: null,
      setPointTemp: 30,
      setPointMass: null,
      x: 0,
      value: 0,
      data: [],
      layout: {
        font: {
          family: 'Helvetica',
          size: 18,
          color: 'rgb(240,240,240)'
        },
        height: 235,
        autosize: true,
        margin: { b: 50, t: 10 },
        plot_bgcolor: 'rgb(37,42,63)',
        paper_bgcolor: 'rgb(37,42,63)'
      }
    };
  },
  props: {
    expandChart: Boolean,
    type: {
      type: String,
      required: true
    }
  },
  created() {
    this.data = getTracesConfig(this.type);
  },
  mounted() {
    eventBus.$on('pause-chart', this.pauseChart);
    eventBus.$on('resume-chart', this.resumeChart);
    eventBus.$on('set-setpoint', this.setSetPoint);
    ipcRenderer.on('new-data', this.updateData);
    setTimeout(() => ipcRenderer.send('ready'), 2500);
    this.chartInterval = setInterval(() => this.updateChart(), 100);
    this.stopwatch = new Stopwatch();
    this.stopwatch.start();
    setInterval(() => (this.time = this.stopwatch.getTime()), 1000);
  },
  watch: {
    expandChart() {
      const newLayout = { ...this.layout };
      newLayout.height = this.expandChart ? 300 : 235;
      this.layout = newLayout; 
    }
  },
  methods: {
    setSetPoint(newSetPoint) {
      if (this.type != 'Control') {
        this.setPointTemp = newSetPoint;
      }
    },
    updateData(evt, newData) {
      // se o tipo de dado que chegar for do tipo que o gráfico está exibindo
      // o valor deve ser atualizado
      if (newData.type == this.type) {
        console.log('entrou');
        this.value = newData.value;
      } else {
        console.log('não entrou');
      }
    },
    pauseChart() {
      clearInterval(this.chartInterval);
      this.stopwatch.pause();
    },
    resumeChart() {
      this.chartInterval = setInterval(() => {
        this.updateChart();
      }, 100);
      this.stopwatch.start();
    },
    updateChart() {
      if (!this.$refs.chart || this.value < 0) return;
       
      let newLayout = {
        xaxis: {
          showticklabels: false,
          range: [this.x - 150, this.x]
        }
      };
      switch (this.type) {
        case 'Control':
          this.$refs.chart.extendTraces({ y: [[this.value]] }, [0]);
          newLayout.yaxis = { range: [0, 5] };
          break;
        case 'Temperature':
          this.$refs.chart.extendTraces(
            { y: [[this.value], [this.setPointTemp]] },
            [0, 1]
          );
          newLayout.yaxis = { range: [10, 35] };
          break;
        case 'Mass':
          this.$refs.chart.extendTraces(
            { y: [[this.value], [this.setPointMass]] },
            [0, 1]
          );
          newLayout.yaxis = { range: [0, 1] };
      }
      this.x++;
      this.$refs.chart.relayout(newLayout);
    }
  }
};
</script>

<style scoped>
h2 {
  font-size: 1.3rem;
}
.color {
  background-color: rgb(37, 42, 63);
}
.centralizeSelf {
  display: flex;
  justify-content: center;
  align-self: center;
  display: flex;
  margin: 0;
}
.flex-evenly {
  display: flex;
  justify-content: space-evenly;
}
.chartArea {
  border-radius: 7px;
  padding: 0px 0px 5px 0px;
}
.no-user-select {
  user-select: none;
}
#info {
  display: flex;
  justify-content: space-evenly;
}
#value-div {
  display: flex;
  justify-content: center;
  font-size: 1.2rem;
}
#stopwatch {
  font-size: 1.15rem;
  color: rgba(230, 230, 255, 0.9);
  align-self: center;
  display: flex;
  justify-content: center;
}
</style>