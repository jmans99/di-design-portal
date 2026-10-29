/**
 * Keyword asset search, no AI (docs/design/brand-and-search.md). Pure
 * functions: the caller passes the assets, so unit tests run on the real
 * index and the next step can add more asset sources.
 */

import { FILLER_WORDS, SYNONYMS, type Facet } from './synonyms.ts'
import type { Asset } from './types.ts'

export type Facets = Partial<Record<Facet, string>>

export type ParsedQuery = {
  /** Every word of the query, lowercased, punctuation stripped. */
  tokens: string[]
  /** What the synonyms understood, e.g. { brand: 'di', type: 'logo', colour: 'black' }. */
  facets: Facets
  /** Words left after synonyms and filler words, matched against titles and tags. */
  words: string[]
}

export type SearchResult = { facets: Facets; results: Asset[] }

/** Lowercase, strip punctuation, split into words. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// Longest phrases first, so "unicef blue" wins over "blue" and "digital inclusion" over nothing.
const PHRASES = SYNONYMS.map((s) => ({ ...s, tokens: tokenize(s.phrase) })).sort((a, b) => b.tokens.length - a.tokens.length)

/** Reads facets from the query (multi-word synonyms first); the first value for a facet wins. */
export function parseQuery(text: string): ParsedQuery {
  const tokens = tokenize(text)
  const facets: Facets = {}
  const words: string[] = []
  for (let i = 0; i < tokens.length; ) {
    const hit = PHRASES.find((p) => p.tokens.every((t, j) => tokens[i + j] === t))
    if (hit) {
      if (!facets[hit.facet]) facets[hit.facet] = Array.isArray(hit.value) ? hit.value.join(',') : hit.value
      i += hit.tokens.length
      continue
    }
    if (!FILLER_WORDS.has(tokens[i])) words.push(tokens[i])
    i++
  }
  return { tokens, facets, words }
}

/** True when the query names anything an asset can be filtered or scored on. */
export function hasAssetFacets(facets: Facets): boolean {
  return Object.keys(facets).length > 0
}

const stem = (w: string) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w)
const sameFormat = (a: string, b: string) => a === b || (a === 'jpeg' && b === 'jpg') || (a === 'jpg' && b === 'jpeg')

/**
 * Scores one asset: colour +3, layout +2, format +1, each other word found in
 * the title or tags +1. Brand and type are filters, not scores.
 */
export function scoreAsset(asset: Asset, facets: Facets, words: string[]): number {
  let score = 0
  if (facets.colour && asset.colour === facets.colour) score += 3
  if (facets.layout && asset.layout === facets.layout) score += 2
  if (facets.format) {
    const wanted = facets.format.split(',')
    if (asset.formats.some((f) => wanted.some((w) => sameFormat(f.ext, w)))) score += 1
  }
  if (words.length) {
    const haystack = new Set([...tokenize(asset.title), ...asset.tags.flatMap(tokenize)].map(stem))
    score += words.filter((w) => haystack.has(stem(w))).length
  }
  return score
}

/**
 * Searches the assets. A named brand or type filters; everything else scores.
 * With no brand or type, only assets that score are returned. Sorted by score,
 * then Digital Inclusion before Giga (when no brand was named), then the order
 * the asset pages list them in (the index order: the Digital Inclusion logo
 * first, the main Giga logo before product and event logos), then title.
 * `without` drops facets the user removed (the chips in Dot's reply).
 */
export function searchAssets(query: string, assets: Asset[], without: Facet[] = []): SearchResult {
  const { facets: all, words } = parseQuery(query)
  const facets: Facets = Object.fromEntries(Object.entries(all).filter(([k]) => !without.includes(k as Facet)))
  const filtered = assets.filter((a) => (!facets.brand || a.brand === facets.brand) && (!facets.type || a.type === facets.type))
  const needsScore = !facets.brand && !facets.type
  const brandOrder = (a: Asset) => (facets.brand ? 0 : a.brand === 'di' ? 0 : 1)
  const results = filtered
    .map((asset, order) => ({ asset, order, score: scoreAsset(asset, facets, words) }))
    .filter(({ score }) => !needsScore || score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        brandOrder(a.asset) - brandOrder(b.asset) ||
        a.order - b.order ||
        a.asset.title.localeCompare(b.asset.title, 'en'),
    )
    .map(({ asset }) => asset)
  return { facets, results }
}
