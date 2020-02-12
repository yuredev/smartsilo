<template>
    <div id="main" :style="mainStyle">
        <Chart :type="currentChart" />
        <ControlPane />
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
    padding: 0px;
    border: 0px;
}
</style>