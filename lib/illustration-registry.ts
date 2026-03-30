/**
 * Registry for Giga pillar pictograms (illustrations).
 * Fill: single SVG per pictogram. Outline: white and blue variants.
 */

export type IllustrationId =
  | 'mapping'
  | 'model'
  | 'finance'
  | 'contract'
  | 'development'

export type IllustrationStyle = 'fill' | 'outline'
export type OutlineColor = 'white' | 'blue'

const BASE = '/illustrations'

export interface IllustrationAsset {
  id: IllustrationId
  label: string
  fillPath: string
  outlines: { white: string; blue: string }
}

export const ILLUSTRATIONS: IllustrationAsset[] = [
  {
    id: 'mapping',
    label: 'Mapping',
    fillPath: `${BASE}/fill/mapping.svg`,
    outlines: {
      white: `${BASE}/outlines/mapping-white.svg`,
      blue: `${BASE}/outlines/mapping-blue.svg`,
    },
  },
  {
    id: 'model',
    label: 'Model',
    fillPath: `${BASE}/fill/model.svg`,
    outlines: {
      white: `${BASE}/outlines/model-white.svg`,
      blue: `${BASE}/outlines/model-blue.svg`,
    },
  },
  {
    id: 'finance',
    label: 'Finance',
    fillPath: `${BASE}/fill/finance.svg`,
    outlines: {
      white: `${BASE}/outlines/finance-white.svg`,
      blue: `${BASE}/outlines/finance-blue.svg`,
    },
  },
  {
    id: 'contract',
    label: 'Contract',
    fillPath: `${BASE}/fill/contract.svg`,
    outlines: {
      white: `${BASE}/outlines/contract-white.svg`,
      blue: `${BASE}/outlines/contract-blue.svg`,
    },
  },
  {
    id: 'development',
    label: 'Development',
    fillPath: `${BASE}/fill/development.svg`,
    outlines: {
      white: `${BASE}/outlines/capacity-development-white.svg`,
      blue: `${BASE}/outlines/capacity-development-blue.svg`,
    },
  },
]

export function resolveIllustrationPath(
  id: IllustrationId,
  style: IllustrationStyle,
  outlineColor?: OutlineColor
): string {
  const asset = ILLUSTRATIONS.find((a) => a.id === id)
  if (!asset) throw new Error(`Unknown illustration: ${id}`)
  if (style === 'fill') return asset.fillPath
  if (!outlineColor) return asset.outlines.blue
  return asset.outlines[outlineColor]
}

/**
 * Generates a standardized filename for exported illustration assets.
 */
export function generateIllustrationFilename(
  id: IllustrationId,
  style: IllustrationStyle,
  outlineColor: OutlineColor | undefined,
  format: string,
  resolution?: string
): string {
  const parts = ['giga-pictogram', id]
  parts.push(style)
  if (style === 'outline' && outlineColor) {
    parts.push(outlineColor)
  }
  const resString =
    resolution && resolution !== '1x' ? `_${resolution}` : ''
  return `${parts.join('-')}${resString}.${format}`
}
