import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { feature } from 'topojson-client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC = resolve(ROOT, 'node_modules/world-atlas/countries-10m.json')
const DEST = resolve(ROOT, 'public/data/social-media/countries-10m.geojson.json')

try {
  await access(SRC)
} catch {
  console.warn('[copy-world-atlas] node_modules/world-atlas not installed yet — skipping')
  process.exit(0)
}

const raw = await readFile(SRC, 'utf8')
const topo = JSON.parse(raw)
const collection = feature(topo, topo.objects.countries)

// Quantizza le coordinate a 4 decimali (~11m precision a 0° lat). La silhouette
// renderizzata a 1000px copre ~ il mondo intero, quindi 4 decimali sono molto piu'
// precisi del necessario. Riduce drasticamente la dimensione del file servito.
const Q = 10000
function quantizeRing(ring) {
  return ring.map(([x, y]) => [Math.round(x * Q) / Q, Math.round(y * Q) / Q])
}
function quantizeGeometry(geom) {
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: geom.coordinates.map(quantizeRing) }
  }
  if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map((poly) => poly.map(quantizeRing)),
    }
  }
  return geom
}

// Dedup per id: world-atlas usa lo stesso codice ISO numerico per due entry
// (es. "036" e' sia Australia che Ashmore and Cartier Is.). Tengo quella con
// piu' vertici (sicuramente il paese principale).
function totalVertices(geom) {
  if (geom.type === 'Polygon') return geom.coordinates.reduce((s, r) => s + r.length, 0)
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.reduce((s, poly) => s + poly.reduce((ss, r) => ss + r.length, 0), 0)
  }
  return 0
}

// Alcuni territori arrivano senza id ufficiale (es. Kosovo). Li re-id-ifichiamo
// matchando per nome, cosi' silhouette-loader li trova via iso-numeric-map.
const NAME_TO_ID = {
  Kosovo: 'xk',
}

const byId = new Map()
for (const f of collection.features) {
  let id = String(f.id ?? '')
  if (!id) {
    const fallback = NAME_TO_ID[f.properties?.name]
    if (fallback) id = fallback
    else continue
  }
  const existing = byId.get(id)
  if (!existing || totalVertices(f.geometry) > totalVertices(existing.geometry)) {
    byId.set(id, f)
  }
}

const slim = {
  type: 'FeatureCollection',
  features: Array.from(byId.entries()).map(([id, f]) => ({
    type: 'Feature',
    id,
    geometry: quantizeGeometry(f.geometry),
  })),
}

await mkdir(dirname(DEST), { recursive: true })
await writeFile(DEST, JSON.stringify(slim))
console.log(`[copy-world-atlas] decoded TopoJSON -> GeoJSON, ${slim.features.length} features -> ${DEST}`)
