import { geoArea, geoBounds, geoEqualEarth, geoMercator, geoPath } from 'd3-geo'
import type { Feature, Polygon, MultiPolygon } from 'geojson'
import type { CountryFeature } from './silhouette-loader'

const SILHOUETTE_WIDTH = 1000
const SILHOUETTE_HEIGHT = 660

// Soglia di "natural fill": un paese con maxSpan >= REFERENCE_SPAN_DEG fillera'
// integralmente la silhouette area. Sotto, viene scalato in base alla compactness
// (vedi sotto) per uniformare la dimensione visiva tra paesi piccoli e medi.
const REFERENCE_SPAN_DEG = 1.0

// Polygons piu' piccoli di questa frazione del piu' grande vengono scartati:
// elimina puntini fuorvianti senza eliminare isole maggiori (NZ South Island,
// Java/Sumatra/Borneo per Indonesia, Sicilia, ecc.).
const MAJOR_POLY_THRESHOLD = 0.05

const DEG2RAD = Math.PI / 180

/**
 * Compactness = quanta parte del bounding box e' effettivamente landmass.
 * - ~0.6+ : paese compatto (Andorra, Monaco, Bahrain) -> safe da scalare aggressivamente
 * - ~0.2-0.4 : multi-island (Antigua and Barbuda, Italia, Cyprus) -> scalare con cautela
 * - <0.15 : arcipelago sparso (American Samoa, Marshall Is., Seychelles) -> non scalare,
 *           altrimenti si "spalma" su mare vuoto
 */
function bboxSteradians(bounds: [[number, number], [number, number]]): number {
  const lonSpan = bounds[1][0] - bounds[0][0]
  return Math.abs(
    lonSpan * DEG2RAD * (Math.sin(bounds[1][1] * DEG2RAD) - Math.sin(bounds[0][1] * DEG2RAD))
  )
}

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
 * - Scala adattiva basata su compactness: paesi piccoli ma compatti (Andorra, Monaco)
 *   vengono ingranditi cosi' restano visivamente paragonabili ai medi/grandi; arcipelaghi
 *   sparsi (American Samoa, Marshall Is.) restano contenuti per non spalmarsi sul mare.
 */
export function buildCountryPath(feature: CountryFeature): string {
  const pruned = pruneMinorIslands(feature)

  const bounds = geoBounds(pruned)
  const lonSpan = bounds[1][0] - bounds[0][0]
  const latSpan = bounds[1][1] - bounds[0][1]
  const useEqualEarth = lonSpan > 170 || latSpan > 80 || lonSpan <= 0

  const maxSpan = Math.max(Math.abs(lonSpan), Math.abs(latSpan))
  const compactness = geoArea(pruned) / Math.max(bboxSteradians(bounds), 1e-12)

  // Tier per minimum/maximum fill in base a compactness.
  let minFill: number
  let maxFill: number
  if (compactness >= 0.4) {
    // Landmass compatto (Andorra, Monaco, Bahrain, Luxembourg, Singapore, Eswatini).
    minFill = 0.65
    maxFill = 1
  } else if (compactness >= 0.15) {
    // Multi-island con mare contenuto (Antigua and Barbuda, Italia, Cyprus, Samoa).
    minFill = 0.4
    maxFill = 1
  } else {
    // Arcipelago sparso (American Samoa, Marshall Is., Seychelles, Mauritius).
    minFill = 0.18
    maxFill = 0.5
  }

  const naturalFill = maxSpan / REFERENCE_SPAN_DEG
  const fillRatio = useEqualEarth
    ? 1
    : Math.max(minFill, Math.min(maxFill, naturalFill))

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
