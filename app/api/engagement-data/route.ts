import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { normalizeToIsoCode, stripAnnotations } from '@/lib/engagement-map/country-name-normalizer'

export const revalidate = 300

const DEFAULT_SHARE_URL =
  'https://unicef-my.sharepoint.com/:x:/g/personal/mdelprete_unicef_org/IQDyS71gbyPDSoiiJ0DtKpRgAb7PhlveMIMyPTS3RTKkHno?e=68Mb4U'

type EngagementCountry = {
  code: string | null
  displayName: string
  rawName: string
}

type ApiResponse = {
  engaged: EngagementCountry[]
  earlyInterest: EngagementCountry[]
  unresolved: string[]
  fetchedAt: string
  sourceUrl: string
}

function shareUrlToDownloadUrl(shareUrl: string): string {
  const u = new URL(shareUrl)
  const parts = u.pathname.split('/').filter(Boolean)
  const personalIdx = parts.indexOf('personal')
  if (personalIdx < 0 || personalIdx + 2 >= parts.length) {
    throw new Error(`Unrecognized SharePoint share URL: ${shareUrl}`)
  }
  const user = parts[personalIdx + 1]
  const token = parts[personalIdx + 2]
  return `${u.origin}/personal/${user}/_layouts/15/download.aspx?share=${token}`
}

function parseColumn(sheet: XLSX.WorkSheet, col: 'A' | 'B'): string[] {
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:A1')
  const out: string[] = []
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const addr = `${col}${row + 1}`
    const cell = sheet[addr]
    if (!cell) continue
    const v = String(cell.v ?? '').trim()
    if (v) out.push(v)
  }
  return out
}

function buildCountry(rawName: string): EngagementCountry {
  const code = normalizeToIsoCode(rawName)
  return {
    code,
    displayName: stripAnnotations(rawName),
    rawName,
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse | { error: string }>> {
  // `?refresh=1` bypasses the 5-minute cache and re-downloads the Excel now.
  const forceRefresh = new URL(request.url).searchParams.has('refresh')
  const shareUrl = process.env.ENGAGEMENT_EXCEL_SHARE_URL || DEFAULT_SHARE_URL
  try {
    const downloadUrl = shareUrlToDownloadUrl(shareUrl)
    const res = await fetch(downloadUrl, {
      headers: { Accept: 'application/octet-stream' },
      ...(forceRefresh
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 300 } }),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `SharePoint download failed: HTTP ${res.status}` },
        { status: 502 }
      )
    }
    const buf = Buffer.from(await res.arrayBuffer())
    // SharePoint answers 200 + an HTML error page when the share link has
    // expired or requires sign-in. Catch it before xlsx tries to parse it.
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('text/html') || buf.subarray(0, 64).toString('utf8').trimStart().startsWith('<')) {
      const html = buf.toString('utf8')
      const expired = /link has expired/i.test(html)
      return NextResponse.json(
        {
          error: expired
            ? 'SharePoint share link has expired. Create a new "Anyone with the link" share link for the Excel file and set ENGAGEMENT_EXCEL_SHARE_URL.'
            : 'SharePoint returned a web page instead of the Excel file (link expired or sign-in required). Create a new share link and set ENGAGEMENT_EXCEL_SHARE_URL.',
        },
        { status: 502 }
      )
    }
    const wb = XLSX.read(buf, { type: 'buffer' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    if (!sheet) {
      return NextResponse.json({ error: 'Excel sheet 1 not found' }, { status: 502 })
    }

    const engagedRaw = parseColumn(sheet, 'A')
    const earlyRaw = parseColumn(sheet, 'B')

    const engaged = engagedRaw.map(buildCountry)
    const earlyInterest = earlyRaw.map(buildCountry)

    const unresolved = [...engaged, ...earlyInterest]
      .filter((c) => !c.code)
      .map((c) => c.rawName)

    return NextResponse.json({
      engaged,
      earlyInterest,
      unresolved,
      fetchedAt: new Date().toISOString(),
      sourceUrl: shareUrl,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
