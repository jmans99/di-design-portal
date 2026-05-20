'use client'

import { useEffect, useState } from 'react'
import { getCountryFeature } from '@/lib/social-media/silhouette-loader'
import {
  SILHOUETTE_HEIGHT,
  SILHOUETTE_VIEWBOX,
  SILHOUETTE_WIDTH,
  buildCountryPath,
} from '@/lib/social-media/projection'
import { SILHOUETTE_OVERRIDES } from '@/lib/social-media/silhouette-overrides'

interface CountrySilhouetteProps {
  /** ISO 3166-1 alpha-2 (lowercase). */
  alpha2: string
  /** Colore di riempimento; default e' una variante leggermente piu' scura del Giga Blue. */
  fill?: string
}

export function CountrySilhouette({
  alpha2,
  fill = 'rgba(0, 0, 0, 0.18)',
}: CountrySilhouetteProps) {
  const [d, setD] = useState<string | null>(SILHOUETTE_OVERRIDES[alpha2] ?? null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setMissing(false)

    const override = SILHOUETTE_OVERRIDES[alpha2]
    if (override) {
      setD(override)
      return
    }

    setD(null)
    getCountryFeature(alpha2)
      .then((feature) => {
        if (cancelled) return
        if (!feature) {
          setMissing(true)
          return
        }
        setD(buildCountryPath(feature))
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[CountrySilhouette] failed to load feature for', alpha2, err)
        setMissing(true)
      })

    return () => {
      cancelled = true
    }
  }, [alpha2])

  return (
    <svg
      width={SILHOUETTE_WIDTH}
      height={SILHOUETTE_HEIGHT}
      viewBox={SILHOUETTE_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {d && !missing ? <path d={d} fill={fill} /> : null}
    </svg>
  )
}
