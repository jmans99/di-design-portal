import type {
  LogoAsset,
  ColorVariant,
  LogoOrientation,
  LogoCombination,
  GigaColorVariant,
} from './types'

/** All four color variants (Giga main logo + product logos) */
export const COLOR_VARIANTS: ColorVariant[] = [
  { name: 'Bicolor', hex: '#277AFF', secondaryHex: '#393939', description: 'Blue graphic + dark text' },
  { name: 'Giga Blue', hex: '#277AFF', description: 'Monochrome blue' },
  { name: 'Black', hex: '#000000', description: 'Monochrome black' },
  { name: 'White', hex: '#FFFFFF', description: 'Monochrome white' },
]

/** Monochrome-only variants (event logos -- no bicolor source) */
export const MONOCHROME_VARIANTS: ColorVariant[] = [
  { name: 'Giga Blue', hex: '#277AFF', description: 'Monochrome blue' },
  { name: 'Black', hex: '#000000', description: 'Monochrome black' },
  { name: 'White', hex: '#FFFFFF', description: 'Monochrome white' },
]

/** Giga main logo color variant definitions */
export const GIGA_COLOR_VARIANTS: {
  value: GigaColorVariant
  label: string
  description: string
}[] = [
  {
    value: 'bicolore',
    label: 'Bicolor',
    description: 'Blue graphic + dark text',
  },
  {
    value: 'blue',
    label: 'Giga Blue',
    description: 'Monochrome blue',
  },
  {
    value: 'black',
    label: 'Black',
    description: 'Monochrome black',
  },
  {
    value: 'white',
    label: 'White',
    description: 'Monochrome white',
  },
]

/** Resolves the SVG path for Giga main logo given orientation + combination */
export function resolveGigaLogoPath(
  orientation: LogoOrientation,
  combination: LogoCombination
): string {
  if (combination === 'unicef-itu') {
    return orientation === 'horizontal'
      ? '/logos/giga-unicef-itu-horizontal.svg'
      : '/logos/giga-unicef-itu-vertical.svg'
  }
  return orientation === 'horizontal'
    ? '/logos/giga-main-horizontal.svg'
    : '/logos/giga-main-vertical.svg'
}

/** All brand assets */
export const BRAND_ASSETS: LogoAsset[] = [
  {
    brandName: 'Giga',
    assetType: 'logo',
    isGigaMainLogo: true,
    allowedColorVariants: COLOR_VARIANTS,
  },
  {
    brandName: 'GigaSync',
    assetType: 'product',
    svgPath: '/logos/product-gigasync.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaScore',
    assetType: 'product',
    svgPath: '/logos/product-gigascore.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaBlocks',
    assetType: 'product',
    svgPath: '/logos/product-gigablocks.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaValidate',
    assetType: 'product',
    svgPath: '/logos/product-gigavalidate.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMaps',
    assetType: 'product',
    svgPath: '/logos/product-gigamaps.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMaps API',
    assetType: 'product',
    svgPath: '/logos/product-gigamapsapi.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMeter',
    assetType: 'product',
    svgPath: '/logos/product-gigameter.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GEP',
    assetType: 'event',
    svgPath: '/logos/event-gep.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'Giga Connectivity Forum',
    assetType: 'event',
    svgPath: '/logos/event-connectivity-forum.svg',
    allowedColorVariants: COLOR_VARIANTS,
  },
]
