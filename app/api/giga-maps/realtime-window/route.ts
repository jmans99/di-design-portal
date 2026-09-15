import { NextRequest, NextResponse } from 'next/server'
import { resolveRealtimeWindow } from '@/lib/giga-maps/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Which week the real-time layer is showing for a country (or null). */
export async function GET(req: NextRequest) {
  const countryId = Number(req.nextUrl.searchParams.get('country'))
  if (!Number.isInteger(countryId) || countryId <= 0) {
    return NextResponse.json({ error: 'Invalid country id' }, { status: 400 })
  }
  const window = await resolveRealtimeWindow(countryId)
  return NextResponse.json(window, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  })
}
