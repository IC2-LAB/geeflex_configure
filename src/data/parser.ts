import type { Neighbor, RecordPoint } from './types'

const neighborIndexes = [1, 2, 3, 4, 5, 6, 7, 8]

const toNumber = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  if (!text) return undefined
  const num = Number(text)
  return Number.isFinite(num) ? num : undefined
}

const toRequiredNumber = (value: string | number | undefined, fallback = 0): number => {
  const num = toNumber(value)
  return num === undefined ? fallback : num
}

const getValue = (row: Record<string, string>, key: string): string | undefined => {
  if (key in row) return row[key]
  return undefined
}

const parseCsvLine = (line: string, separator = ','): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 1
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === separator && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result
}

export const parseCsv = (csvText: string): Array<Record<string, string>> => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) return []

  const headerLine = lines[0] ?? ''
  const headers = parseCsvLine(headerLine).map((header) => header.trim())
  headers[0] = (headers[0] ?? '').replace(/^\uFEFF/, '')
  const rows: Array<Record<string, string>> = []

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line) continue
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
    })
    rows.push(row)
  }

  return rows
}

const parseNeighbor = (row: Record<string, string>, idx: number): Neighbor | null => {
  const arfcn = toNumber(getValue(row, `N${idx}_SS ARFCN`))
  const pci = toNumber(getValue(row, `N${idx}_PCI`))
  const mod6 = toNumber(getValue(row, `N${idx}_Mod6`))
  const beamIndex = toNumber(getValue(row, `N${idx}_BeamIndex`))
  const rsrp = toNumber(getValue(row, `N${idx}_SS RSRP`))
  const sinr = toNumber(getValue(row, `N${idx}_SS SINR`))
  const rsrq = toNumber(getValue(row, `N${idx}_SS RSRQ`))
  const rssi = toNumber(getValue(row, `N${idx}_SS RSSI`))

  const hasAny = [arfcn, pci, mod6, beamIndex, rsrp, sinr, rsrq, rssi].some(
    (value) => value !== undefined
  )

  if (!hasAny) return null

  return {
    idx,
    arfcn,
    pci,
    mod6,
    beamIndex,
    rsrp,
    sinr,
    rsrq,
    rssi
  }
}

export const parseRows = (rows: Array<Record<string, string>>): RecordPoint[] => {
  return rows.map((row) => {
    const neighbors = neighborIndexes
      .map((idx) => parseNeighbor(row, idx))
      .filter((item): item is Neighbor => item !== null)

    return {
      time: row.Time ?? '',
      position: {
        lon: toRequiredNumber(row.Longitude),
        lat: toRequiredNumber(row.Latitude)
      },
      serving: {
        pci: toRequiredNumber(row.NR_PCI),
        rsrp: toNumber(row.NR_RSRP),
        sinr: toNumber(row.NR_SINR),
        rsrq: toNumber(row.NR_RSRQ),
        rssi: toNumber(row.NR_RSSI)
      },
      neighbors
    }
  })
}
