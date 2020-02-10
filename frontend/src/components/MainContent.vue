<template>
   <div id="main" :style="styles.mainData">
      <Chart :type="currentChart" />
      <Controls />
      <Chart />
    </div>
</template>

<script>

import Chart from './Chart'
import Controls from './Controls'

export default {
    components: {
        Chart, Controls
    }
}
</script>

<style scoped>
    
</style>