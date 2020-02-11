<template>
    <div>
        {{type}}: {{value}}
    </div>
</template>

<script>
export default {
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