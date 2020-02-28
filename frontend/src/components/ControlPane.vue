<template>
    <div class="controlPane">
        <div class="checkDiv">
            <label for="checkControl">control signal </label>
            <input type="checkbox" name="checkControl" id="checkControl" v-model="showChart">
        </div>
        <button @click="pauseChart" v-if="buttonIsPaused">resume</button>
        <button v-else @click="pauseChart">pause</button>
        <div v-show="currentControlMode != 'Malha aberta'">
            <button @click="stopExperiment" v-if="hardwareIsBusy" >stop acquisition</button>
            <button @click="startExperiment" v-else>start acquisition</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showChart: false,
            buttonIsPaused: false,
            hardwareIsBusy: false
        }
    },
    watch: {
        showChart() {
            this.$emit('setControlVisibility', this.showChart);
        }
    },
    props: {
        currentControlMode: {
            required: true,
            type: String
        }
    },
    mounted() {
    },
    sockets: {
        connect() {
            // assim que a conexão websocket com o servidor for concluída é preciso obter o estado do secador
            // para saber se ele está ou não ocupado
            this.$socket.emit('getHardwareState');
        },
        setHardwareState(hardwareIsBusy) {
            this.hardwareIsBusy = hardwareIsBusy;
        }
    },
    methods: {
        pauseChart() {
            this.buttonIsPaused =! this.buttonIsPaused;
            this.$emit('pauseChart');
        },
        startExperiment() {
            this.hardwareIsBusy = true;
            this.$emit('setOptionDisabled', true);
            this.$socket.emit('startExperiment', this.currentControlMode);
        },
        stopExperiment() {
            this.hardwareIsBusy = false;
            this.$emit('showLoadingScreen');
            this.$emit('setOptionDisabled', false);
            this.$socket.emit('stopExperiment');
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
    label{
        color: #DDDDDD;
        font-size: 1.1rem;
    }
    button:hover, .checkDiv:hover{
        transform: scale(1.02);
        color: #FDFDFD;
    }
    .checkDiv{
        user-select: none;
    }

    @media screen and (max-width: 992px){
        .controlPane > * {
            margin-left: 15px;
            margin-right: 15px;
        }
    } 

    @media screen and (min-width: 992px){
        .controlPane > * {
            margin-left: 50px;
            margin-right: 50px;
        }
    } 
    
    .controlPane{
        margin-top: 4px;
        margin-bottom: 4px;
        display: flex;
        justify-content: center;
    }
</style>