import { geoArea, geoBounds, geoEqualEarth, geoMercator, geoPath } from 'd3-geo'
import type { Feature, Polygon, MultiPolygon } from 'geojson'
import type { CountryFeature } from './silhouette-loader'

const SILHOUETTE_WIDTH = 1000
const SILHOUETTE_HEIGHT = 660

// Sopra questa soglia il paese fillera' la silhouette area. Sotto, viene reso
// proporzionalmente piu' piccolo per non sembrare "blown up" (utile per
// micro-stati e territori insulari come American Samoa, Monaco, Vatican).
const REFERENCE_SPAN_DEG = 3

// Soglia minima per il riempimento: anche un paese microscopico occupa almeno
// questa frazione della silhouette area, cosi' resta visibile.
const MIN_FILL_RATIO = 0.16

// Polygons piu' piccoli di questa frazione del piu' grande vengono scartati:
// elimina puntini fuorvianti senza eliminare isole maggiori (NZ South Island,
// Java/Sumatra/Borneo per Indonesia, Sicilia, ecc.).
const MAJOR_POLY_THRESHOLD = 0.05

/**
 * MultiPolygon -> MultiPolygon con solo i polygons "maggiori" (>= 5% del piu' grande).
 * Polygon resta invariato.
 */
function pruneMinorIslands(feature: CountryFeature): CountryFeature {
  const geom = feature.geometry
  if (geom.type !== 'MultiPolygon') return feature
  const polys = (geom as MultiPolygon).coordinates
  if (polys.length <= 1) return feature

  const areas = polys.map((coords) => {
    const sub: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: coords },
    }
    return geoArea(sub)
  })
  const max = Math.max(...areas)
  if (max <= 0) return feature

  const kept = polys.filter((_, i) => areas[i] >= max * MAJOR_POLY_THRESHOLD)
  if (kept.length === polys.length) return feature

  return {
    ...feature,
    geometry: { type: 'MultiPolygon', coordinates: kept },
  } as CountryFeature
}

/**
 * Genera la stringa "d" SVG per la silhouette del paese, fittando alla viewbox
 * SILHOUETTE_WIDTH x SILHOUETTE_HEIGHT.
 *
 * - Default: geoMercator (forma riconoscibile "atlante scolastico").
 * - Fallback: geoEqualEarth per paesi che attraversano l'antimeridiano (Russia, Fiji, NZ).
 * - Scala adattiva: paesi piu' piccoli di REFERENCE_SPAN_DEG vengono renderizzati
 *   piu' piccoli, centrati nella viewbox, cosi' non risultano stirati a riempire.
 */
export function buildCountryPath(feature: CountryFeature): string {
  const pruned = pruneMinorIslands(feature)

  const bounds = geoBounds(pruned)
  const lonSpan = bounds[1][0] - bounds[0][0]
  const latSpan = bounds[1][1] - bounds[0][1]
  const useEqualEarth = lonSpan > 170 || latSpan > 80 || lonSpan <= 0

  // Quanto e' "grande" il paese rispetto alla soglia di riferimento.
  const maxSpan = Math.max(Math.abs(lonSpan), Math.abs(latSpan))
  const fillRatio = useEqualEarth
    ? 1
    : Math.min(1, Math.max(MIN_FILL_RATIO, maxSpan / REFERENCE_SPAN_DEG))

  const targetW = SILHOUETTE_WIDTH * fillRatio
  const targetH = SILHOUETTE_HEIGHT * fillRatio
  const offsetX = (SILHOUETTE_WIDTH - targetW) / 2
  const offsetY = (SILHOUETTE_HEIGHT - targetH) / 2

  const projection = useEqualEarth ? geoEqualEarth() : geoMercator()
  projection.fitExtent(
    [
      [offsetX, offsetY],
      [offsetX + targetW, offsetY + targetH],
    ],
    pruned
  )

  return geoPath(projection)(pruned) ?? ''
}

export const SILHOUETTE_VIEWBOX = `0 0 ${SILHOUETTE_WIDTH} ${SILHOUETTE_HEIGHT}`
export { SILHOUETTE_WIDTH, SILHOUETTE_HEIGHT }
