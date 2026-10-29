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

/** Black + white only (GigaSpatial ships without a blue lockup) */
export const BLACK_WHITE_VARIANTS: ColorVariant[] = [
  { name: 'Black', hex: '#000000', description: 'Monochrome black' },
  { name: 'White', hex: '#FFFFFF', description: 'Monochrome white' },
]

/** UNICEF logo variants */
export const UNICEF_MONOCHROME_VARIANTS: ColorVariant[] = [
  { name: 'UNICEF Blue', hex: '#1CABE2', description: 'UNICEF signature blue' },
  { name: 'Black', hex: '#000000', description: 'Monochrome black' },
  { name: 'White', hex: '#FFFFFF', description: 'Monochrome white' },
]

/** UNICEF signature blue — swatches for Digital Impact bicolor variants */
const UNICEF_BLUE_HEX = '#1CABE2'

/** UNICEF Digital Impact (Vision) — separate SVG per variant; no recolor */
export const UNICEF_DIGITAL_IMPACT_VARIANTS: ColorVariant[] = [
  {
    name: 'Bicolor Positive',
    hex: UNICEF_BLUE_HEX,
    secondaryHex: '#000000',
  },
  {
    name: 'Bicolor Negative',
    hex: UNICEF_BLUE_HEX,
    secondaryHex: '#FFFFFF',
  },
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
    brand: 'giga',
    assetType: 'logo',
    isGigaMainLogo: true,
    allowedColorVariants: COLOR_VARIANTS,
  },
  {
    brandName: 'UNICEF',
    brand: 'di',
    assetType: 'logo',
    svgPath: '/logos/unicef.svg',
    allowedColorVariants: UNICEF_MONOCHROME_VARIANTS,
  },
  {
    brandName: 'UNICEF Digital Impact',
    brand: 'di',
    assetType: 'logo',
    // Top-level fields mirror the default version (boxed) so code unaware of
    // `versions` keeps working with the existing 2-color boxed lockup.
    svgPath: '/logos/unicef-digital-impact-division-black.svg',
    svgPathByColorName: {
      'Bicolor Positive': '/logos/unicef-digital-impact-division-black.svg',
      'Bicolor Negative': '/logos/unicef-digital-impact-division-white.svg',
    },
    allowedColorVariants: UNICEF_DIGITAL_IMPACT_VARIANTS,
    versions: [
      {
        id: 'boxed',
        label: 'Boxed',
        svgPath: '/logos/unicef-digital-impact-division-black.svg',
        svgPathByColorName: {
          'Bicolor Positive': '/logos/unicef-digital-impact-division-black.svg',
          'Bicolor Negative': '/logos/unicef-digital-impact-division-white.svg',
        },
        allowedColorVariants: UNICEF_DIGITAL_IMPACT_VARIANTS,
      },
      {
        id: 'unboxed',
        label: 'Unboxed',
        svgPath: '/logos/unicef-digital-impact-unboxed.svg',
        allowedColorVariants: UNICEF_MONOCHROME_VARIANTS,
      },
    ],
  },
  {
    brandName: 'UNICEF Digital Inclusion',
    brand: 'di',
    assetType: 'logo',
    svgPath: '/logos/unicef-digital-inclusion-blue.svg',
    svgPathByColorName: {
      'UNICEF Blue': '/logos/unicef-digital-inclusion-blue.svg',
      Black: '/logos/unicef-digital-inclusion-black.svg',
      White: '/logos/unicef-digital-inclusion-white.svg',
    },
    allowedColorVariants: UNICEF_MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaSync',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigasync.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaScore',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigascore.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaBlocks',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigablocks.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaValidate',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigavalidate.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMaps',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigamaps.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMaps API',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigamapsapi.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaMeter',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigameter.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'GigaSpatial',
    brand: 'giga',
    assetType: 'product',
    svgPath: '/logos/product-gigaspatial.svg',
    allowedColorVariants: BLACK_WHITE_VARIANTS,
  },
  {
    brandName: 'GEP',
    brand: 'giga',
    assetType: 'event',
    svgPath: '/logos/event-gep.svg',
    allowedColorVariants: MONOCHROME_VARIANTS,
  },
  {
    brandName: 'Giga Connectivity Forum',
    brand: 'giga',
    assetType: 'event',
    svgPath: '/logos/event-connectivity-forum.svg',
    allowedColorVariants: COLOR_VARIANTS,
  },
]

/** Logos listed under one brand tab (shared "both" logos under both). Digital Inclusion's own logo comes first on the DI tab. */
export function logosForBrand(brand: 'di' | 'giga'): LogoAsset[] {
  const logos = BRAND_ASSETS.filter((asset) => asset.brand === brand || asset.brand === 'both')
  return brand === 'di'
    ? [...logos.filter((l) => l.brandName === 'UNICEF Digital Inclusion'), ...logos.filter((l) => l.brandName !== 'UNICEF Digital Inclusion')]
    : logos
}
