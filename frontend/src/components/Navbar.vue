<template>
    <nav class="navbar">
        <span id="hamburger" :style="data"  @click="openNav()">&#9776;</span>
        <ul>
            <li>
                <a href="">Temperatura</a>
            </li>
            <li>
                <a href="">Massa</a>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            default() {
                return { display: undefined }
            }
        }
    },
    methods: {
        openNav() {
            this.$emit('openNav');
        }
    },
}
</script>

<style scoped>
    #hamburger{
        font-size: 35px;
        cursor:pointer; 
        color: white;
    }
    .navbar *{
        margin: 5px 15px 5px 15px;
        font-size: 1.3rem;
        margin: 5px 15px 5px 15px;
    }
    ul{
        padding: 0;
        display: flex;
        align-items: center;
    }
    ul li{
        display: inline;
    }
    ul li a{
        text-decoration: none;
        color: #A8A8A8;
        transition: 0.3s;
    }
    ul li a:hover{
        color: #f7f7f7;
    }
    .navbar{
        z-index: 2;
        background-color: #2d3744;
        display: flex;
        justify-content: space-between;
    }
</style>