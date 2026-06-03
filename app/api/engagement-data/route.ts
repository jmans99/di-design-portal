import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { normalizeToIsoCode, stripAnnotations } from '@/lib/engagement-map/country-name-normalizer'

export const revalidate = 300

const DEFAULT_SHARE_URL =
  'https://unicef-my.sharepoint.com/:x:/g/personal/mdelprete_unicef_org/IQAicr-B1aq4Q7MV5EW_HIq2AfaRRyHBiBDBCd_ryT6TSC0?e=EfMtjU'

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

export async function GET(): Promise<NextResponse<ApiResponse | { error: string }>> {
  const shareUrl = process.env.ENGAGEMENT_EXCEL_SHARE_URL || DEFAULT_SHARE_URL
  try {
    const downloadUrl = shareUrlToDownloadUrl(shareUrl)
    const res = await fetch(downloadUrl, {
      headers: { Accept: 'application/octet-stream' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `SharePoint download failed: HTTP ${res.status}` },
        { status: 502 }
      )
    }
    const buf = Buffer.from(await res.arrayBuffer())
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
