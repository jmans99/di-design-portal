import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { getNumericFromAlpha2 } from './iso-numeric-map'

// GeoJSON pre-decodificato al build-time (scripts/copy-world-atlas.mjs). Saltiamo
// completamente topojson-client lato browser: una sua versione bundlata da Turbopack
// produce decoding scorretto per alcune feature (es. Australia decodificato come
// Polygon a 5 punti invece di MultiPolygon a 94 polys).
const GEOJSON_URL = '/data/social-media/countries-10m.geojson.json'

type CountryProps = { name?: string }
type CountryFeature = Feature<Geometry, CountryProps>

let cache: Promise<Map<string, CountryFeature>> | null = null

async function loadFeatureMap(): Promise<Map<string, CountryFeature>> {
  if (!cache) {
    cache = (async () => {
      const res = await fetch(GEOJSON_URL)
      if (!res.ok) throw new Error(`Failed to load ${GEOJSON_URL}: ${res.status}`)
      const collection = (await res.json()) as FeatureCollection<Geometry, CountryProps>
      const map = new Map<string, CountryFeature>()
      for (const f of collection.features) {
        if (f.id === undefined || f.id === null || f.id === '') continue
        // Salviamo sia la forma raw che padded a 3 cifre (es. "76" e "076").
        const raw = String(f.id)
        map.set(raw, f as CountryFeature)
        const padded = raw.padStart(3, '0')
        map.set(padded, f as CountryFeature)
      }
      return map
    })().catch((err) => {
      cache = null // permetti retry
      throw err
    })
  }
  return cache
}

export async function getCountryFeature(alpha2: string): Promise<CountryFeature | null> {
  const numeric = getNumericFromAlpha2(alpha2)
  if (!numeric) return null
  const map = await loadFeatureMap()
  return map.get(numeric) ?? map.get(numeric.replace(/^0+/, '')) ?? null
}

export type { CountryFeature }
