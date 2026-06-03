'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildWorldPaths, type WorldPath } from '@/lib/engagement-map/world-projection'

export const MAP_COLORS = {
  engaged: '#277AFF',
  earlyInterest: '#5BE6A6',
  none: '#E6EAF0',
  stroke: '#FFFFFF',
  strokeNone: '#D5DBE5',
} as const

type WorldMapProps = {
  width: number
  height: number
  engagedNumericIds: Set<string>
  earlyInterestNumericIds: Set<string>
}

type ColoredPath = WorldPath & { fill: string; priority: number }

export function WorldMap({
  width,
  height,
  engagedNumericIds,
  earlyInterestNumericIds,
}: WorldMapProps) {
  const [paths, setPaths] = useState<WorldPath[] | null>(null)

  useEffect(() => {
    let cancelled = false
    buildWorldPaths(width, height)
      .then((p) => {
        if (!cancelled) setPaths(p)
      })
      .catch((err) => {
        console.error('Failed to build world paths', err)
      })
    return () => {
      cancelled = true
    }
  }, [width, height])

  // Render grey countries first, then colored ones on top — d3-geo's antimeridian
  // wrap can make some grey paths (e.g. Russia) cover huge areas and obscure
  // colored countries if rendered later in document order.
  const orderedPaths = useMemo<ColoredPath[] | null>(() => {
    if (!paths) return null
    const out: ColoredPath[] = paths.map((p) => {
      if (engagedNumericIds.has(p.numericId)) {
        return { ...p, fill: MAP_COLORS.engaged, priority: 2 }
      }
      if (earlyInterestNumericIds.has(p.numericId)) {
        return { ...p, fill: MAP_COLORS.earlyInterest, priority: 1 }
      }
      return { ...p, fill: MAP_COLORS.none, priority: 0 }
    })
    out.sort((a, b) => a.priority - b.priority)
    return out
  }, [paths, engagedNumericIds, earlyInterestNumericIds])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {orderedPaths?.map((p) => {
        const isColored = p.priority > 0
        return (
          <path
            key={p.numericId}
            d={p.d}
            fill={p.fill}
            stroke={isColored ? MAP_COLORS.stroke : MAP_COLORS.strokeNone}
            strokeWidth={isColored ? 0.8 : 0.6}
            strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}
