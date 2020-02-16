<template>
    <div class="controlPane">
        <div>
            <label for="checkControl">gráfico de controle </label>
            <input type="checkbox" name="checkControl" id="checkControl">
        </div>
        <button>pausar</button>
        <button>inicar aquisição</button>
    </div>
</template>

<script>
export default {
    
}
</script>

<style scoped>
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
        margin-top: 5px;
        margin-bottom: 5px;
        display: flex;
        justify-content: center;
    }
</style>