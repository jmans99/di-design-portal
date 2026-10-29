/**
 * Words people type, mapped to asset facets (docs/design/brand-and-search.md).
 * Add a line to extend search; multi-word phrases are matched before single
 * words, so "unicef blue" is a colour and "unicef di" is a brand.
 */

export type Facet = 'brand' | 'type' | 'colour' | 'layout' | 'format'

export type Synonym = { phrase: string; facet: Facet; value: string | string[] }

const group = (facet: Facet, value: string | string[], phrases: string[]): Synonym[] =>
  phrases.map((phrase) => ({ phrase, facet, value }))

export const SYNONYMS: Synonym[] = [
  ...group('brand', 'di', ['di', 'digital inclusion', 'unicef di', 'unicef digital inclusion']),
  ...group('brand', 'giga', ['giga']),
  ...group('colour', 'black', ['black', 'dark', 'mono', 'monochrome']),
  ...group('colour', 'white', ['white', 'reversed', 'negative', 'knockout', 'light']),
  ...group('colour', 'blue', ['blue', 'cyan', 'unicef blue']),
  ...group('colour', 'full-colour', ['colour', 'color', 'full colour', 'full color', 'coloured']),
  ...group('type', 'logo', ['logo', 'logos', 'logotype', 'wordmark', 'lockup', 'mark']),
  ...group('type', 'illustration', ['illustration', 'illustrations', 'drawing', 'artwork']),
  ...group('type', 'photo', ['photo', 'photos', 'picture', 'image', 'images', 'photograph']),
  ...group('type', 'icon', ['icon', 'icons', 'pictogram']),
  ...group('type', 'background', ['background', 'backgrounds', 'wallpaper']),
  ...group('type', 'font', ['font', 'fonts', 'typeface', 'typography']),
  ...group('type', 'palette', ['palette', 'colours', 'colors', 'hex']),
  ...group('layout', 'horizontal', ['horizontal', 'landscape', 'wide']),
  ...group('layout', 'vertical', ['vertical', 'portrait', 'stacked']),
  ...group('format', 'svg', ['svg']),
  ...group('format', 'png', ['png']),
  ...group('format', 'pdf', ['pdf']),
  ...group('format', 'jpg', ['jpg', 'jpeg']),
  ...group('format', ['svg', 'pdf'], ['vector']),
]

/** Words that carry no meaning for search. Dot reads the verbs for intent before they are dropped. */
export const FILLER_WORDS = new Set([
  'i', 'want', 'need', 'the', 'a', 'an', 'of', 'in', 'for', 'me', 'please', 'can', 'you',
  'give', 'show', 'find', 'get', 'download', 'some', 'our', 'with', 'to', 'my',
])

/** Verbs that mean "make something" (Dot's create flow). */
export const CREATE_VERBS = ['make', 'create', 'write', 'build', 'design', 'generate']

/** Words that mean "look something up" (Dot's asset search). */
export const FIND_PHRASES = ['find', 'get', 'download', 'need the', 'where is']

/** Readable chip labels for the facets Dot understood. */
export const FACET_LABELS: Record<Facet, Record<string, string>> = {
  brand: { di: 'Digital Inclusion', giga: 'Giga' },
  type: {
    logo: 'Logo', illustration: 'Illustration', photo: 'Photo', icon: 'Icon', background: 'Background',
    template: 'Template', font: 'Font', palette: 'Palette', guideline: 'Guideline',
  },
  colour: { black: 'Black', white: 'White', blue: 'Blue', navy: 'Navy', 'full-colour': 'Full colour' },
  layout: { horizontal: 'Horizontal', vertical: 'Vertical', stacked: 'Stacked', square: 'Square' },
  format: { svg: 'SVG', png: 'PNG', pdf: 'PDF', jpg: 'JPG', 'svg,pdf': 'Vector' },
}
