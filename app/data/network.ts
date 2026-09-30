export const MAP_W = 1000
export const MAP_H = 383
const PPD = MAP_W / 360

/** Equirectangular projection used by both the dot map generator and the route SVG. */
export const project = (lon: number, lat: number): [number, number] => [(lon + 180) * PPD, (80 - lat) * PPD]

/** Coordinates + optional label offset. Human-readable names live in the i18n `airports.*` messages. */
export interface Airport { lon: number; lat: number; label?: [number, number] }
export const airports: Record<string, Airport> = {
  FRA: { lon: 8.57, lat: 50.03, label: [8, 14] },
  LHR: { lon: -0.45, lat: 51.47, label: [-30, -14] },
  AMS: { lon: 4.76, lat: 52.31 },
  CDG: { lon: 2.55, lat: 49.0 },
  IST: { lon: 28.75, lat: 41.27 },
  DXB: { lon: 55.36, lat: 25.25 },
  DOH: { lon: 51.56, lat: 25.27 },
  BOM: { lon: 72.87, lat: 19.09 },
  SIN: { lon: 103.99, lat: 1.36 },
  HKG: { lon: 113.91, lat: 22.31, label: [-12, 16] },
  PVG: { lon: 121.81, lat: 31.14 },
  ICN: { lon: 126.45, lat: 37.46 },
  NRT: { lon: 140.39, lat: 35.77 },
  SYD: { lon: 151.18, lat: -33.94 },
  JFK: { lon: -73.78, lat: 40.64 },
  ORD: { lon: -87.9, lat: 41.98, label: [-30, -12] },
  LAX: { lon: -118.41, lat: 33.94, label: [-30, 4] },
  MIA: { lon: -80.29, lat: 25.79 },
  YYZ: { lon: -79.63, lat: 43.68 },
  MEX: { lon: -99.07, lat: 19.44 },
  GRU: { lon: -46.47, lat: -23.43 },
  NBO: { lon: 36.93, lat: -1.32 },
  JNB: { lon: 28.24, lat: -26.14 },
  TAS: { lon: 69.28, lat: 41.26, label: [-6, -12] },
  SKD: { lon: 66.98, lat: 39.7 },
}

/** Airports drawn as labelled nodes on the map. */
export const mapNodes = ['FRA', 'LHR', 'IST', 'DXB', 'TAS', 'SIN', 'HKG', 'PVG', 'JFK', 'ORD', 'LAX', 'GRU', 'NBO', 'NRT', 'JNB'] as const

/** `transit` is an i18n key under `network.transit`; `popular` lanes have a `network.regions.<FROM>_<TO>` label. */
export interface Lane { from: string; to: string; transit: 'd1' | 'd12' | 'd2'; popular?: boolean }
export const lanes: Lane[] = [
  { from: 'FRA', to: 'JFK', transit: 'd1', popular: true },
  { from: 'HKG', to: 'FRA', transit: 'd12', popular: true },
  { from: 'PVG', to: 'LAX', transit: 'd12', popular: true },
  { from: 'DXB', to: 'NBO', transit: 'd1', popular: true },
  { from: 'LHR', to: 'GRU', transit: 'd2', popular: true },
  { from: 'LHR', to: 'ORD', transit: 'd1' },
  { from: 'FRA', to: 'DXB', transit: 'd1' },
  { from: 'DXB', to: 'HKG', transit: 'd12' },
  { from: 'IST', to: 'SIN', transit: 'd12' },
  { from: 'JFK', to: 'GRU', transit: 'd2' },
  { from: 'NRT', to: 'LAX', transit: 'd12' },
  { from: 'FRA', to: 'JNB', transit: 'd2' },
  { from: 'IST', to: 'TAS', transit: 'd1' },
  { from: 'TAS', to: 'DXB', transit: 'd1' },
  { from: 'PVG', to: 'TAS', transit: 'd1' },
]

export function arcPath(a: string, b: string) {
  const [x1, y1] = project(airports[a]!.lon, airports[a]!.lat)
  const [x2, y2] = project(airports[b]!.lon, airports[b]!.lat)
  const d = Math.hypot(x2 - x1, y2 - y1)
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - d * 0.22
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function distanceKm(a: string, b: string) {
  const A = airports[a], B = airports[b]
  if (!A || !B) return 0
  const r = (n: number) => (n * Math.PI) / 180
  const dLat = r(B.lat - A.lat), dLon = r(B.lon - A.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(A.lat)) * Math.cos(r(B.lat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)))
}

/** Indicative express transit window (days) from great-circle distance: flight time + ~12h handling. */
export function transitDays(km: number): [number, number] {
  const days = Math.max(1, Math.ceil((km / 800 + 12) / 24))
  return [days, days + (km > 8000 ? 1 : 0)]
}

/** Splits an i18n airport label "City, Country" into its parts. */
export const cityOf = (label: string) => label.split(',')[0]!.trim()
