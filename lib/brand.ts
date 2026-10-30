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
 * A brand filter (Logos, Illustrations, Image galleries): everything, or one
 * brand plus the shared material. Colors keeps the two-brand tabs (no "All").
 */
export type BrandFilter = 'all' | Brand

export const BRAND_FILTERS: BrandFilter[] = ['all', 'di', 'giga']

export const BRAND_FILTER_LABELS: Record<BrandFilter, string> = { all: 'All', di: 'Digital Inclusion', giga: 'Giga' }

/** All = everything; Digital Inclusion = di + both; Giga = giga + both. */
export const inBrandFilter = (brand: AssetBrand, filter: BrandFilter) => filter === 'all' || inBrandTab(brand, filter)

/** Display order of material under "All": Digital Inclusion, then shared, then Giga. */
export const ASSET_BRAND_ORDER: AssetBrand[] = ['di', 'both', 'giga']

/**
 * The filter in a page URL: ?brand=all|di|giga. No parameter (or anything
 * else) means All; the old ?palette=giga still opens Giga.
 */
export function brandFilterFromParams(params: URLSearchParams): BrandFilter {
  const brand = params.get('brand')
  if (brand === 'all' || brand === 'di' || brand === 'giga') return brand
  return params.get('palette') === 'giga' ? 'giga' : 'all'
}

/**
 * The brand in a page URL: ?brand=di|giga. The old Colors link ?palette=giga
 * still opens the Giga tab. Anything else is Digital Inclusion.
 */
export function brandFromParams(params: URLSearchParams): Brand {
  const brand = params.get('brand')
  if (brand === 'giga' || brand === 'di') return brand
  return params.get('palette') === 'giga' ? 'giga' : 'di'
}

/** The same URL with ?brand= set (and the old ?palette= dropped). "all" is the default, so it drops ?brand=. */
export function withBrand(pathname: string, params: URLSearchParams, brand: BrandFilter): string {
  const next = new URLSearchParams(params.toString())
  next.delete('palette')
  if (brand === 'all') next.delete('brand')
  else next.set('brand', brand)
  const query = next.toString()
  return query ? `${pathname}?${query}` : pathname
}
