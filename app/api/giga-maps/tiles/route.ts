import { NextRequest, NextResponse } from 'next/server'
import { GIGA_BACKEND, GLOBAL_TILE_LIMIT, WORLD_TILE_LIMIT } from '@/lib/giga-maps/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vector tile proxy for facility dots. The Giga backend serves the tiles
 * publicly but without CORS headers, so the browser cannot fetch them
 * directly from gigabrand. We forward the request and let Vercel's CDN cache
 * the response (tiles change at most every few hours upstream).
 *
 * kind=school | health | all -> /api/v2/entities/tiles/connectivity_status/
 * Schools arrive in source-layer "school", health centers in "entities".
 *
 * scope=global (continent and world maps) uses the sampled
 * /api/v2/entities/tiles/connectivity/ endpoint instead: its `limit` is a
 * spatially uniform sample, so a continent keeps its density pattern at a
 * bounded size (see GLOBAL_TILE_LIMIT). Bodies are streamed through rather
 * than buffered: Vercel caps buffered function responses at 4.5 MB.
 */

const TILE_HEADERS = {
  'Content-Type': 'application/vnd.mapbox-vector-tile',
  'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const kindParam = sp.get('kind')
  const kind = kindParam === 'health' || kindParam === 'all' ? kindParam : 'school'
  const scope = sp.get('scope') === 'global' ? 'global' : 'country'
  const countryId = Number(sp.get('country'))
  const z = Number(sp.get('z'))
  const x = Number(sp.get('x'))
  const y = Number(sp.get('y'))

  const coordsOk = [z, x, y].every((n) => Number.isInteger(n) && n >= 0)
  const countryOk = scope === 'global' || (Number.isInteger(countryId) && countryId >= 0)
  if (!coordsOk || !countryOk) {
    return NextResponse.json({ error: 'Invalid tile parameters' }, { status: 400 })
  }
  if (z > 16) return new NextResponse(null, { status: 204 })

  const upstream =
    scope === 'global'
      ? `${GIGA_BACKEND}/api/v2/entities/tiles/connectivity/` +
        `?entity_type__code=${kind}&limit=${z <= 2 ? WORLD_TILE_LIMIT : GLOBAL_TILE_LIMIT}` +
        `&health_benchmark=global&health_include_same_location=false` +
        `&school_layer_id=1&school_benchmark=global&school_include_same_location=false` +
        `&z=${z}&x=${x}&y=${y}.mvt`
      : `${GIGA_BACKEND}/api/v2/entities/tiles/connectivity_status/` +
        `?country_id=${countryId}&entity_type__code=${kind}&z=${z}&x=${x}&y=${y}.mvt`

  try {
    // No Accept header on purpose: the backend answers 406 to anything
    // narrower than */*.
    const res = await fetch(upstream, {
      cache: 'no-store',
      signal: AbortSignal.timeout(50000),
    })
    if (res.status === 404 || res.status === 204 || res.headers.get('content-length') === '0' || !res.body) {
      return new NextResponse(null, { status: 204, headers: TILE_HEADERS })
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }
    // Never forward the upstream Content-Length: it counts the compressed
    // bytes, fetch hands us the decompressed stream, and a wrong length makes
    // browsers cut the tile short. Chunked transfer is fine.
    return new NextResponse(res.body, { status: 200, headers: TILE_HEADERS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Tile fetch failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
