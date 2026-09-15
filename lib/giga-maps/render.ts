'use client'

import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import {
  BASEMAP_STYLE,
  DATA_LAYERS,
  DOT_COLORS,
  HIDDEN_BASEMAP_LAYERS,
  MAP_ATTRIBUTION,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  type DataLayer,
  type GigaMapCountry,
  type MapTheme,
} from './config'

const DOTS_SOURCE = 'giga-schools'
const DOTS_LAYER = 'giga-schools-dots'
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

function tileUrl(kind: Exclude<DataLayer, 'none'>, countryId: number) {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/api/giga-maps/tiles?kind=${kind}&country=${countryId}&z={z}&x={x}&y={y}`
}

function dotColorExpression(layer: Exclude<DataLayer, 'none'>) {
  const prop = DATA_LAYERS[layer].property
  if (layer === 'status') {
    return [
      'match',
      ['get', prop],
      'connected',
      DOT_COLORS.connected,
      'not_connected',
      DOT_COLORS.notConnected,
      DOT_COLORS.unknown,
    ]
  }
  return [
    'match',
    ['get', prop],
    'good',
    DOT_COLORS.good,
    'moderate',
    DOT_COLORS.moderate,
    'bad',
    DOT_COLORS.bad,
    DOT_COLORS.unknown,
  ]
}

function firstSymbolLayerId(map: MapLibreMap): string | undefined {
  const style = map.getStyle() as StyleSpecification | undefined
  return style?.layers.find((l) => l.type === 'symbol')?.id
}

function hideNoisyLabels(map: MapLibreMap) {
  for (const id of HIDDEN_BASEMAP_LAYERS) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none')
  }
}

export function setGigaDataLayer(map: MapLibreMap, layer: DataLayer, countryId: number) {
  if (map.getLayer(DOTS_LAYER)) map.removeLayer(DOTS_LAYER)
  if (map.getSource(DOTS_SOURCE)) map.removeSource(DOTS_SOURCE)
  if (layer === 'none') return

  map.addSource(DOTS_SOURCE, {
    type: 'vector',
    tiles: [tileUrl(layer, countryId)],
    minzoom: 0,
    maxzoom: 14,
  })
  map.addLayer(
    {
      id: DOTS_LAYER,
      type: 'circle',
      source: DOTS_SOURCE,
      'source-layer': 'default',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          2, 1.4,
          4, 2.2,
          6, 3,
          8, 4,
          12, 6,
        ],
        'circle-opacity': 0.9,
        'circle-color': dotColorExpression(layer) as never,
      },
    },
    firstSymbolLayerId(map)
  )
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
      if (!styleErrored && /style/i.test(msg)) {
        styleErrored = true
        reject(new Error(`Basemap failed to load: ${msg}`))
      }
    })

    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as { __gigaMap?: MapLibreMap }).__gigaMap = map
    }

    map.once('load', () => {
      hideNoisyLabels(map)
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
