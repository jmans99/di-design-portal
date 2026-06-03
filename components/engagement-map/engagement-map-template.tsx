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

function toIsoList(countries: EngagementMapCountry[]): string[] {
  const out: string[] = []
  for (const c of countries) {
    if (c.code) out.push(c.code)
  }
  return out
}

// Figma body type is 16 / lineHeight 24. When the live data has more countries
// than the Figma mock (which groups some entries, e.g. "OECS (9 countries)"),
// the column would overflow its vertical band, so the line-height tightens just
// enough to fit — capped at the design value of 24.
const DESIGN_LINE_HEIGHT = 24
const MIN_LINE_HEIGHT = 20

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
  // Explicit two-column split so the list can never overflow into a third
  // column (the Figma design is always two columns).
  const half = Math.ceil(countries.length / 2)
  const columns = [countries.slice(0, half), countries.slice(half)]
  const widths = [col1Width, col2Width]
  const rows = Math.max(half, 1)
  const lineHeight = Math.max(
    MIN_LINE_HEIGHT,
    Math.min(DESIGN_LINE_HEIGHT, Math.floor(maxHeight / rows))
  )
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
            countries={engaged}
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
            countries={earlyInterest}
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
