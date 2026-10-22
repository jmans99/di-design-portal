'use client'

import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import {
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TILE_SOURCE_LAYERS,
  regionContains,
  targetBbox,
  targetCode,
  type DataLayer,
  type MapTarget,
} from '../config'
import { setGigaDataLayer, waitForIdle } from '../render'

/**
 * Facility points for the Abstract map.
 *
 * There is no new data source: a hidden MapLibre map with an empty style
 * (no basemap) is framed exactly like the Map style, gets the same facility
 * layer through `setGigaDataLayer`, and therefore loads the same tiles from
 * /api/giga-maps/tiles. Once every tile is in, the points are read back with
 * `querySourceFeatures` and the map is thrown away.
 */

export type DotStatus = 'connected' | 'not_connected' | 'unknown'
export type DotKind = 'school' | 'health'

export type DotPoint = {
  /** Unique per facility: kind + backend id. */
  key: string
  lon: number
  lat: number
  status: DotStatus
  kind: DotKind
}

export type DotPointSet = {
  points: DotPoint[]
  /** When the points were read, shown in the source line. */
  loadedAt: Date
}

const BLANK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'blank', type: 'background', paint: { 'background-color': 'rgba(0,0,0,0)' } }],
}

const cache = new Map<string, Promise<DotPointSet>>()

/** Cached per area and facility type for the session, like the country list. */
export function loadDotPoints(target: MapTarget, layer: DataLayer): Promise<DotPointSet> {
  const id = `${target.kind}:${targetCode(target)}:${layer}`
  let p = cache.get(id)
  if (!p) {
    p = readPoints(target, layer).catch((err) => {
      cache.delete(id)
      throw err
    })
    cache.set(id, p)
  }
  return p
}

function toStatus(v: unknown): DotStatus {
  return v === 'connected' || v === 'not_connected' ? v : 'unknown'
}

async function readPoints(target: MapTarget, layer: DataLayer): Promise<DotPointSet> {
  // Same 1920x1080 frame and padding as createGigaMap, so the same tiles load.
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${STAGE_WIDTH}px`,
    height: `${STAGE_HEIGHT}px`,
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(host)

  let map: MapLibreMap | null = null
  try {
    const bbox = targetBbox(target)
    const centroid = target.kind === 'country' ? target.country.centroid : null
    const framing = bbox
      ? { bounds: bbox, fitBoundsOptions: { padding: target.kind === 'region' ? 40 : 80 } }
      : { center: centroid ?? ([0, 0] as [number, number]), zoom: 4 }
    map = new maplibregl.Map({
      container: host,
      style: BLANK_STYLE,
      ...framing,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      maxTileCacheSize: 256,
    })
    const m = map
    await new Promise<void>((resolve) => m.once('load', () => resolve()))
    setGigaDataLayer(m, layer, target)

    // 'idle' fires once no tile is pending; check and wait again if a late
    // tile request slipped in.
    await waitForIdle(m)
    for (let i = 0; i < 5 && !m.areTilesLoaded(); i++) await waitForIdle(m)

    const sourceId = Object.keys(m.getStyle().sources)[0]
    const kinds: DotKind[] = layer === 'all' ? ['school', 'health'] : [layer]
    const polygon = target.kind === 'region' && target.region.polygon ? target.region : null

    // A point near a tile edge is returned once per tile that holds it
    // (tile buffers overlap), so dedupe on the facility id.
    const byKey = new Map<string, DotPoint>()
    for (const kind of kinds) {
      const features = m.querySourceFeatures(sourceId, { sourceLayer: TILE_SOURCE_LAYERS[kind] })
      for (const f of features) {
        const g = f.geometry
        const coords =
          g.type === 'Point' ? [g.coordinates] : g.type === 'MultiPoint' ? g.coordinates : []
        coords.forEach((c, i) => {
          const [lon, lat] = c as [number, number]
          const fid = f.properties?.id ?? f.id ?? `${lon.toFixed(5)},${lat.toFixed(5)}`
          const key = `${kind}:${fid}${i ? `:${i}` : ''}`
          if (byKey.has(key)) return
          if (polygon && !regionContains(polygon, [lon, lat])) return
          byKey.set(key, { key, lon, lat, status: toStatus(f.properties?.connectivity_status), kind })
        })
      }
    }
    return { points: [...byKey.values()], loadedAt: new Date() }
  } finally {
    map?.remove()
    host.remove()
  }
}
