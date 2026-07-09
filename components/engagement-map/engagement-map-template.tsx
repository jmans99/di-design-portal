'use client'

import { forwardRef, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { WikiWorldMap, MAP_COLORS } from './wiki-world-map'
import {
  ENGAGEMENT_MAP_WIDTH,
  ENGAGEMENT_MAP_HEIGHT,
} from '@/lib/engagement-map/export'

const QR_TARGET_URL = 'https://maps.giga.global'

export type EngagementMapCountry = {
  code: string | null
  displayName: string
  rawName: string
}

export interface EngagementMapTemplateProps {
  engaged: EngagementMapCountry[]
  earlyInterest: EngagementMapCountry[]
}

const MAP_AREA = {
  x: 501,
  y: 141,
  width: 1387,
  height: 898,
}

function sortByName(countries: EngagementMapCountry[]): EngagementMapCountry[] {
  return [...countries].sort((a, b) =>
    a.rawName.localeCompare(b.rawName, 'en', { sensitivity: 'base' })
  )
}

function toIsoList(countries: EngagementMapCountry[]): string[] {
  const out: string[] = []
  for (const c of countries) {
    if (c.code) out.push(c.code)
  }
  return out
}

// Figma body type is 16 / lineHeight 24 over two columns. When the live data
// has more countries than two columns can hold within the vertical band, a
// third column is added so the list never runs into the section below. As a
// last resort (even three columns too tall) the line-height tightens slightly.
// Long names wrap inside their column, so packing is done by estimated lines
// rather than by item count.
const DESIGN_LINE_HEIGHT = 24
const MIN_LINE_HEIGHT = 20
const THREE_COL_WIDTH = 180
// Rough average glyph width for Open Sans SemiBold at 16px.
const AVG_CHAR_WIDTH = 8.3

function estimateLines(name: string, colWidth: number): number {
  return Math.max(1, Math.ceil((name.length * AVG_CHAR_WIDTH) / colWidth))
}

function totalLines(countries: EngagementMapCountry[], colWidth: number): number {
  return countries.reduce((sum, c) => sum + estimateLines(c.rawName, colWidth), 0)
}

// Fill each column up to targetLines estimated lines; the last column takes
// whatever remains.
function packByLines(
  countries: EngagementMapCountry[],
  widths: number[],
  targetLines: number
): EngagementMapCountry[][] {
  const cols: EngagementMapCountry[][] = []
  let i = 0
  for (let c = 0; c < widths.length; c++) {
    const isLast = c === widths.length - 1
    const col: EngagementMapCountry[] = []
    let lines = 0
    while (i < countries.length) {
      const l = estimateLines(countries[i].rawName, widths[c])
      if (!isLast && col.length > 0 && lines + l > targetLines) break
      col.push(countries[i])
      lines += l
      i++
    }
    cols.push(col)
  }
  return cols
}

function CountryList({
  countries,
  col1Width,
  col2Width,
  maxHeight,
}: {
  countries: EngagementMapCountry[]
  col1Width: number
  col2Width: number
  maxHeight: number
}) {
  const capacity = Math.max(1, Math.floor(maxHeight / DESIGN_LINE_HEIGHT))
  // Conservative two-column estimate uses the narrower column width.
  const fitsTwo =
    Math.ceil(totalLines(countries, Math.min(col1Width, col2Width)) / 2) <=
    capacity
  const widths = fitsTwo
    ? [col1Width, col2Width]
    : [THREE_COL_WIDTH, THREE_COL_WIDTH, THREE_COL_WIDTH]
  const lines = totalLines(countries, widths[widths.length - 1])
  const perColumn = Math.ceil(lines / widths.length)
  const lineHeight =
    perColumn <= capacity ? DESIGN_LINE_HEIGHT : MIN_LINE_HEIGHT
  const columns = packByLines(countries, widths, perColumn)
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {columns.map((col, i) => (
        <div
          key={i}
          style={{
            width: widths[i],
            fontSize: 16,
            lineHeight: `${lineHeight}px`,
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.9)',
            letterSpacing: 0,
          }}
        >
          {col.map((c) => (
            <div key={`${c.rawName}-${c.code ?? 'unk'}`}>{c.rawName}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

export const EngagementMapTemplate = forwardRef<
  HTMLDivElement,
  EngagementMapTemplateProps
>(function EngagementMapTemplate({ engaged, earlyInterest }, ref) {
  // The Excel columns come in join order; the rendered lists read better A→Z.
  const engagedSorted = useMemo(() => sortByName(engaged), [engaged])
  const earlySorted = useMemo(() => sortByName(earlyInterest), [earlyInterest])
  const engagedIso = useMemo(() => toIsoList(engaged), [engaged])
  const earlyIso = useMemo(() => toIsoList(earlyInterest), [earlyInterest])

  return (
    <div
      ref={ref}
      style={{
        width: ENGAGEMENT_MAP_WIDTH,
        height: ENGAGEMENT_MAP_HEIGHT,
        position: 'relative',
        background: '#FFFFFF',
        fontFamily: "'Open Sans', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Map background */}
      <div
        style={{
          position: 'absolute',
          left: MAP_AREA.x,
          top: MAP_AREA.y,
          width: MAP_AREA.width,
          height: MAP_AREA.height,
        }}
      >
        <WikiWorldMap
          width={MAP_AREA.width}
          height={MAP_AREA.height}
          engagedIsoCodes={engagedIso}
          earlyInterestIsoCodes={earlyIso}
        />
      </div>

      {/* Engaged section */}
      <div style={{ position: 'absolute', left: 55, top: 60, width: 471 }}>
        <SectionTitle dotColor={MAP_COLORS.engaged}>
          Countries Engaged With Giga ({engaged.length})
        </SectionTitle>
        <div style={{ marginTop: 24 }}>
          <CountryList
            countries={engagedSorted}
            col1Width={247}
            col2Width={200}
            maxHeight={557}
          />
        </div>
      </div>

      {/* Early interest section */}
      <div style={{ position: 'absolute', left: 55, top: 697, width: 471 }}>
        <SectionTitle dotColor={MAP_COLORS.earlyInterest}>
          Countries With Early Interest ({earlyInterest.length})
        </SectionTitle>
        <div style={{ marginTop: 24 }}>
          <CountryList
            countries={earlySorted}
            col1Width={246}
            col2Width={200}
            maxHeight={284}
          />
        </div>
      </div>

      {/* QR code top-right */}
      <div
        style={{
          position: 'absolute',
          right: 51,
          top: 45,
          width: 191,
          height: 191,
          background: '#FFFFFF',
          padding: 8,
          borderRadius: 8,
        }}
      >
        <QRCodeSVG
          value={QR_TARGET_URL}
          size={175}
          level="M"
          marginSize={0}
          fgColor="#0A0A0A"
          bgColor="#FFFFFF"
        />
      </div>

      {/* Logo bottom-right */}
      <img
        src="/logos/giga-unicef-itu-horizontal.svg"
        alt="Giga · UNICEF · ITU"
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          right: 51,
          bottom: 40,
          width: 450,
          height: 94,
          objectFit: 'contain',
          objectPosition: 'right center',
        }}
      />
    </div>
  )
})

function SectionTitle({
  dotColor,
  children,
}: {
  dotColor: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          width: 18.49,
          height: 18.49,
          borderRadius: '50%',
          background: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 32,
          lineHeight: '40px',
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.9)',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </span>
    </div>
  )
}
