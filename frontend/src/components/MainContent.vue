<template>
    <div id="main" :style="mainStyle">
        <Chart type="Temperatura" v-if="currentChart == 'Temperatura'" />
        <Chart type="Massa" v-else />
        <ControlPane />
        <Chart type="Controle" />
    </div>
</template>

<script>

import Chart from './Chart'
import ControlPane from './ControlPane'

export default {
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