import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { getNumericFromAlpha2 } from './iso-numeric-map'

const TOPOJSON_URL = '/data/social-media/countries-10m.json'

type CountryProps = { name?: string }
type CountryFeature = Feature<Geometry, CountryProps>

let cache: Promise<Map<string, CountryFeature>> | null = null

async function loadFeatureMap(): Promise<Map<string, CountryFeature>> {
  if (!cache) {
    cache = (async () => {
      const res = await fetch(TOPOJSON_URL)
      if (!res.ok) throw new Error(`Failed to load ${TOPOJSON_URL}: ${res.status}`)
      // world-atlas countries-50m.json: TopoJSON con objects.countries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topology = (await res.json()) as any
      const collection = feature(
        topology,
        topology.objects.countries
      ) as unknown as FeatureCollection<Geometry, CountryProps>
      const map = new Map<string, CountryFeature>()
      for (const f of collection.features) {
        if (f.id === undefined || f.id === null) continue
        // L'id puo' essere stringa o numero. Normalizziamo a stringa numerica e a forma
        // padded a 3 cifre, cosi' lookup robusto sia per "76" sia per "076".
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
