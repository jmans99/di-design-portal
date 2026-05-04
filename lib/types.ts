export type LogoOrientation = 'horizontal' | 'vertical'
export type LogoCombination = 'standalone' | 'unicef-itu'

export type GigaColorVariant = 'bicolore' | 'blue' | 'black' | 'white'

export interface GigaLogoConfig {
  orientation: LogoOrientation
  combination: LogoCombination
  colorVariant: GigaColorVariant
}

export interface LogoAsset {
  brandName: string
  assetType: 'logo' | 'product' | 'event'
  /** For product logos, a single SVG path. For Giga main logo, not used (resolved by config). */
  svgPath?: string
  /**
   * When set, each ColorVariant.name maps to its own SVG file (no programmatic recolor).
   * Use for Vision-style dual-file logos (e.g. black vs white lockups).
   */
  svgPathByColorName?: Record<string, string>
  /** Whether this asset is the main Giga brand logo with full variant support. */
  isGigaMainLogo?: boolean
  allowedColorVariants: ColorVariant[]
}

export interface ColorVariant {
  name: string
  hex: string
  /** Optional second color for bicolore swatch display */
  secondaryHex?: string
  description?: string
}

export type OutputFormat = 'svg' | 'png' | 'jpeg'
export type Resolution = '1x' | '2x' | '4x'

export interface ExportConfig {
  brand: string
  color: ColorVariant
  format: OutputFormat
  resolution?: Resolution
}

export interface ColorToken {
  name: string
  hex: string
  hsl?: string
  description?: string
}

export interface ColorScale {
  name: string
  tokens: ColorToken[]
  description?: string
}
