'use client'

import { useEffect, useMemo, useState } from 'react'

const SVG_URL = '/data/engagement-map-wiki.svg'

export const MAP_COLORS = {
  engaged: '#277AFF',
  earlyInterest: '#34C493',
  none: '#DFDFDF',
  stroke: '#FFFFFF',
} as const

type Props = {
  engagedIsoCodes: string[]
  earlyInterestIsoCodes: string[]
  width: number
  height: number
}

let svgCache: Promise<string> | null = null
function loadSvg(): Promise<string> {
  if (!svgCache) {
    svgCache = fetch(SVG_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${SVG_URL}: ${r.status}`)
      return r.text()
    })
  }
  return svgCache
}

function safeIso(iso: string): string {
  return iso.toLowerCase().replace(/[^a-z]/g, '')
}

const SCOPE = 'engagement-map-world'

function buildStyledSvg(rawSvg: string, engaged: string[], early: string[]): string {
  const engagedSelectors = engaged
    .map(safeIso)
    .filter(Boolean)
    .map((iso) => `.${SCOPE} .land.${iso}, .${SCOPE} .circle.${iso}`)
    .join(',')
  const earlySelectors = early
    .map(safeIso)
    .filter(Boolean)
    .map((iso) => `.${SCOPE} .land.${iso}, .${SCOPE} .circle.${iso}`)
    .join(',')

  const css = `
    .${SCOPE} path { fill: ${MAP_COLORS.none}; stroke: ${MAP_COLORS.stroke}; stroke-width: 1.5; stroke-linejoin: round; }
    .${SCOPE} .circle { stroke: none; }
    .${SCOPE} .antarctica path { stroke-width: 1; }
    ${engagedSelectors ? `${engagedSelectors} { fill: ${MAP_COLORS.engaged}; }` : ''}
    ${earlySelectors ? `${earlySelectors} { fill: ${MAP_COLORS.earlyInterest}; }` : ''}
  `

  return rawSvg.replace(
    /<svg([^>]*)>/,
    (_match, attrs) => `<svg${attrs} class="${SCOPE}" preserveAspectRatio="xMidYMid meet"><style>${css}</style>`
  )
}

export function WikiWorldMap({
  engagedIsoCodes,
  earlyInterestIsoCodes,
  width,
  height,
}: Props) {
  const [rawSvg, setRawSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSvg()
      .then((s) => {
        if (!cancelled) setRawSvg(s)
      })
      .catch((err) => console.error('WikiWorldMap load failed', err))
    return () => {
      cancelled = true
    }
  }, [])

  const html = useMemo(() => {
    if (!rawSvg) return ''
    return buildStyledSvg(rawSvg, engagedIsoCodes, earlyInterestIsoCodes)
  }, [rawSvg, engagedIsoCodes, earlyInterestIsoCodes])

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
