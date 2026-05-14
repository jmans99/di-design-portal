/**
 * Registry for Giga illustrations.
 *
 * Two flavors live here:
 *  - "pillars": single-color pictograms with Fill + Outline (white/blue) variants.
 *  - "giga-meter": full-color illustrations specific to the Giga Meter product,
 *    delivered as a single SVG (no fill/outline split).
 *
 * The configurator picks which controls to show based on whether an asset has
 * `outlines`/`fillPath` (variants) or just a single `path`.
 */

export type IllustrationCategory = 'pillars' | 'general' | 'giga-meter'
export type IllustrationStyle = 'fill' | 'outline'
export type OutlineColor = 'white' | 'blue'

const BASE = '/illustrations'

export interface IllustrationAsset {
  id: string
  label: string
  category: IllustrationCategory
  /** Single-style asset (no fill/outline split). Used by category 'giga-meter'. */
  path?: string
  /** Pillar fill variant. */
  fillPath?: string
  /** Pillar outline variants. */
  outlines?: { white: string; blue: string }
}

/** Names of the 35 "General" illustrations. The folder layout under
 *  public/illustrations/general/ uses kebab-case slugs derived from these. */
const GENERAL_NAMES = [
  'Adjustment', 'Alert', 'Antena', 'Buildings', 'Check data 01', 'Check data 02',
  'Cloud', 'Code', 'Compass', 'Computer', 'Congratulations', 'Connection',
  'Cycle data', 'Devices', 'Globe 01', 'Globe 02', 'Hierarchy', 'Key', 'Kid',
  'Lens', 'Location 01', 'Location 02', 'Measure cycle', 'Network', 'Not mapped',
  'Notification', 'People', 'Person location', 'Satellite', 'School location',
  'Schools', 'Search', 'Sharing data', 'Team', 'Update',
] as const

function generalEntry(name: string): IllustrationAsset {
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  return {
    id: `general-${slug}`,
    label: name,
    category: 'general',
    fillPath: `${BASE}/general/fill/${slug}.svg`,
    outlines: {
      white: `${BASE}/general/outlines/${slug}-white.svg`,
      blue: `${BASE}/general/outlines/${slug}-blue.svg`,
    },
  }
}

export const ILLUSTRATIONS: IllustrationAsset[] = [
  // Pillar pictograms — Giga's 5 core themes
  {
    id: 'mapping',
    label: 'Mapping',
    category: 'pillars',
    fillPath: `${BASE}/fill/mapping.svg`,
    outlines: {
      white: `${BASE}/outlines/mapping-white.svg`,
      blue: `${BASE}/outlines/mapping-blue.svg`,
    },
  },
  {
    id: 'model',
    label: 'Model',
    category: 'pillars',
    fillPath: `${BASE}/fill/model.svg`,
    outlines: {
      white: `${BASE}/outlines/model-white.svg`,
      blue: `${BASE}/outlines/model-blue.svg`,
    },
  },
  {
    id: 'finance',
    label: 'Finance',
    category: 'pillars',
    fillPath: `${BASE}/fill/finance.svg`,
    outlines: {
      white: `${BASE}/outlines/finance-white.svg`,
      blue: `${BASE}/outlines/finance-blue.svg`,
    },
  },
  {
    id: 'contract',
    label: 'Contract',
    category: 'pillars',
    fillPath: `${BASE}/fill/contract.svg`,
    outlines: {
      white: `${BASE}/outlines/contract-white.svg`,
      blue: `${BASE}/outlines/contract-blue.svg`,
    },
  },
  {
    id: 'development',
    label: 'Development',
    category: 'pillars',
    fillPath: `${BASE}/fill/development.svg`,
    outlines: {
      white: `${BASE}/outlines/capacity-development-white.svg`,
      blue: `${BASE}/outlines/capacity-development-blue.svg`,
    },
  },

  // General set — 35 pictograms with Fill / Outline (white / blue) variants,
  // built programmatically from GENERAL_NAMES to keep the registry compact.
  ...GENERAL_NAMES.map(generalEntry),

  // Giga Meter — full-color product illustrations, single style each
  {
    id: 'gigameter-computers',
    label: 'Computers',
    category: 'giga-meter',
    path: `${BASE}/giga-meter/computers.svg`,
  },
  {
    id: 'gigameter-connection',
    label: 'Connection',
    category: 'giga-meter',
    path: `${BASE}/giga-meter/connection.svg`,
  },
  {
    id: 'gigameter-contract',
    label: 'Contract',
    category: 'giga-meter',
    path: `${BASE}/giga-meter/contract.svg`,
  },
  {
    id: 'gigameter-people',
    label: 'People',
    category: 'giga-meter',
    path: `${BASE}/giga-meter/people.svg`,
  },
]

export const ILLUSTRATION_CATEGORY_LABELS: Record<IllustrationCategory, string> = {
  pillars: 'Pillar pictograms',
  general: 'General',
  'giga-meter': 'Giga Meter',
}

/** True when the asset supports the Fill/Outline + color picker. */
export function hasStyleVariants(asset: IllustrationAsset): boolean {
  return !!asset.fillPath && !!asset.outlines
}

export function resolveIllustrationPath(
  id: string,
  style: IllustrationStyle,
  outlineColor?: OutlineColor
): string {
  const asset = ILLUSTRATIONS.find((a) => a.id === id)
  if (!asset) throw new Error(`Unknown illustration: ${id}`)
  if (!hasStyleVariants(asset)) {
    if (!asset.path) throw new Error(`Asset ${id} has no path`)
    return asset.path
  }
  if (style === 'fill') return asset.fillPath!
  if (!outlineColor) return asset.outlines!.blue
  return asset.outlines![outlineColor]
}

/**
 * Generates a standardized filename for exported illustration assets.
 *
 * Pillars  -> giga-pictogram-{id}-{style}[-{outlineColor}][_{resolution}].{format}
 * Giga Meter -> giga-meter-{id-without-prefix}[_{resolution}].{format}
 */
export function generateIllustrationFilename(
  id: string,
  style: IllustrationStyle,
  outlineColor: OutlineColor | undefined,
  format: string,
  resolution?: string
): string {
  const asset = ILLUSTRATIONS.find((a) => a.id === id)
  const resString = resolution && resolution !== '1x' ? `_${resolution}` : ''

  if (asset && !hasStyleVariants(asset)) {
    const bare = id.replace(/^gigameter-/, '')
    return `giga-meter-${bare}${resString}.${format}`
  }

  const parts = ['giga-pictogram', id, style]
  if (style === 'outline' && outlineColor) {
    parts.push(outlineColor)
  }
  return `${parts.join('-')}${resString}.${format}`
}
