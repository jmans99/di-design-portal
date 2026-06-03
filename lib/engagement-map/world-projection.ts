import { geoEqualEarth, geoPath } from 'd3-geo'
import type { FeatureCollection, Geometry } from 'geojson'

const GEOJSON_URL = '/data/social-media/countries-10m.geojson.json'

type CountryProps = { name?: string }

export type WorldPath = {
  numericId: string
  name: string
  d: string
}

let collectionCache: Promise<FeatureCollection<Geometry, CountryProps>> | null = null

async function loadCollection(): Promise<FeatureCollection<Geometry, CountryProps>> {
  if (!collectionCache) {
    collectionCache = (async () => {
      const res = await fetch(GEOJSON_URL)
      if (!res.ok) throw new Error(`Failed to load ${GEOJSON_URL}: ${res.status}`)
      return res.json() as Promise<FeatureCollection<Geometry, CountryProps>>
    })().catch((err) => {
      collectionCache = null
      throw err
    })
  }
  return collectionCache
}

const pathCache = new Map<string, WorldPath[]>()

export async function buildWorldPaths(width: number, height: number): Promise<WorldPath[]> {
  const key = `${width}x${height}`
  const cached = pathCache.get(key)
  if (cached) return cached

  const collection = await loadCollection()
  const projection = geoEqualEarth()
  projection.fitExtent(
    [
      [0, 0],
      [width, height],
    ],
    collection
  )
  const path = geoPath(projection)

  const out: WorldPath[] = []
  for (const f of collection.features) {
    if (f.id === undefined || f.id === null || f.id === '') continue
    const d = path(f as never)
    if (!d) continue
    out.push({
      numericId: String(f.id).padStart(3, '0'),
      name: f.properties?.name ?? '',
      d,
    })
  }
  pathCache.set(key, out)
  return out
}
