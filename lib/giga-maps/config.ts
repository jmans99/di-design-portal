/**
 * Shared configuration for the client side Giga Maps renderer.
 *
 * School dots come from the public Giga Maps backend as Mapbox Vector Tiles.
 * The basemap is OpenFreeMap (OpenMapTiles + OpenStreetMap data), which needs
 * no API key. Both are proxied / referenced from here so the map component,
 * the export helper and the API routes agree on one source of truth.
 */

export const GIGA_BACKEND = 'https://uni-ooi-giga-backend-hjekcuagasashucv.a03.azurefd.net'

export type DataLayer = 'status' | 'realtime' | 'none'
export type MapTheme = 'dark' | 'light'

export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

export const BASEMAP_STYLE: Record<MapTheme, string> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

/** Legend colors as used on maps.giga.global. */
export const DOT_COLORS = {
  connected: '#00d661',
  notConnected: '#ed5b4c',
  unknown: '#1d8cf0',
  good: '#00d661',
  moderate: '#f6c344',
  bad: '#ff5538',
} as const

export const DATA_LAYERS: Record<
  Exclude<DataLayer, 'none'>,
  { label: string; description: string; property: string; legend: { label: string; color: string }[] }
> = {
  status: {
    label: 'School status',
    description: 'Connected, not connected and unknown schools',
    property: 'connectivity_status',
    legend: [
      { label: 'Connected', color: DOT_COLORS.connected },
      { label: 'Not connected', color: DOT_COLORS.notConnected },
      { label: 'Unknown', color: DOT_COLORS.unknown },
    ],
  },
  realtime: {
    label: 'Real-time connectivity',
    description: 'Download speed against the national benchmark',
    property: 'field_status',
    legend: [
      { label: 'Good', color: DOT_COLORS.good },
      { label: 'Moderate', color: DOT_COLORS.moderate },
      { label: 'Bad', color: DOT_COLORS.bad },
      { label: 'Unknown', color: DOT_COLORS.unknown },
    ],
  },
}

/** Basemap label layers that add noise at country zoom. Hidden on load. */
export const HIDDEN_BASEMAP_LAYERS = [
  'water_name',
  'road_oneway',
  'road_oneway_opposite',
  'highway_name_other',
  'highway_name_motorway',
  'place_other',
  'place_suburb',
  'place_village',
  'place_town',
  'place_state',
  'poi',
  'housenumber',
  // positron (light) ids
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
  'highway-shield-non-us',
  'highway-shield-us-interstate',
  'road_shield_us',
  'airport',
  'label_other',
  'label_village',
  'label_town',
  'label_state',
]

export const MAP_ATTRIBUTION = '© OpenMapTiles © OpenStreetMap contributors · School data: Giga'

export type GigaMapCountry = {
  code: string
  name: string
  id: number
  bbox: [number, number, number, number] | null
  centroid: [number, number] | null
  schoolsTotal: number
}
