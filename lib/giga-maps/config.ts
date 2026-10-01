/**
 * Shared configuration for the client side Giga Maps renderer.
 *
 * School dots come from the public Giga Maps backend as Mapbox Vector Tiles.
 * The basemap is OpenFreeMap (OpenMapTiles + OpenStreetMap data), which needs
 * no API key. Both are proxied / referenced from here so the map component,
 * the export helper and the API routes agree on one source of truth.
 */

export const GIGA_BACKEND = 'https://uni-ooi-giga-backend-hjekcuagasashucv.a03.azurefd.net'

export type DataLayer = 'school' | 'health' | 'all'
export type MapTheme = 'dark' | 'light'

export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

export const BASEMAP_STYLE: Record<MapTheme, string> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

/**
 * Basemap colors of maps.giga.global (its Mapbox style "GigaEntity-Dark-Mode",
 * read 1 Oct 2026). The dark theme repaints OpenFreeMap with these so an
 * export looks like a GigaMaps screenshot. GigaMaps has no light basemap.
 */
export const GIGAMAPS_DARK = {
  land: '#1c1c1c',
  water: '#1a2a3c',
  waterOutline: '#2e2e2e',
  border: '#7d7d7d',
  borderOpacity: 0.5,
} as const

/** Legend colors as used on maps.giga.global. */
export const DOT_COLORS = {
  connected: '#00d661',
  notConnected: '#ed5b4c',
  unknown: '#1d8cf0',
  good: '#00d661',
  moderate: '#f6c344',
  bad: '#ff5538',
} as const

/** Legend shared by every facility type. */
export const CONNECTIVITY_LEGEND = [
  { label: 'Connected', color: DOT_COLORS.connected },
  { label: 'Not connected', color: DOT_COLORS.notConnected },
  { label: 'Unknown', color: DOT_COLORS.unknown },
]

export const DATA_LAYERS: Record<
  DataLayer,
  { label: string; fileTag: string; entityCode: 'school' | 'health' | 'all' }
> = {
  school: { label: 'Schools', fileTag: 'schools', entityCode: 'school' },
  health: { label: 'Health centers', fileTag: 'health', entityCode: 'health' },
  all: { label: 'All facilities', fileTag: 'all-facilities', entityCode: 'all' },
}

/** Vector tile source-layer names inside the Giga v2 entity tiles. */
export const TILE_SOURCE_LAYERS = {
  school: 'school',
  health: 'entities',
} as const

export const MAP_ATTRIBUTION = '© OpenMapTiles © OpenStreetMap contributors · Facility data: Giga'

export type GigaMapCountry = {
  code: string
  name: string
  id: number
  bbox: [number, number, number, number] | null
  centroid: [number, number] | null
  schoolsTotal: number
  healthTotal: number
}

/**
 * A region is framed on its bounding box and drawn from the global tiles
 * (no country filter). `polygon` is a coarse outline, a dozen vertices at
 * most, used to hide the neighbours that a 16:9 frame inevitably shows
 * (Brazil next to Africa, Arabia next to the Horn) and to count what is in
 * view. Coordinates are [lon, lat]; the ring is closed at use.
 */
export type GigaMapRegion = {
  code: string
  name: string
  group: 'World' | 'Continents' | 'UNICEF regions'
  bbox: [number, number, number, number]
  polygon?: [number, number][]
}

export const REGIONS: GigaMapRegion[] = [
  { code: 'world', name: 'World', group: 'World', bbox: [-170, -56, 180, 75] },
  {
    code: 'africa', name: 'Africa', group: 'Continents', bbox: [-18.5, -35.5, 52, 37.5],
    polygon: [[-19, 36], [-5, 37], [11, 38.5], [20, 35], [33, 32.5], [35, 29], [43.5, 12.2], [52, 11], [52, -37], [-19, -37]],
  },
  {
    code: 'asia', name: 'Asia', group: 'Continents', bbox: [26, -11, 150, 56],
    polygon: [[26, 42], [45, 39], [36, 36], [34, 28], [43.5, 12], [52, 11], [60, 0], [95, -11], [141, -11], [141, 8], [150, 8], [150, 56], [26, 56]],
  },
  {
    code: 'europe', name: 'Europe', group: 'Continents', bbox: [-25, 34.5, 45, 71.5],
    polygon: [[-25, 36], [-5.5, 35.5], [12, 36], [20, 34], [28, 34], [36, 36], [45, 39], [60, 39], [60, 72], [-25, 72]],
  },
  {
    code: 'north-america', name: 'North America', group: 'Continents', bbox: [-168, 7, -52, 72],
    polygon: [[-168, 72], [-52, 72], [-52, 7], [-168, 7]],
  },
  {
    code: 'central-america-caribbean', name: 'Central America & Caribbean', group: 'Continents', bbox: [-118, 6.5, -58, 33],
    polygon: [[-118, 32.7], [-97, 26], [-80, 25], [-58, 26], [-58, 6.5], [-118, 6.5]],
  },
  {
    code: 'south-america', name: 'South America', group: 'Continents', bbox: [-82, -56, -34, 13],
    polygon: [[-82, 9], [-77, 9], [-77, 13], [-34, 13], [-34, -56], [-82, -56]],
  },
  {
    code: 'oceania', name: 'Oceania', group: 'Continents', bbox: [112, -48, 180, 0],
    polygon: [[112, -48], [112, -8], [129, -8], [130, -1], [141, -1], [141, 8], [180, 8], [180, -48]],
  },
  {
    code: 'esar', name: 'Eastern & Southern Africa (ESAR)', group: 'UNICEF regions', bbox: [10, -35.5, 52, 18.5],
    polygon: [[10, -36], [52, -36], [52, 12.5], [43.5, 12.5], [36, 18], [34, 12.5], [24, 12.5], [24, 4], [30, 4], [30, -5], [12, -5], [10, -8]],
  },
  {
    code: 'wcar', name: 'West & Central Africa (WCAR)', group: 'UNICEF regions', bbox: [-18.5, -14, 31, 27.5],
    polygon: [[-18.5, 27.5], [24, 23.5], [24, 4], [31, 4], [31, -14], [8, -14], [-18.5, -5]],
  },
  {
    code: 'mena', name: 'Middle East & North Africa (MENA)', group: 'UNICEF regions', bbox: [-18, 12, 64, 38],
    polygon: [[-18, 20], [-18, 37.5], [12, 38.5], [36, 37.5], [45, 38], [64, 38], [64, 12], [52, 11], [43.5, 12], [36, 18], [24, 12.5], [24, 23.5], [-18, 27.5]],
  },
  {
    code: 'ecar', name: 'Europe & Central Asia (ECAR)', group: 'UNICEF regions', bbox: [13, 35, 88, 56],
    polygon: [[13, 35], [88, 35], [88, 56], [13, 56]],
  },
  {
    code: 'rosa', name: 'South Asia (ROSA)', group: 'UNICEF regions', bbox: [60, 5, 98, 38],
    polygon: [[60, 5], [60, 38], [98, 38], [98, 20], [92, 20], [92, 5]],
  },
  {
    code: 'eapr', name: 'East Asia & Pacific (EAPR)', group: 'UNICEF regions', bbox: [92, -12, 180, 54],
    polygon: [[92, -12], [92, 20], [98, 28], [80, 42], [87, 50], [120, 54], [180, 54], [180, -12]],
  },
  {
    code: 'lacr', name: 'Latin America & Caribbean (LACR)', group: 'UNICEF regions', bbox: [-118, -56, -34, 33],
    polygon: [[-118, 32.7], [-97, 26], [-80, 25], [-58, 26], [-58, 13], [-34, 13], [-34, -56], [-118, -56]],
  },
]

/** Ray casting point-in-polygon; falls back to the bbox when there is no outline. */
export function regionContains(region: GigaMapRegion, point: [number, number]): boolean {
  const [x, y] = point
  const poly = region.polygon
  if (!poly) {
    const [w, s, e, n] = region.bbox
    return x >= w && x <= e && y >= s && y <= n
  }
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/**
 * Points per global tile for region maps. Region tiles come from the
 * backend's sampled endpoint (the one behind maps.giga.global's world view),
 * whose `limit` is a spatially uniform sample, so a continent keeps its
 * true density pattern while each tile stays around 3 MB. The
 * connectivity_status endpoint's limit, by contrast, truncates in database
 * order and leaves rectangular holes. The world view samples harder.
 */
export const GLOBAL_TILE_LIMIT = 100000
export const WORLD_TILE_LIMIT = 50000

/** What a map is framed on: a country (own tiles) or a region (global tiles). */
export type MapTarget =
  | { kind: 'country'; country: GigaMapCountry }
  | { kind: 'region'; region: GigaMapRegion }

export function targetBbox(t: MapTarget): [number, number, number, number] | null {
  return t.kind === 'country' ? t.country.bbox : t.region.bbox
}
export function targetName(t: MapTarget): string {
  return t.kind === 'country' ? t.country.name : t.region.name
}
export function targetCode(t: MapTarget): string {
  return t.kind === 'country' ? t.country.code : t.region.code
}
