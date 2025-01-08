<script lang="ts" setup>
// import { onMounted } from 'vue'
//
// import * as Cesium from 'cesium'
//
// import 'cesium/Build/Cesium/Widgets/widgets.css'
//
// window.CESIUM_BASE_URL = '/Cesium'
// console.log('In sat/index.vue')
//
// Cesium.Ion.defaultAccessToken =
//  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OGQxZDAzOC04YzFjLTQwNzMtOGZjMC0zMTRhYzY1N2FkNDAiLCJpZCI6ODMzNTgsImlhdCI6MTY0NTUzNjcyMX0.AREOCiP3UMdHDlvJsCfs0aMWtQqAUxVBWtNqRBLdCPE'
//
// onMounted(() => {
//  const viewer = new Cesium.Viewer('cesiumContainer', {
//    terrain: Cesium.Terrain.fromWorldTerrain(),
//    baseLayer: false,
//  })
//  viewer.camera.flyTo({
//    destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
//    orientation: {
//      heading: Cesium.Math.toRadians(0),
//      pitch: Cesium.Math.toRadians(-15),
//    },
//  })
// })
</script>
<template>
  <div id="cesiumContainer">Hello</div>
</template>
