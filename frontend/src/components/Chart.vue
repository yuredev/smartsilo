<template>
    <div class="chartArea color">
        <h2 class="centralizeSelf">{{type}}</h2>
        <Plotly :data="data" :layout="layout" :display-mode-bar="false" ref="chart"></Plotly>
        <span>{{value}}</span>
    </div>
</template>

<script>

import { Plotly } from 'vue-plotly';

export default {
    data() {
        return {
            x: 0,
            value: undefined,
            data: [{
                y: [],
                type:"line",
            }],
            layout: {
                height: 225,
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
    methods: {
        addNumber() {
        this.value = Math.floor(Math.random() * 50);
        this.$refs.chart.extendTraces({ y: [[this.value]] }, [0]);
        this.x++;
        this.$refs.chart.relayout({
            xaxis: {
                showticklabels: false,
                range: [this.x - 150, this.x],
            },
            yaxis: {
                range: [0, 50]
            }
        });
    }
    },
    sockets: {
        connect() {
            this.$socket.emit('vueConnected');
        },
        newTemperature1(receivedData) {
            this.value = receivedData; 
        }
    }
}
</script>

<style scoped>
    .color{
        background-color: rgb(37,42,63);
    }
    .centralizeSelf{
        display: flex;
        justify-content: center;
    }
    .chartArea{
        border-radius: 5px;
        padding: 0px;
    }
</style>