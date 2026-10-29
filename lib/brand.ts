/**
 * The two brands in the portal (docs/design/brand-and-search.md). Digital
 * Inclusion is the default everywhere; Giga is the second brand.
 */

export type Brand = 'di' | 'giga'

export const BRANDS: Brand[] = ['di', 'giga']

export const BRAND_LABELS: Record<Brand, string> = { di: 'Digital Inclusion', giga: 'Giga' }

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
