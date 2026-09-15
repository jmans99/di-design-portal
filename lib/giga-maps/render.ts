'use client'

import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import {
  BASEMAP_STYLE,
  DATA_LAYERS,
  DOT_COLORS,
  MAP_ATTRIBUTION,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TILE_SOURCE_LAYERS,
  type DataLayer,
  type GigaMapCountry,
  type MapTheme,
} from './config'

const DOTS_SOURCE = 'giga-entities'
const SCHOOL_LAYER = 'giga-schools-dots'
const HEALTH_LAYER = 'giga-health-dots'
const IDLE_TIMEOUT_MS = 45000

/* ------------------------------------------------------------------ */
/*  Country metadata (cached per session)                              */
/* ------------------------------------------------------------------ */

let countriesPromise: Promise<GigaMapCountry[]> | null = null

export function fetchGigaMapCountries(): Promise<GigaMapCountry[]> {
  if (!countriesPromise) {
    countriesPromise = fetch('/api/giga-maps/countries')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Could not load country list (${res.status})`)
        return (await res.json()) as GigaMapCountry[]
      })
      .catch((err) => {
        countriesPromise = null
        throw err
      })
  }
  return countriesPromise
}

export async function getGigaMapCountry(code: string): Promise<GigaMapCountry> {
  const list = await fetchGigaMapCountries()
  const found = list.find((c) => c.code === code.toLowerCase())
  if (!found) throw new Error(`No Giga Maps data for country "${code.toUpperCase()}"`)
  return found
}

/* ------------------------------------------------------------------ */
/*  Map creation                                                       */
/* ------------------------------------------------------------------ */

export type GigaMapOptions = {
  container: HTMLElement
  country: GigaMapCountry
  theme: MapTheme
  layer: DataLayer
  pixelRatio?: number
  interactive?: boolean
}

function tileUrl(layer: DataLayer, countryId: number) {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const kind = DATA_LAYERS[layer].entityCode
  return `${base}/api/giga-maps/tiles?kind=${kind}&country=${countryId}&z={z}&x={x}&y={y}`
}

const CONNECTIVITY_COLOR = [
  'match',
  ['get', 'connectivity_status'],
  'connected',
  DOT_COLORS.connected,
  'not_connected',
  DOT_COLORS.notConnected,
  DOT_COLORS.unknown,
]

const RADIUS_BY_ZOOM = ['interpolate', ['linear'], ['zoom'], 2, 1.4, 4, 2.2, 6, 3, 8, 4, 12, 6]
// Health centers are one pixel larger. Must be its own top-level interpolate:
// MapLibre rejects ['zoom'] nested inside arithmetic, and the layer is then
// silently dropped (the validation error is only fired as an event).
const HEALTH_RADIUS_BY_ZOOM = ['interpolate', ['linear'], ['zoom'], 2, 2.4, 4, 3.2, 6, 4, 8, 5, 12, 7]

function firstSymbolLayerId(map: MapLibreMap): string | undefined {
  const style = map.getStyle() as StyleSpecification | undefined
  return style?.layers.find((l) => l.type === 'symbol')?.id
}

/** Basemap source-layers that only add noise on a facility map. */
const HIDDEN_SOURCE_LAYERS = new Set(['transportation', 'transportation_name', 'aeroway', 'building'])

/**
 * The export is a clean shape map: no place names, no roads, and only
 * national borders (admin_level 2). Water, land use and coastlines stay.
 */
function cleanBasemap(map: MapLibreMap) {
  const style = map.getStyle() as StyleSpecification | undefined
  for (const l of style?.layers ?? []) {
    const sourceLayer = 'source-layer' in l ? l['source-layer'] : undefined
    const isInternalBoundary =
      sourceLayer === 'boundary' && !/country|boundary_2$|disputed/.test(l.id)
    if (l.type === 'symbol' || (sourceLayer && HIDDEN_SOURCE_LAYERS.has(sourceLayer)) || isInternalBoundary) {
      map.setLayoutProperty(l.id, 'visibility', 'none')
    }
  }
}

export function setGigaDataLayer(map: MapLibreMap, layer: DataLayer, countryId: number) {
  for (const id of [SCHOOL_LAYER, HEALTH_LAYER]) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
  if (map.getSource(DOTS_SOURCE)) map.removeSource(DOTS_SOURCE)

  map.addSource(DOTS_SOURCE, {
    type: 'vector',
    tiles: [tileUrl(layer, countryId)],
    minzoom: 0,
    maxzoom: 14,
  })
  const before = firstSymbolLayerId(map)

  if (layer === 'school' || layer === 'all') {
    map.addLayer(
      {
        id: SCHOOL_LAYER,
        type: 'circle',
        source: DOTS_SOURCE,
        'source-layer': TILE_SOURCE_LAYERS.school,
        paint: {
          'circle-radius': RADIUS_BY_ZOOM as never,
          'circle-opacity': 0.9,
          'circle-color': CONNECTIVITY_COLOR as never,
        },
      },
      before
    )
  }
  if (layer === 'health' || layer === 'all') {
    // Health centers get a white ring so they stay recognisable next to schools.
    map.addLayer(
      {
        id: HEALTH_LAYER,
        type: 'circle',
        source: DOTS_SOURCE,
        'source-layer': TILE_SOURCE_LAYERS.health,
        paint: {
          'circle-radius': HEALTH_RADIUS_BY_ZOOM as never,
          'circle-opacity': 0.95,
          'circle-color': CONNECTIVITY_COLOR as never,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.85,
        },
      },
      before
    )
  }
}

/** Resolves when the map has finished loading tiles and rendering. */
export function waitForIdle(map: MapLibreMap, timeoutMs = IDLE_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      map.off('idle', onIdle)
      reject(new Error('Map render timed out'))
    }, timeoutMs)
    const onIdle = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve()
    }
    map.once('idle', onIdle)
    // Force a frame so 'idle' fires even if nothing was pending.
    map.triggerRepaint()
  })
}

export function createGigaMap(opts: GigaMapOptions): Promise<MapLibreMap> {
  const { container, country, theme, layer, pixelRatio = 1, interactive = false } = opts

  return new Promise((resolve, reject) => {
    let map: MapLibreMap
    try {
      // Note: MapLibre merges options over its defaults with Object.assign
      // semantics, so keys must be omitted (not set to undefined).
      const framing = country.bbox
        ? { bounds: country.bbox, fitBoundsOptions: { padding: 80 } }
        : { center: country.centroid ?? ([0, 0] as [number, number]), zoom: 4 }
      map = new maplibregl.Map({
        container,
        style: BASEMAP_STYLE[theme],
        ...framing,
        pixelRatio,
        interactive,
        attributionControl: false,
        canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
        fadeDuration: 0,
        maxTileCacheSize: 256,
      })
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Could not create map'))
      return
    }

    let styleErrored = false
    map.on('error', (e) => {
      // Tile 204s and missing sprites are harmless; a failed style is not.
      const msg = e?.error?.message ?? ''
      if (msg && !/tile|sprite|image/i.test(msg)) console.warn('[giga-map]', msg)
      if (!styleErrored && /style/i.test(msg)) {
        styleErrored = true
        reject(new Error(`Basemap failed to load: ${msg}`))
      }
    })

    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as { __gigaMap?: MapLibreMap }).__gigaMap = map
    }

    map.once('load', () => {
      cleanBasemap(map)
      setGigaDataLayer(map, layer, country.id)
      resolve(map)
    })
  })
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export async function exportGigaMapPng(map: MapLibreMap, scale: 1 | 2): Promise<Blob> {
  const previousRatio = map.getPixelRatio()
  if (previousRatio !== scale) {
    map.setPixelRatio(scale)
    await waitForIdle(map)
  } else {
    await waitForIdle(map)
  }

  const src = map.getCanvas()
  const out = document.createElement('canvas')
  out.width = STAGE_WIDTH * scale
  out.height = STAGE_HEIGHT * scale
  const ctx = out.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(src, 0, 0, out.width, out.height)

  // Attribution required by the OpenStreetMap licence. Small, bottom right.
  ctx.font = `${11 * scale}px "Open Sans", sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText(MAP_ATTRIBUTION, out.width - 14 * scale, out.height - 10 * scale)

  const blob = await new Promise<Blob>((resolve, reject) => {
    out.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })

  if (previousRatio !== scale) {
    map.setPixelRatio(previousRatio)
  }
  return blob
}

/**
 * One shot renderer for callers without a visible map (Backgrounds page):
 * mounts an offscreen 1920x1080 stage, renders, exports and cleans up.
 */
export async function renderGigaMapPng(opts: {
  countryCode: string
  theme: MapTheme
  layer: DataLayer
  scale: 1 | 2
}): Promise<Blob> {
  const country = await getGigaMapCountry(opts.countryCode)
  const host = document.createElement('div')
  host.style.cssText = `position:fixed;left:-${STAGE_WIDTH + 100}px;top:0;width:${STAGE_WIDTH}px;height:${STAGE_HEIGHT}px;pointer-events:none;`
  document.body.appendChild(host)
  let map: MapLibreMap | null = null
  try {
    map = await createGigaMap({
      container: host,
      country,
      theme: opts.theme,
      layer: opts.layer,
      pixelRatio: opts.scale,
    })
    return await exportGigaMapPng(map, opts.scale)
  } finally {
    map?.remove()
    host.remove()
  }
}
