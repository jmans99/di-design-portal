import { GIGA_BACKEND } from './config'

/**
 * Server side helpers shared by the giga-maps API routes. Everything here is
 * cached in module scope: Vercel keeps warm functions around long enough for
 * this to matter, and the upstream answers change at most a few times a day.
 */

const DEFAULT_LIVE_LAYER = 10
const CACHE_TTL_MS = 6 * 3600 * 1000
const WEEKS_TO_PROBE = 10

type PublishedLayer = {
  id: number
  type: 'LIVE' | 'STATIC'
  applicable_countries?: number[]
}

let layerCache: { at: number; layers: PublishedLayer[] } | null = null

/** GigaMaps picks a country specific live layer when one is published
 * (Brazil has layer 14), otherwise the global default layer 10. */
export async function resolveLiveLayer(countryId: number): Promise<number> {
  const fresh = layerCache && Date.now() - layerCache.at < CACHE_TTL_MS
  if (!fresh) {
    try {
      const res = await fetch(`${GIGA_BACKEND}/api/accounts/layers/PUBLISHED/`, {
        next: { revalidate: 21600 },
      })
      if (res.ok) {
        const raw = (await res.json()) as PublishedLayer[] | { results: PublishedLayer[] }
        layerCache = { at: Date.now(), layers: Array.isArray(raw) ? raw : raw.results }
      }
    } catch {
      // fall through to default
    }
  }
  const match = layerCache?.layers.find(
    (l) => l.type === 'LIVE' && l.applicable_countries?.includes(countryId)
  )
  return match?.id ?? DEFAULT_LIVE_LAYER
}

export type RealtimeWindow = {
  layerId: number
  /** dd-mm-yyyy, as the Giga backend expects */
  startDate: string
  endDate: string
  /** ISO yyyy-mm-dd for display */
  startIso: string
  endIso: string
  schoolsWithData: number
}

const windowCache = new Map<number, { at: number; value: RealtimeWindow | null }>()

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function fmtBackend(d: Date) {
  return `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`
}
function fmtIso(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** Monday of the last fully completed ISO week (UTC). */
function lastCompletedWeekStart(now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dow = (d.getUTCDay() + 6) % 7 // 0 = Monday
  d.setUTCDate(d.getUTCDate() - dow - 7)
  return d
}

/**
 * Real-time tiles only carry speed classes for the week you ask for, and the
 * most recent week is often still empty. Mirror GigaMaps: walk back week by
 * week until one has measurements. Null when nothing was found.
 */
export async function resolveRealtimeWindow(countryId: number): Promise<RealtimeWindow | null> {
  const cached = windowCache.get(countryId)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value

  const layerId = await resolveLiveLayer(countryId)
  let value: RealtimeWindow | null = null
  const monday = lastCompletedWeekStart()

  for (let i = 0; i < WEEKS_TO_PROBE; i++) {
    const start = new Date(monday)
    start.setUTCDate(monday.getUTCDate() - i * 7)
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)
    const url =
      `${GIGA_BACKEND}/api/accounts/layers/${layerId}/info/` +
      `?start_date=${fmtBackend(start)}&end_date=${fmtBackend(end)}&is_weekly=true&country_id=${countryId}`
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue
      const info = (await res.json()) as { school_with_realtime_data?: number }
      const n = Number(info.school_with_realtime_data ?? 0)
      if (n > 0) {
        value = {
          layerId,
          startDate: fmtBackend(start),
          endDate: fmtBackend(end),
          startIso: fmtIso(start),
          endIso: fmtIso(end),
          schoolsWithData: n,
        }
        break
      }
    } catch {
      // try the previous week
    }
  }

  windowCache.set(countryId, { at: Date.now(), value })
  return value
}
