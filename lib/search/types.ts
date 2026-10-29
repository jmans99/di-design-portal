/** One entry of data/assets.json (built by scripts/build-asset-index.mjs). */
export type Asset = {
  id: string
  /** "Digital Inclusion logo, black, horizontal". */
  title: string
  type: 'logo' | 'illustration' | 'photo' | 'icon' | 'background' | 'template' | 'font' | 'palette' | 'guideline'
  brand: 'di' | 'giga'
  colour: 'full-colour' | 'black' | 'white' | 'blue' | 'navy' | null
  layout: 'horizontal' | 'vertical' | 'stacked' | 'square' | null
  /** One entry per downloadable file of the same asset. */
  formats: { ext: string; url: string }[]
  /** Image to show; null when there is none (fonts). */
  preview: string | null
  /** Portal page the asset lives on, with ?brand= where the page has brand tabs. */
  page: string
  /** Extra words: product, event and story names, keywords. */
  tags: string[]
}
