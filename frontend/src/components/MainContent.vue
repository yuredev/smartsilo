<template>
    <div id="main" :style="mainStyle">
        <Chart v-if="currentChart == 'Temperatura'" type="Temperatura" :paused="chartIsPaused" key="chart1"/>
        <Chart v-else type="Massa" :paused="chartIsPaused" key="chart2" />
        <ControlPane @pauseChart="pauseChart"/>
        <Chart type="Controle" />
    </div>
</template>

<script>

import Chart from './Chart'
import ControlPane from './ControlPane'

export default {
    data() {
        return {
            chartIsPaused: false
        }
    },
    props: {
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
    }
}
</script>

<style scoped>
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

#main *{
    
}
</style>