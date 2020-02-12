<template>
    <div>
        {{type}}:
        <span v-show="false">{{}}</span>
    </div>
</template>

<script>

export default {
    create() {
        // alert(Plotly);
    },
    data() {
        return {
            value: undefined
        }
    },
    props: {
        type: {
            type: String,
            required: true
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