<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { parseCsv, parseRows } from './data/parser'
import { rawRows } from './data/sample'
import type { RecordPoint } from './data/types'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const records = ref<RecordPoint[]>([])
const loadError = ref<string | null>(null)

const currentIndex = ref(0)
const mapRef = ref<HTMLDivElement | null>(null)
const mapInstance = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)
const track = ref<L.Polyline | null>(null)

const currentRecord = computed<RecordPoint | null>(() => records.value[currentIndex.value] ?? null)

const formatValue = (value?: number) => (value === undefined ? '—' : value.toFixed(2))

const updateMap = () => {
  if (!mapInstance.value || !currentRecord.value) return
  const { lat, lon } = currentRecord.value.position
  const latLng = L.latLng(lat, lon)

  if (!marker.value) {
    marker.value = L.marker(latLng).addTo(mapInstance.value)
  } else {
    marker.value.setLatLng(latLng)
  }

  const path = records.value.map((item) => L.latLng(item.position.lat, item.position.lon))
  if (!track.value) {
    track.value = L.polyline(path, { color: '#2563eb', weight: 3 }).addTo(mapInstance.value)
  } else {
    track.value.setLatLngs(path)
  }

  mapInstance.value.setView(latLng, 16)
}

const buildMap = () => {
  if (!mapRef.value) return
  const instance = L.map(mapRef.value, { zoomControl: true }).setView([30.64817047, 104.0904083], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(instance)
  mapInstance.value = instance
  updateMap()
}

const loadData = async () => {
  try {
    const response = await fetch('/services-neighbors.csv')
    if (!response.ok) throw new Error(`CSV 加载失败: ${response.status}`)
    const text = await response.text()
    const rows = parseCsv(text)
    records.value = parseRows(rows)
    currentIndex.value = 0
    updateMap()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'CSV 加载失败'
    records.value = parseRows(rawRows)
    currentIndex.value = 0
    updateMap()
  }
}

onMounted(() => {
  buildMap()
  loadData()
})

watch(currentIndex, updateMap)
watch(records, updateMap)
</script>

<template>
  <div class="app">
    <section class="map-panel">
      <div v-if="loadError" class="banner">{{ loadError }}</div>
      <div ref="mapRef" class="map"></div>
      <div class="time-control">
        <button
          class="control-btn"
          type="button"
          :disabled="records.length === 0 || currentIndex === 0"
          @click="currentIndex--"
        >
          上一条
        </button>
        <input
          class="slider"
          type="range"
          min="0"
          :max="Math.max(records.length - 1, 0)"
          v-model.number="currentIndex"
        />
        <button
          class="control-btn"
          type="button"
          :disabled="records.length === 0 || currentIndex === records.length - 1"
          @click="currentIndex++"
        >
          下一条
        </button>
      </div>
    </section>

    <aside class="info-panel" v-if="currentRecord">
      <header>
        <h1>NR 外场数据面板</h1>
        <p class="timestamp">{{ currentRecord.time }}</p>
        <p class="position">经度 {{ currentRecord.position.lon.toFixed(6) }}，纬度 {{ currentRecord.position.lat.toFixed(6) }}</p>
      </header>

      <section class="card">
        <h2>服务小区</h2>
        <div class="grid">
          <div>
            <span>PCI</span>
            <strong>{{ currentRecord.serving.pci }}</strong>
          </div>
          <div>
            <span>RSRP</span>
            <strong>{{ formatValue(currentRecord.serving.rsrp) }}</strong>
          </div>
          <div>
            <span>SINR</span>
            <strong>{{ formatValue(currentRecord.serving.sinr) }}</strong>
          </div>
          <div>
            <span>RSRQ</span>
            <strong>{{ formatValue(currentRecord.serving.rsrq) }}</strong>
          </div>
          <div>
            <span>RSSI</span>
            <strong>{{ formatValue(currentRecord.serving.rssi) }}</strong>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>邻区列表</h2>
        <div v-if="currentRecord.neighbors.length === 0" class="empty">暂无邻区数据</div>
        <div v-else class="neighbor-list">
          <article v-for="neighbor in currentRecord.neighbors" :key="neighbor.idx" class="neighbor">
            <h3>邻区 N{{ neighbor.idx }}</h3>
            <div class="grid">
              <div>
                <span>ARFCN</span>
                <strong>{{ formatValue(neighbor.arfcn) }}</strong>
              </div>
              <div>
                <span>PCI</span>
                <strong>{{ formatValue(neighbor.pci) }}</strong>
              </div>
              <div>
                <span>Mod6</span>
                <strong>{{ formatValue(neighbor.mod6) }}</strong>
              </div>
              <div>
                <span>BeamIndex</span>
                <strong>{{ formatValue(neighbor.beamIndex) }}</strong>
              </div>
              <div>
                <span>RSRP</span>
                <strong>{{ formatValue(neighbor.rsrp) }}</strong>
              </div>
              <div>
                <span>SINR</span>
                <strong>{{ formatValue(neighbor.sinr) }}</strong>
              </div>
              <div>
                <span>RSRQ</span>
                <strong>{{ formatValue(neighbor.rsrq) }}</strong>
              </div>
              <div>
                <span>RSSI</span>
                <strong>{{ formatValue(neighbor.rssi) }}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </aside>
  </div>
</template>
