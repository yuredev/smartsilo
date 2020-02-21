<template>
    <div id="main" :style="mainStyle">
        <div class="centralize-content chartArea" v-if="showChart">
            <img src="../assets/chart.png" id="chartResult">
            <button @click="showChart = false">voltar</button>
        </div>
        <div v-else>
            <div class="centralize-content chartArea" v-if="showLoadingScreen">
                <img src="../assets/loading.png" alt="">
                <h2>O Servidor está gerando o gráfico, aguarde...</h2>
            </div>
            <div v-else>
                <Chart v-if="currentChart == 'Temperatura'" type="Temperatura" :paused="chartIsPaused" key="chart1"/>
                <Chart v-else type="Massa" :paused="chartIsPaused" key="chart2" />
                <ControlPane @pauseChart="pauseChart" 
                            @setOptionDisabled="$emit('setOptionDisabled', $event)" 
                            @showLoadingScreen="showLoadingScreen = true"
                            :currentControlMode="currentControlMode"
                            />
                <Chart type="Controle" />
            </div>
        </div>
    </div>
</template>

<script>

import Chart from './Chart'
import ControlPane from './ControlPane'

export default {
    data() {
        return {
            showChart: false,
            chartIsPaused: false,
            showLoadingScreen: false
        }
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
    components: {
        Chart, ControlPane
    },
    methods: {
        pauseChart() {
            this.chartIsPaused =! this.chartIsPaused;
        }
    },
    sockets: {
        chartReady() {
            this.showLoadingScreen = false;
            this.showChart = true;
        }
    }
}
</script>

<style scoped>

button{
    background-color: rgb(37,42,63);
    border-style: solid;
    border-width: 1px;
    border-color: rgba(240, 248, 255, 0.226);
    box-shadow: 0 0 0.1em rgba(240, 248, 255, 0.226);
    font-size: 0.95rem;
    color: #DDDDDD;
    font-family: Helvetica, sans-serif;
}

button:hover{
    transform: scale(1.02);
    color: #FDFDFD;
}

.chartArea{
    border-radius: 7px;
    padding: 10px 0px 10px 0px;
    background-color: rgb(37,42,63);
}

.centralize-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

#chartResult{
    max-width: 750px;
    width: 80%;
    margin-bottom: 5px;
}

#main {
    transition: margin-left .5s;
    margin: 0px;
    border: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 14px;
    background-color: #202537;
}

</style>