import { CONNECTIVITY_LEGEND, DOT_COLORS, GIGAMAPS_DARK } from '../config'
import { NAVY } from '@/lib/color-tokens'
import {
  STATUS_COLORS,
  STATUS_ORDER,
  hash01,
  type AbstractMapOptions,
  type DotBackground,
  type LaidOutDot,
} from './layout'
import type { DotKind, DotStatus } from './load-points'

/**
 * Light and dark match the Map style: white, and the GigaMaps dark land
 * colour. Transparent has no fill at all.
 */
export const DOT_BACKGROUNDS: Record<DotBackground, { label: string; fill: string | null; dark: boolean }> = {
  light: { label: 'Light', fill: '#FFFFFF', dark: false },
  dark: { label: 'Dark', fill: GIGAMAPS_DARK.land, dark: true },
  navy: { label: 'Navy', fill: NAVY, dark: true },
  transparent: { label: 'Transparent', fill: null, dark: false },
}

/** SVG budget: above this the export is thinned. */
export const SVG_MAX_BYTES = 2_000_000

/** Same rule as the Map style: schools are circles, health centers squares. */
const SHAPE: Record<DotKind, 'circle' | 'square'> = { school: 'circle', health: 'square' }
const KIND_ORDER: DotKind[] = ['school', 'health']
const KIND_LABEL: Record<DotKind, string> = { school: 'Schools', health: 'Health centers' }

const STATUS_OF_COLOR: Record<string, DotStatus> = {
  [DOT_COLORS.connected]: 'connected',
  [DOT_COLORS.notConnected]: 'not_connected',
  [DOT_COLORS.unknown]: 'unknown',
}

function dotColor(d: LaidOutDot, opts: AbstractMapOptions) {
  return opts.colorMode === 'single' ? opts.singleColor : STATUS_COLORS[d.status]
}

type LegendItem = { label: string; color: string; shape: 'circle' | 'square' }

/**
 * Status colours (when colouring by status), drawn in the shape of the
 * facilities on the map. With both schools and health centers, two shape
 * keys follow: grey in status mode, the dot colour otherwise.
 */
function legendItems(dots: LaidOutDot[], opts: AbstractMapOptions): LegendItem[] {
  if (!opts.legend) return []
  const statuses = new Set(dots.map((d) => d.status))
  const kinds = KIND_ORDER.filter((k) => dots.some((d) => d.kind === k))
  const both = kinds.length > 1
  const items: LegendItem[] = []
  if (opts.colorMode === 'status') {
    const shape = both ? 'circle' : SHAPE[kinds[0] ?? 'school']
    for (const l of CONNECTIVITY_LEGEND) {
      if (statuses.has(STATUS_OF_COLOR[l.color])) items.push({ label: l.label, color: l.color, shape })
    }
  }
  if (both) {
    const color = opts.colorMode === 'status' ? '#989898' : opts.singleColor
    for (const k of kinds) items.push({ label: KIND_LABEL[k], color, shape: SHAPE[k] })
  }
  return items
}

/** Legend text colour: light on dark backgrounds, dark otherwise. */
function legendText(opts: AbstractMapOptions) {
  return DOT_BACKGROUNDS[opts.background].dark ? '#FFFFFF' : '#161616'
}

const LEGEND = { font: 16, gap: 28, swatch: 10, margin: 40 }

/** Draws the map on a canvas sized width*scale x height*scale. */
export function drawDots(
  ctx: CanvasRenderingContext2D,
  dots: LaidOutDot[],
  opts: AbstractMapOptions,
  scale: number,
) {
  const w = opts.width * scale
  const h = opts.height * scale
  ctx.clearRect(0, 0, w, h)
  const bg = DOT_BACKGROUNDS[opts.background].fill
  if (bg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  const size = opts.dotSize * scale
  const r = size / 2
  // Same order as the Map style: as the facilities arrive from the tiles
  // (schools before health centers), so overlaps look the same. Runs of one
  // colour and shape are filled in one go.
  for (let i = 0; i < dots.length; ) {
    const color = dotColor(dots[i], opts)
    const kind = dots[i].kind
    ctx.fillStyle = color
    ctx.beginPath()
    for (; i < dots.length && dots[i].kind === kind && dotColor(dots[i], opts) === color; i++) {
      const x = dots[i].x * scale
      const y = dots[i].y * scale
      if (SHAPE[kind] === 'square') {
        ctx.rect(x - r, y - r, size, size)
      } else {
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
    }
    ctx.fill()
  }

  const items = legendItems(dots, opts)
  if (items.length) {
    ctx.font = `${LEGEND.font * scale}px "Open Sans", sans-serif`
    ctx.textBaseline = 'middle'
    let x = LEGEND.margin * scale
    const y = (opts.height - LEGEND.margin) * scale
    const sw = LEGEND.swatch * scale
    for (const item of items) {
      ctx.fillStyle = item.color
      ctx.beginPath()
      if (item.shape === 'square') ctx.rect(x, y - sw / 2, sw, sw)
      else ctx.arc(x + sw / 2, y, sw / 2, 0, Math.PI * 2)
      ctx.fill()
      x += sw + 8 * scale
      ctx.fillStyle = legendText(opts)
      ctx.fillText(item.label, x, y)
      x += ctx.measureText(item.label).width + LEGEND.gap * scale
    }
  }
}

export async function dotsToPngBlob(dots: LaidOutDot[], opts: AbstractMapOptions, scale: 1 | 2): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = opts.width * scale
  canvas.height = opts.height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  drawDots(ctx, dots, opts, scale)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

const n = (v: number) => String(Math.round(v * 10) / 10)
/** Radius and size keep two decimals so 2.5 px dots stay exact. */
const n2 = (v: number) => String(Math.round(v * 100) / 100)

/** One sub-path per dot: two arcs for a circle, a closed box for a square. */
function dotPath(dots: LaidOutDot[], shape: 'circle' | 'square', size: number): string {
  const r = size / 2
  const parts: string[] = []
  if (shape === 'square') {
    for (const d of dots) parts.push(`M${n(d.x - r)} ${n(d.y - r)}h${n2(size)}v${n2(size)}h${n2(-size)}z`)
  } else {
    const a = `a${n2(r)} ${n2(r)} 0 1 0`
    for (const d of dots) parts.push(`M${n(d.x - r)} ${n(d.y)}${a} ${n2(size)} 0${a} ${n2(-size)} 0z`)
  }
  return parts.join('')
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const LAYER_NAME: Record<DotStatus, string> = {
  connected: 'connected',
  not_connected: 'not-connected',
  unknown: 'unknown',
}

/**
 * Plain SVG 1.1: one <path> per facility type and colour, with the fill set
 * on the element and no CSS, which is what PowerPoint and Figma import most
 * reliably. Each layer can be recoloured after import. Schools go below
 * health centers, as on the Map style; within a type, layers follow
 * STATUS_ORDER, so overlapping dots of different status cannot interleave
 * as they do on the canvas (only visible in the densest cities).
 */
function buildSvg(dots: LaidOutDot[], opts: AbstractMapOptions): string {
  const { width, height } = opts
  const out: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  ]
  const bg = DOT_BACKGROUNDS[opts.background].fill
  if (bg) out.push(`<rect id="background" x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>`)
  for (const kind of KIND_ORDER) {
    const ofKind = dots.filter((d) => d.kind === kind)
    if (!ofKind.length) continue
    const groups =
      opts.colorMode === 'single'
        ? [{ id: KIND_LABEL[kind].toLowerCase().replace(' ', '-'), color: opts.singleColor, dots: ofKind }]
        : STATUS_ORDER.map((st) => ({
            id: `${kind === 'school' ? 'schools' : 'health-centers'}-${LAYER_NAME[st]}`,
            color: STATUS_COLORS[st],
            dots: ofKind.filter((d) => d.status === st),
          }))
    for (const g of groups) {
      if (g.dots.length) out.push(`<path id="${g.id}" fill="${g.color}" d="${dotPath(g.dots, SHAPE[kind], opts.dotSize)}"/>`)
    }
  }
  const items = legendItems(dots, opts)
  if (items.length) {
    // Text width is unknown without a font, so items get a fixed stride.
    const y = height - LEGEND.margin
    const sw = LEGEND.swatch
    out.push(`<g id="legend" font-family="Open Sans, Arial, sans-serif" font-size="${LEGEND.font}">`)
    items.forEach((item, i) => {
      const x = LEGEND.margin + i * 170
      out.push(
        item.shape === 'square'
          ? `<rect x="${x}" y="${y - sw / 2}" width="${sw}" height="${sw}" fill="${item.color}"/>`
          : `<circle cx="${x + sw / 2}" cy="${y}" r="${sw / 2}" fill="${item.color}"/>`,
        `<text x="${x + sw + 8}" y="${y + LEGEND.font * 0.35}" fill="${legendText(opts)}">${escapeXml(item.label)}</text>`,
      )
    })
    out.push(`</g>`)
  }
  out.push(`</svg>`)
  return out.join('\n')
}

export type SvgExport = { svg: string; shown: number; total: number; thinned: boolean }

/**
 * Builds the SVG and, if it is over SVG_MAX_BYTES, drops dots until it fits.
 * Thinning keeps the dots with the lowest stable hash, so it is repeatable
 * and spread evenly over the area.
 */
export function dotsToSvg(dots: LaidOutDot[], opts: AbstractMapOptions): SvgExport {
  let svg = buildSvg(dots, opts)
  if (svg.length <= SVG_MAX_BYTES) return { svg, shown: dots.length, total: dots.length, thinned: false }

  const ranked = dots
    .map((d) => ({ d, h: hash01(d.key, opts.seed + 7919) }))
    .sort((a, b) => a.h - b.h)
    .map((x) => x.d)
  let keep = Math.floor(dots.length * (SVG_MAX_BYTES / svg.length) * 0.98)
  for (;;) {
    svg = buildSvg(ranked.slice(0, keep), opts)
    if (svg.length <= SVG_MAX_BYTES || keep <= 1) break
    keep = Math.floor(keep * 0.95)
  }
  return { svg, shown: keep, total: dots.length, thinned: true }
}
