#!/usr/bin/env node
/**
 * Scarica le silhouette ad alta risoluzione di alcuni paesi da mapsicon
 * (https://github.com/djaiss/mapsicon, MIT). Le re-fitta nel viewBox
 * 1040x740 usando la stessa logica di fillRatio della pipeline d3-geo,
 * poi emette lib/social-media/silhouette-overrides.ts.
 *
 * mapsicon SVG format:
 *   viewBox="0 0 1024 1024"
 *   <g transform="translate(0,1024) scale(0.1,-0.1)"> <path d="..."/> </g>
 *
 * Run: node scripts/build-overrides.mjs
 */

import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import svgpath from 'svgpath'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const TARGET_W = 1040
const TARGET_H = 740

// Curated list of countries con poco dettaglio nel 10m Natural Earth.
// Aggiungere/rimuovere paesi qui per scolpire il roster degli override.
const TARGETS = [
  // Micro-stati Europa
  'ad', // Andorra
  'mc', // Monaco
  'sm', // San Marino
  'li', // Liechtenstein
  'mt', // Malta
  'lu', // Luxembourg
  'cy', // Cyprus
  'gi', // Gibraltar (very few vertices in 10m)
  // Golfo Persico
  'bh', // Bahrain
  'kw', // Kuwait
  'qa', // Qatar
  // SE Asia
  'sg', // Singapore
  'bn', // Brunei
  // Caraibi
  'bb', // Barbados
  'gd', // Grenada
  'dm', // Dominica
  'lc', // Saint Lucia
  'vc', // Saint Vincent and the Grenadines
  'kn', // Saint Kitts and Nevis
  'ag', // Antigua and Barbuda
  'tt', // Trinidad and Tobago
  'bs', // Bahamas
  'ai', // Anguilla (sottile, world-atlas era un blob ovale)
  'aw', // Aruba (idem)
  'cw', // Curacao (idem)
  // Pacifico — territori
  'as', // American Samoa (Tutuila + Manu'a)
  // Cook Islands RIMOSSO: mapsicon traccia solo Rarotonga; gestito in HAND_OVERRIDES
  // Africa
  'sc', // Seychelles
  'km', // Comoros
  'st', // Sao Tome and Principe
  'gm', // Gambia
  'mu', // Mauritius
  // Cabo Verde RIMOSSO: mapsicon ha solo 535 byte (1 isola); gestito in HAND_OVERRIDES sotto
  // Pacifico (mapsicon ha trace decenti)
  'nr', // Nauru
  'ki', // Kiribati (4.2K char in mapsicon, evita "empty" del world-atlas wrap)
  'pw', // Palau
  'to', // Tonga
  'ws', // Samoa
  'nu', // Niue
  // Territori francesi e altri missing in world-atlas
  'gp', // Guadeloupe
  'mq', // Martinique
  'tk', // Tokelau
  'pf', // French Polynesia
  // Atoll-nations dove ne' world-atlas ne' mapsicon offrono niente di utile:
  // Maldives, Tuvalu, Marshall Is., Micronesia — gestiti come HAND_OVERRIDES sotto.
]

// Per gli atoll-archipelago dove non esiste un buon source automatico, uso
// rappresentazioni stilizzate hand-crafted (chain di puntini che riflette la
// disposizione geografica reale). Coordinate gia' nel viewBox 1040x740.
const HAND_OVERRIDES = {
  // Maldives: lunga catena nord-sud di atolli (~800km), stilizzata in ~20 puntini
  mv: (() => {
    const cx = 520
    const points = []
    for (let i = 0; i < 20; i++) {
      const y = 110 + i * 28
      const offsetX = ((i % 3) - 1) * 18 + Math.sin(i * 0.7) * 12
      const r = i % 2 === 0 ? 14 : 10
      const x = cx + offsetX
      // Circle approximation as octagon (8-sided)
      const path = []
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      path.push('Z')
      points.push(path.join(''))
    }
    return points.join('')
  })(),
  // Tuvalu: 9 atolli in chain NO-SE
  tv: (() => {
    const cells = [
      [380, 200, 14], [430, 240, 12], [475, 285, 11],
      [515, 335, 13], [550, 385, 10], [580, 440, 12],
      [610, 495, 11], [645, 550, 13], [685, 600, 12],
    ]
    return cells.map(([x, y, r]) => {
      const path = []
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      return path.join('') + 'Z'
    }).join('')
  })(),
  // Marshall Islands: due catene parallele Ratak e Ralik
  mh: (() => {
    const cells = []
    // Ratak chain (right)
    for (let i = 0; i < 7; i++) cells.push([600 + i * 12, 160 + i * 70, 11])
    // Ralik chain (left)
    for (let i = 0; i < 6; i++) cells.push([430 + i * 8, 200 + i * 75, 10])
    return cells.map(([x, y, r]) => {
      const path = []
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      return path.join('') + 'Z'
    }).join('')
  })(),
  // Micronesia: 4 gruppi sparsi (Yap, Chuuk, Pohnpei, Kosrae)
  fm: (() => {
    const cells = [
      // Yap (W) — gruppo di 3 piccoli
      [180, 380, 9], [200, 400, 7], [220, 365, 8],
      // Chuuk (centro-O)
      [400, 380, 14], [420, 400, 10],
      // Pohnpei (centro-E)
      [640, 380, 18],
      // Kosrae (E)
      [840, 380, 14],
    ]
    return cells.map(([x, y, r]) => {
      const path = []
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      return path.join('') + 'Z'
    }).join('')
  })(),
  // Cook Islands: 15 isole su 2 gruppi (Northern + Southern, separati da ~1000km)
  ck: (() => {
    const cells = [
      // Northern Group (top) — atolli sparsi
      [200, 110, 10], // Pukapuka
      [310, 130, 8],  // Nassau
      [430, 90, 14],  // Suwarrow
      [560, 130, 12], // Rakahanga
      [620, 150, 14], // Manihiki
      [820, 100, 18], // Penrhyn (largest northern)
      // Southern Group (bottom) — volcanic + atolli
      [320, 480, 14], // Palmerston
      [440, 520, 8],  // Takutea
      [480, 540, 14], // Manuae
      [400, 560, 22], // Aitutaki
      [560, 600, 32], // Rarotonga (largest, capital)
      [690, 580, 18], // Mangaia
      [640, 540, 16], // Mauke
      [680, 510, 14], // Mitiaro
      [620, 500, 16], // Atiu
    ]
    return cells.map(([x, y, r]) => {
      const path = []
      const sides = r > 20 ? 12 : 8
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      return path.join('') + 'Z'
    }).join('')
  })(),
  // Cabo Verde: 10 isole in due archi (Barlavento N + Sotavento S) al largo del Senegal
  cv: (() => {
    const cells = [
      // Barlavento (windward, top arc)
      [320, 240, 32], // Santo Antão
      [400, 250, 24], // São Vicente
      [445, 255, 12], // Santa Luzia
      [490, 265, 26], // São Nicolau
      [600, 300, 34], // Sal
      [620, 360, 32], // Boa Vista
      // Sotavento (leeward, bottom arc)
      [330, 450, 38], // Maio
      [320, 510, 50], // Santiago (largest)
      [260, 470, 26], // Fogo
      [195, 460, 14], // Brava
    ]
    return cells.map(([x, y, r]) => {
      const path = []
      const sides = r > 20 ? 12 : 8
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2
        const px = (x + Math.cos(a) * r).toFixed(1)
        const py = (y + Math.sin(a) * r).toFixed(1)
        path.push(k === 0 ? `M${px},${py}` : `L${px},${py}`)
      }
      return path.join('') + 'Z'
    }).join('')
  })(),
}

async function fetchSvg(alpha2) {
  const url = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${alpha2}/vector.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function extractPathAndTransform(svg) {
  // Single-line collapse for regex
  const flat = svg.replace(/\n/g, ' ')
  const gMatch = flat.match(/<g[^>]*transform="([^"]+)"/)
  const transform = gMatch ? gMatch[1] : ''
  const pathMatch = flat.match(/<path[^>]*\sd="([^"]+)"/)
  if (!pathMatch) throw new Error('no <path d="..."> found')
  return { d: pathMatch[1], transform }
}

function polygonAreaXY(points) {
  // Shoelace formula. Returns absolute area (px²).
  let a = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % n]
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a / 2)
}

// Tradurre i comandi (abs) in array di subpath di punti.
function extractSubpaths(absD) {
  const subs = []
  let cur = []
  let lastX = 0
  let lastY = 0
  const tokens = absD.match(/[MLHVZmlhvz]|-?[\d.]+/g) || []
  let i = 0
  while (i < tokens.length) {
    const cmd = tokens[i]
    if (cmd === 'M' || cmd === 'L') {
      i++
      while (i < tokens.length && /^-?[\d.]/.test(tokens[i])) {
        const x = parseFloat(tokens[i++])
        const y = parseFloat(tokens[i++])
        if (cmd === 'M' && cur.length > 0) {
          subs.push(cur)
          cur = []
        }
        cur.push([x, y])
        lastX = x; lastY = y
      }
    } else if (cmd === 'H') {
      i++
      while (i < tokens.length && /^-?[\d.]/.test(tokens[i])) {
        const x = parseFloat(tokens[i++])
        cur.push([x, lastY])
        lastX = x
      }
    } else if (cmd === 'V') {
      i++
      while (i < tokens.length && /^-?[\d.]/.test(tokens[i])) {
        const y = parseFloat(tokens[i++])
        cur.push([lastX, y])
        lastY = y
      }
    } else if (cmd === 'Z' || cmd === 'z') {
      i++
      // close — no point
    } else {
      // Unsupported command — skip token
      i++
    }
  }
  if (cur.length > 0) subs.push(cur)
  return subs
}

// Per gli override usiamo un fillRatio aggressivo: questi paesi sono stati
// scelti esplicitamente perche' troppo piccoli nella 10m, e gli SVG sono gia'
// curati. Niente da temere dal "blown up": il path e' dettagliato.
function chooseOverrideFillRatio() {
  return 0.85
}

function svgToFittedPath(svg) {
  const { d, transform } = extractPathAndTransform(svg)
  // svgpath: convert all commands to absolute & apply the SVG transform from <g>
  let p = svgpath(d)
  // mapsicon transform string e.g. "translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
  // Apply the transform pieces manually
  const tMatch = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/)
  const sMatch = transform.match(/scale\(([-\d.]+),\s*([-\d.]+)\)/)
  if (tMatch && sMatch) {
    const tx = parseFloat(tMatch[1]); const ty = parseFloat(tMatch[2])
    const sx = parseFloat(sMatch[1]); const sy = parseFloat(sMatch[2])
    // Order: translate first, then scale (matches SVG composition right-to-left)
    p = p.translate(tx, ty).scale(sx, sy)
  } else if (sMatch) {
    const sx = parseFloat(sMatch[1]); const sy = parseFloat(sMatch[2])
    p = p.scale(sx, sy)
  } else if (tMatch) {
    const tx = parseFloat(tMatch[1]); const ty = parseFloat(tMatch[2])
    p = p.translate(tx, ty)
  }
  // Convert to absolute commands and unshort all
  p = p.abs().unshort().unarc()
  // svgpath doesn't directly convert beziers to lines; we'll just sample
  // the d-string commands. Easier: walk the path with `.iterate` and
  // accumulate points.
  const points = []
  let subStart = null
  p.iterate((seg, _i, x, y) => {
    const cmd = seg[0]
    if (cmd === 'M') { subStart = [seg[1], seg[2]]; points.push(subStart); }
    else if (cmd === 'L') { points.push([seg[1], seg[2]]) }
    else if (cmd === 'C') { points.push([seg[5], seg[6]]) } // endpoint of cubic
    else if (cmd === 'Q') { points.push([seg[3], seg[4]]) }
    else if (cmd === 'Z') { /* close — no new point */ }
    else { /* skip H/V handled by abs() */ }
  })

  if (points.length < 3) throw new Error('not enough points after parsing')

  // Compute bbox & area in source pixel space (Y already un-flipped via transform).
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of points) {
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
  }
  const bw = maxX - minX
  const bh = maxY - minY
  if (bw === 0 || bh === 0) throw new Error('degenerate bbox')

  const fillRatio = chooseOverrideFillRatio()

  // Fit bbox into TARGET_W x TARGET_H at fillRatio, preserving aspect.
  const tw = TARGET_W * fillRatio
  const th = TARGET_H * fillRatio
  const bboxAspect = bw / bh
  const tgtAspect = tw / th
  let drawW, drawH
  if (bboxAspect > tgtAspect) { drawW = tw; drawH = tw / bboxAspect }
  else { drawH = th; drawW = th * bboxAspect }
  const offX = (TARGET_W - drawW) / 2
  const offY = (TARGET_H - drawH) / 2

  const scaleK = drawW / bw // == drawH / bh

  // Emit a fresh path d-string by re-iterating with the fit transform.
  // We use the source commands but map endpoints; controls of beziers also remapped.
  function mapX(x) { return offX + (x - minX) * scaleK }
  function mapY(y) { return offY + (y - minY) * scaleK }
  let out = ''
  let prevCmd = ''
  p.iterate((seg) => {
    const c = seg[0]
    if (c === 'M') out += `M${mapX(seg[1]).toFixed(2)},${mapY(seg[2]).toFixed(2)}`
    else if (c === 'L') out += `L${mapX(seg[1]).toFixed(2)},${mapY(seg[2]).toFixed(2)}`
    else if (c === 'C') {
      out += `C${mapX(seg[1]).toFixed(2)},${mapY(seg[2]).toFixed(2)} ${mapX(seg[3]).toFixed(2)},${mapY(seg[4]).toFixed(2)} ${mapX(seg[5]).toFixed(2)},${mapY(seg[6]).toFixed(2)}`
    }
    else if (c === 'Q') {
      out += `Q${mapX(seg[1]).toFixed(2)},${mapY(seg[2]).toFixed(2)} ${mapX(seg[3]).toFixed(2)},${mapY(seg[4]).toFixed(2)}`
    }
    else if (c === 'Z') out += 'Z'
    prevCmd = c
  })
  return out
}

const results = {}
const errors = []

for (const a2 of TARGETS) {
  try {
    process.stdout.write(`  ${a2}: `)
    const svg = await fetchSvg(a2)
    const d = svgToFittedPath(svg)
    results[a2] = d
    console.log(`OK (${d.length} chars)`)
  } catch (err) {
    console.log(`SKIP — ${err.message}`)
    errors.push({ a2, err: err.message })
  }
}

// Hand-crafted stylized overrides for atoll-nations
for (const [a2, d] of Object.entries(HAND_OVERRIDES)) {
  results[a2] = d
  console.log(`  ${a2}: HAND-CRAFTED (${d.length} chars)`)
}

const outPath = resolve(ROOT, 'lib/social-media/silhouette-overrides.ts')
const header = `// AUTO-GENERATED by scripts/build-overrides.mjs.
// Source: mapsicon (https://github.com/djaiss/mapsicon, MIT license).
// SVG paths fitted to the 1040x740 silhouette viewBox using the same
// compactness-aware fillRatio logic as projection.ts.
//
// To regenerate: node scripts/build-overrides.mjs
// To add/remove countries: edit TARGETS in that script.

export const SILHOUETTE_OVERRIDES: Record<string, string> = {
`
const body = Object.entries(results)
  .map(([a2, d]) => `  ${a2}: '${d}',`)
  .join('\n')
const footer = `\n}\n`

await writeFile(outPath, header + body + footer)
console.log(`\nWrote ${Object.keys(results).length} overrides to ${outPath}`)
if (errors.length) console.log(`Skipped: ${errors.map(e => e.a2).join(', ')}`)
