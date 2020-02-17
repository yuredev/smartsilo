<template>
    <div class="controlPane">
        <div class="checkDiv">
            <label for="checkControl">gráfico de controle </label>
            <input type="checkbox" name="checkControl" id="checkControl">
        </div>
        <button @click="pauseChart">{{getButtonText}}</button>
        <button>inicar aquisição</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            buttonIsPaused: false
        }
    },
    computed: {
        getButtonText() {
            return this.buttonIsPaused ? 'retomar' : 'pausar';
        }
    },
    methods: {
        pauseChart() {
            this.buttonIsPaused =! this.buttonIsPaused;
            this.$emit('pauseChart');
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