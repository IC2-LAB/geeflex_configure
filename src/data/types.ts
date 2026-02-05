export interface Neighbor {
  idx: number
  arfcn?: number
  pci?: number
  mod6?: number
  beamIndex?: number
  rsrp?: number
  sinr?: number
  rsrq?: number
  rssi?: number
}

export interface RecordPoint {
  time: string
  position: {
    lon: number
    lat: number
  }
  serving: {
    pci: number
    rsrp?: number
    sinr?: number
    rsrq?: number
    rssi?: number
  }
  neighbors: Neighbor[]
}
