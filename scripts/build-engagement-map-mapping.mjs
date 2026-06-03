#!/usr/bin/env node
/**
 * Build the mapping path-index → ISO alpha-2 for engagement-map-world.svg.
 *
 * The Figma SVG has 223 anonymous <path> elements. We need to know which
 * path corresponds to which country so we can color them dynamically from
 * the SharePoint Excel data.
 *
 * Strategy:
 *   1. Parse each path's `d` attribute, sample a representative point (the
 *      centroid of all M/L coordinates).
 *   2. Project that pixel coordinate back through the SAME geoEqualEarth
 *      projection used by Figma. We re-fit the projection to the world
 *      geojson using width/height = SVG viewBox (1388x899) and compare to
 *      the existing pre-colored paths in the SVG (52 blue engaged, 27 green
 *      early interest) as ground truth for calibration.
 *   3. For each centroid pixel → lat/lon, find which country in the
 *      countries-10m.geojson contains the point. That is the ISO numeric.
 *   4. Convert numeric → alpha-2 via the existing iso-numeric-map.
 *
 * Output: lib/engagement-map/path-iso-map.json — array of length 223 with
 * the alpha-2 code (or null) for each path index.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { geoEqualEarth, geoContains } from 'd3-geo'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')

const SVG_PATH = join(ROOT, 'public/data/engagement-map-world.svg')
const GEOJSON_PATH = join(ROOT, 'public/data/social-media/countries-10m.geojson.json')
const ISO_MAP_PATH = join(ROOT, 'lib/social-media/iso-numeric-map.ts')
const OUTPUT_PATH = join(ROOT, 'lib/engagement-map/path-iso-map.json')

// --- Load ISO alpha-2 → numeric map by sourcing the .ts file as text ---
const isoMapSrc = readFileSync(ISO_MAP_PATH, 'utf8')
// crude parse: pick lines like "af: '004',"
const alpha2ToNumeric = {}
for (const m of isoMapSrc.matchAll(/\b([a-z]{2}):\s*'([^']+)'/g)) {
  alpha2ToNumeric[m[1]] = m[2]
}
const numericToAlpha2 = Object.fromEntries(
  Object.entries(alpha2ToNumeric).map(([a, n]) => [String(n).padStart(3, '0'), a])
)

// --- Load SVG and extract paths ---
const svg = readFileSync(SVG_PATH, 'utf8')
const pathRx = /<path\s+([^>]+)\/>/g
const attrRx = /(d|fill)="([^"]*)"/g
const paths = []
for (const m of svg.matchAll(pathRx)) {
  const attrs = {}
  for (const a of m[1].matchAll(attrRx)) attrs[a[1]] = a[2]
  if (attrs.d) paths.push({ d: attrs.d, fill: attrs.fill || null })
}
console.log(`Parsed ${paths.length} paths`)

// --- Sample many points uniformly along the path's vertices ---
function samplePoints(d, maxSamples = 12) {
  const nums = d.match(/-?\d+\.?\d*(?:e[-+]?\d+)?/gi) || []
  if (nums.length < 2) return []
  const pts = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    pts.push([parseFloat(nums[i]), parseFloat(nums[i + 1])])
  }
  if (pts.length <= maxSamples) return pts
  // Pick maxSamples evenly spaced
  const step = pts.length / maxSamples
  const out = []
  for (let i = 0; i < maxSamples; i++) out.push(pts[Math.floor(i * step)])
  return out
}

// --- Build the same projection: equal earth fitted to the SVG viewBox ---
const collection = JSON.parse(readFileSync(GEOJSON_PATH, 'utf8'))
const SVG_W = 1388
const SVG_H = 899
const projection = geoEqualEarth()
projection.fitExtent(
  [[0, 0], [SVG_W, SVG_H]],
  collection
)

// --- For each path, project centroid back to lat/lon and find country ---
const mapping = new Array(paths.length).fill(null)
const debugDump = []
const stats = { matched: 0, noCentroid: 0, noInvert: 0, noCountry: 0 }
for (let i = 0; i < paths.length; i++) {
  const c = centroidOf(paths[i].d)
  if (!c) { stats.noCentroid++; continue }
  const lonlat = projection.invert(c)
  if (!lonlat || Number.isNaN(lonlat[0]) || Number.isNaN(lonlat[1])) {
    stats.noInvert++; continue
  }
  // Find feature containing this point
  let found = null
  for (const f of collection.features) {
    if (geoContains(f, lonlat)) { found = f; break }
  }
  // No fallback — only accept exact point-in-polygon matches
  if (!found) { stats.noCountry++ }
  const numId = found ? String(found.id).padStart(3, '0') : null
  const alpha2 = numId ? numericToAlpha2[numId] || null : null
  if (alpha2) {
    mapping[i] = alpha2
    stats.matched++
  }
  if (paths[i].fill === '#277AFF' || paths[i].fill === '#34C493') {
    debugDump.push({
      i, fill: paths[i].fill,
      px: c.map((n) => Math.round(n)),
      ll: lonlat.map((n) => Math.round(n * 10) / 10),
      iso: alpha2,
    })
  }
}

function featureCentroid(f) {
  const coords = []
  function walk(c) {
    if (typeof c[0] === 'number') coords.push(c)
    else for (const x of c) walk(x)
  }
  if (!f.geometry) return null
  walk(f.geometry.coordinates)
  if (coords.length === 0) return null
  let sx = 0, sy = 0
  for (const [x, y] of coords) { sx += x; sy += y }
  return [sx / coords.length, sy / coords.length]
}
function haversine2(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1]
  return dx * dx + dy * dy
}

console.log('Stats:', stats)

// --- Sanity check: count colored paths vs Excel expectations ---
const ALPHA2_TO_NUMERIC = Object.fromEntries(
  Object.entries(alpha2ToNumeric).map(([a, n]) => [a, String(n).padStart(3, '0')])
)
const preBlue = mapping.filter((iso, i) => paths[i].fill === '#277AFF' && iso).length
const preGreen = mapping.filter((iso, i) => paths[i].fill === '#34C493' && iso).length
console.log(`Pre-colored blue paths mapped: ${preBlue} / 52`)
console.log(`Pre-colored green paths mapped: ${preGreen} / 27`)

// Sample first 10 mappings for human inspection
console.log('\nPre-colored mappings:')
for (const d of debugDump) {
  console.log(`  [${d.i}] fill=${d.fill}  px=${d.px}  ll=${d.ll}  -> ${d.iso ?? '∅'}`)
}

writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 0))
console.log(`\nWrote ${OUTPUT_PATH}`)
