'use client'

import { useEffect, useMemo, useState } from 'react'

// Pre-processed copy of the wiki world map: the marker circles that stood in
// for small island states are removed, and every land shape too small to read
// at map scale carries a baked-in transform that enlarges it around its own
// center, so islands keep their real outline. Regenerate with
// tools/enlarge-map-islands.md if the base map is ever replaced.
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
  // Multi-polygon countries carry the class on a <g> wrapper whose child
  // <path> elements have no class of their own. The generic `path` rule below
  // sets fill directly on every path, which would beat the group's inherited
  // fill — so also target the descendant paths explicitly.
  const toSelector = (iso: string) =>
    `.${SCOPE} .land.${iso}, .${SCOPE} .land.${iso} path`
  const engagedSelectors = engaged
    .map(safeIso)
    .filter(Boolean)
    .map(toSelector)
    .join(',')
  const earlySelectors = early
    .map(safeIso)
    .filter(Boolean)
    .map(toSelector)
    .join(',')

  const css = `
    .${SCOPE} path { fill: ${MAP_COLORS.none}; stroke: ${MAP_COLORS.stroke}; stroke-width: 1.5; stroke-linejoin: round; }
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
