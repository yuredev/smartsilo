<template>
    <div class="chartArea color">
        <h2 class="centralizeSelf">{{type}}</h2>
        <Plotly :data="data" :layout="layout" :display-mode-bar="false" ref="chart"></Plotly>
        <span v-if="type">{{value}}</span>
    </div>
</template>

<script>

import { Plotly } from 'vue-plotly';

export default {
    data() {
        return {
            setPoint: undefined,
            x: 0,
            value: undefined,
            data: [{
                y: [],
                type:"line"
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
    created() {
        if (this.type != 'Controle') {
            this.data.push({
                y: [],
                type:"line"
            })
        }
    },
    mounted() {
        setInterval(() => this.updateChart(), 100);
    },
    methods: {
        updateChart() {
            if (this.type == 'Controle') {
                this.$refs.chart.extendTraces({ y: [[this.value]] }, [0]);
            } else {
                this.$refs.chart.extendTraces({ y: [[this.value], [this.setPoint]] }, [0, 1]);
            }
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
        changeSetPoint(newSetPoint) {
            if (this.type != 'Controle') {
                this.setPoint = newSetPoint;
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