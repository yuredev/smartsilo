<template>
  <nav class="navbar">
    <span id="hamburger" @click="openNav()">&#9776;</span>
    <ul>
      <li>
        <span @click="setChart('Temperature')">Temperature</span>
      </li>
      <li>
        <span @click="setChart('Mass')">Mass</span>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  methods: {
    openNav() {
      this.$emit('openNav');
    },
    setChart(chart) {
      this.$emit('chartChange', chart);
    }
  }
};
</script>

<style scoped>
#hamburger {
  font-size: 28px;
  cursor: pointer;
  color: #a8a8a8;
  transition: 0.3s;
}
#hamburger:hover {
  color: #f7f7f7;
}
.navbar {
  z-index: 2;
  background-color: rgb(37, 42, 63);
  display: flex;
  justify-content: space-between;
  padding: 4px 15px 4px 15px;
}
.navbar * {
  padding: 0;
  margin: 0;
  border: 0;
  font-size: 1.3rem;
}
ul {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 225px;
}
ul li {
  display: inline;
}
ul li span {
  cursor: pointer;
  color: #a8a8a8;
  transition: 0.3s;
}
ul li span:hover {
  color: #f7f7f7;
}
</style>