import { geoMercator } from 'd3-geo'
import { DOT_COLORS } from '../config'
import type { DotKind, DotPoint, DotStatus } from './load-points'

/** Settings of the Abstract map. Sizes are px at 1x. */
export type AbstractMapOptions = {
  width: number
  height: number
  padding: number
  /**
   * Circle diameter for schools, square side for health centers (the same
   * shapes as the Map style).
   */
  dotSize: number
  /** Percent of facilities shown, 1 to 100. */
  density: number
  grid: 'off' | 'square' | 'hex'
  /** Distance between grid points. */
  gridSpacing: number
  colorMode: 'status' | 'single'
  singleColor: string
  background: DotBackground
  legend: boolean
  seed: number
}

export type DotBackground = 'light' | 'dark' | 'navy' | 'transparent'

export const DEFAULT_ABSTRACT_OPTIONS: AbstractMapOptions = {
  width: 1920,
  height: 1080,
  padding: 80,
  dotSize: 2.5,
  density: 100,
  grid: 'off',
  gridSpacing: 8,
  colorMode: 'status',
  singleColor: '#277AFF',
  background: 'dark',
  legend: false,
  seed: 1,
}

/** A dot ready to draw, in output px at 1x. */
export type LaidOutDot = { x: number; y: number; status: DotStatus; kind: DotKind; key: string }

/** Drawing order, back to front: connected dots end up on top. */
export const STATUS_ORDER: DotStatus[] = ['unknown', 'not_connected', 'connected']

export const STATUS_COLORS: Record<DotStatus, string> = {
  connected: DOT_COLORS.connected,
  not_connected: DOT_COLORS.notConnected,
  unknown: DOT_COLORS.unknown,
}

/**
 * Stable 0..1 value per facility and seed (FNV-1a + murmur finaliser).
 * Sampling on it, rather than on a running random sequence, keeps the
 * result independent of tile load order, and a lower density is always a
 * subset of a higher one.
 */
export function hash01(key: string, seed: number): number {
  let h = 0x811c9dc5 ^ seed
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/** Share of the points, the most distant from the middle, left out of the framing. */
const OUTLIER_SHARE = 0.005

export function layoutDots(points: DotPoint[], opts: AbstractMapOptions): LaidOutDot[] {
  if (points.length === 0) return []
  const { width, height } = opts
  const pad = Math.min(opts.padding, width / 2 - 1, height / 2 - 1)

  // Centre the projection on the points' mean longitude (circular mean), so
  // countries across the 180° line (Fiji, Kiribati) are not torn in two.
  let sx = 0
  let sy = 0
  for (const p of points) {
    sx += Math.cos((p.lon * Math.PI) / 180)
    sy += Math.sin((p.lon * Math.PI) / 180)
  }
  const lon0 = (Math.atan2(sy, sx) * 180) / Math.PI
  const projection = geoMercator().rotate([-lon0, 0])

  // Frame on the points minus the most distant 0.5% from the median, so a
  // few bad coordinates do not shrink the country. They are still drawn if
  // they land on the canvas.
  const raw = points.map((p) => projection([p.lon, p.lat]) ?? [0, 0])
  let core = points
  if (points.length >= 200) {
    const mx = median(raw.map((r) => r[0]))
    const my = median(raw.map((r) => r[1]))
    const d = raw.map((r) => (r[0] - mx) ** 2 + (r[1] - my) ** 2)
    const limit = [...d].sort((a, b) => a - b)[Math.floor(d.length * (1 - OUTLIER_SHARE)) - 1]
    core = points.filter((_, i) => d[i] <= limit)
  }
  projection.fitExtent(
    [
      [pad, pad],
      [width - pad, height - pad],
    ],
    { type: 'MultiPoint', coordinates: core.map((p) => [p.lon, p.lat]) },
  )
  // A single point (or all at one spot) gives an infinite scale.
  if (!Number.isFinite(projection.scale())) projection.scale(1000).translate([width / 2, height / 2])

  const density = Math.max(0, Math.min(100, opts.density)) / 100
  const margin = opts.dotSize
  const dots: LaidOutDot[] = []
  for (const p of points) {
    if (density < 1 && hash01(p.key, opts.seed) >= density) continue
    const xy = projection([p.lon, p.lat])
    if (!xy) continue
    const [x, y] = xy
    if (x < -margin || y < -margin || x > width + margin || y > height + margin) continue
    dots.push({ x, y, status: p.status, kind: p.kind, key: p.key })
  }
  return opts.grid === 'off' ? dots : snapToGrid(dots, opts)
}

/**
 * One dot per grid cell, coloured by the most common status in the cell and
 * shaped by its most common facility type (schools win a tie).
 * Hex rows are offset by half a cell and spaced √3/2 apart.
 */
function snapToGrid(dots: LaidOutDot[], opts: AbstractMapOptions): LaidOutDot[] {
  const s = Math.max(1, opts.gridSpacing)
  const rowH = opts.grid === 'hex' ? (s * Math.sqrt(3)) / 2 : s
  type Cell = { x: number; y: number; counts: Record<DotStatus, number>; health: number; n: number }
  const cells = new Map<string, Cell>()
  for (const d of dots) {
    const row = Math.round(d.y / rowH)
    const offset = opts.grid === 'hex' && row % 2 !== 0 ? s / 2 : 0
    const col = Math.round((d.x - offset) / s)
    const id = `${col},${row}`
    let c = cells.get(id)
    if (!c) {
      c = { x: col * s + offset, y: row * rowH, counts: { connected: 0, not_connected: 0, unknown: 0 }, health: 0, n: 0 }
      cells.set(id, c)
    }
    c.counts[d.status]++
    c.n++
    if (d.kind === 'health') c.health++
  }
  const out: LaidOutDot[] = []
  for (const [id, c] of cells) {
    let status: DotStatus = 'unknown'
    for (const st of STATUS_ORDER) if (c.counts[st] >= c.counts[status]) status = st
    out.push({ x: c.x, y: c.y, status, kind: c.health * 2 > c.n ? 'health' : 'school', key: id })
  }
  return out
}

function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b)
  return v[Math.floor(v.length / 2)]
}
