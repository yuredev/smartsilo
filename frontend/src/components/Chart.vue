<template>
    <div class="chartArea color">
        <h2 class="centralizeSelf">{{type}}</h2>
        <Plotly :data="data" :layout="layout" :display-mode-bar="false" ref="chart"></Plotly>
        <div class="no-user-select" id="info">
            <span v-if="type != 'Controle'" id="stopwatch">elapsed time: {{time}}</span>
            <div class="centralizeSelf" id="value-div">
                <span>{{value.toFixed(2)}}</span>
                <span v-if="type == 'Temperatura'">°C</span>
                <span v-else-if="type == 'Massa'">g</span>
                <span v-else>v</span>
            </div>
        </div>
    </div>
</template>

<script>

import { Plotly } from 'vue-plotly';
import { eventBus } from '../eventBus';
import Stopwatch from '../utils/Stopwatch';

export default {
    data() {
        return {
            stopwatch: undefined,
            paused: false,
            time: undefined,
            chartInterval: undefined,
            setPointTemp: undefined,
            setPointMass: undefined,
            x: 0,
            value: 0,
            data: [{
                y: [],
                type:"line",
            }],
            layout: {
                height: 235,
                autosize: true,
                margin: { b: 50, t: 10 },
                plot_bgcolor:"rgb(37,42,63)",
                paper_bgcolor:"rgb(37,42,63)"
            }
        }
    },
    components: {
        Plotly
    },
    props: {
        type: {
            type: String,
            required: true
        }
    },
    created() {
        if (this.type != 'Controle') {
            this.data.push({
                y: [],
                type:"line",
                line: {
                    color: '#13c570',
                    width: 3
                }
            })
        }
    },
    mounted() {
        eventBus.$on('pause-chart', this.pauseChart);
        eventBus.$on('resume-chart', this.resumeChart);
        this.chartInterval = setInterval(() => this.updateChart(), 100);
        this.$socket.emit('getSetPoint');
        this.stopwatch = new Stopwatch();
        this.stopwatch.start();
        setInterval(() => this.time = this.stopwatch.getTime(), 1000);
    },
    methods: {
        pauseChart() {
            clearInterval(this.chartInterval);
            this.stopwatch.pause();
        },
        resumeChart() {
            this.chartInterval = setInterval(() => this.updateChart(), 100);
            this.stopwatch.start();
        },
        updateChart() {
            let newLayout = {
                xaxis: {
                    showticklabels: false,
                    range: [this.x - 150, this.x],
                },
            }
            switch (this.type) {
                case 'Controle':
                    this.$refs.chart.extendTraces({ y: [[this.value]] }, [0]);
                    newLayout.yaxis = { range: [0, 5] }
                    break;
                case 'Temperatura': 
                    this.$refs.chart.extendTraces({ y: [[this.value], [this.setPointTemp]] }, [0, 1]);
                    newLayout.yaxis = { range: [0, 45] }
                    break;
                case 'Massa': 
                    this.$refs.chart.extendTraces({ y: [[this.value], [this.setPointMass]] }, [0, 1]);
                    newLayout.yaxis = { range: [0, 1] }
            }
            this.x++;
            this.$refs.chart.relayout(newLayout);
        }
    },
    sockets: {
        changeSetPoint(newSetPoint) {
            if (this.type != 'Controle') {
                this.setPointTemp = newSetPoint;
            }
        },
        connect() {
            this.$socket.emit('vueConnected');
        },
        newData(newData) {
            // se o tipo de dado que chegar for do tipo que o gráfico está exibindo
            // o valor deve ser atualizado
            if (newData.type == this.type) {
                this.value = newData.value; 
            } 
        },
    }
}
</script>

<style scoped>
    h2{
        font-size: 1.3rem;
    }

    .color{
        background-color: rgb(37,42,63);
    }
    .centralizeSelf{
        display: flex;
        justify-content: center;
        align-self: center;
        display: flex;
        margin: 0;
    }
    .flex-evenly{
        display: flex;
        justify-content: space-evenly;
    }
    .chartArea{
        border-radius: 7px;
        padding: 0px 0px 5px 0px;
    }
    .no-user-select{
        user-select: none;
    }
    #info{
        display: flex;
        justify-content: space-evenly;
    }
    #value-div{
        display: flex;
        justify-content: center;
        font-size: 1.20rem;
    }
    #stopwatch{
        font-size: 1.15rem;
        color: rgba(230, 230, 255, 0.9);
        align-self: center;
        display: flex;
        justify-content: center;
    }
</style>