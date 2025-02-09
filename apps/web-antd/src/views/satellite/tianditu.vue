<script lang="ts" setup>
import { reactive } from 'vue'
import { TdtMap } from 'vue-tianditu'

const loadConfig = {
  v: '4.0',
  tk: '0c7836f002032e57102d0bc58dd8bf24',
}

const state = reactive({
  center: [113.280_637, 23.125_178],
  zoom: 12,
})
</script>

<template>
  <div class="mapDiv">
    <TdtMap
      :center="state.center"
      :load-config="loadConfig"
      :zoom="state.zoom"
    />
  </div>
</template>

<style scoped>
.mapDiv {
  width: 100%;
  height: 100%;
}
</style>
