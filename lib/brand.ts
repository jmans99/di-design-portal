/**
 * The two brands in the portal (docs/design/brand-and-search.md). Digital
 * Inclusion is the default everywhere; Giga is the second brand. Material
 * shared by both (e.g. the fonts) is tagged "both".
 */

/** A brand tab and a brand a query can name. */
export type Brand = 'di' | 'giga'

/** The brand of a piece of material: one brand, or shared by both. */
export type AssetBrand = Brand | 'both'

export const BRANDS: Brand[] = ['di', 'giga']

export const BRAND_LABELS: Record<AssetBrand, string> = { di: 'Digital Inclusion', giga: 'Giga', both: 'DI + Giga' }

/** True when material of `brand` belongs under the `tab` brand tab: its own brand, or shared ("both"). */
export const inBrandTab = (brand: AssetBrand, tab: Brand) => brand === tab || brand === 'both'

/**
 * The brand in a page URL: ?brand=di|giga. The old Colors link ?palette=giga
 * still opens the Giga tab. Anything else is Digital Inclusion.
 */
export function brandFromParams(params: URLSearchParams): Brand {
  const brand = params.get('brand')
  if (brand === 'giga' || brand === 'di') return brand
  return params.get('palette') === 'giga' ? 'giga' : 'di'
}

/** The same URL with ?brand= set (and the old ?palette= dropped). */
export function withBrand(pathname: string, params: URLSearchParams, brand: Brand): string {
  const next = new URLSearchParams(params.toString())
  next.delete('palette')
  next.set('brand', brand)
  return `${pathname}?${next.toString()}`
}
