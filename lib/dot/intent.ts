/**
 * Dot's keyword matcher. No AI: typed text is lowercased and matched against
 * fixed keyword lists. Pure functions, no imports with side effects, so they
 * can be unit tested (`npm test`) and the next step can add asset search here.
 */

import type { OutputType } from '../brief'

export type DeckTemplateId = 'from-scratch' | 'master-deck' | 'partnership-deck' | 'government-briefing'

export type Intent =
  | { kind: 'format'; outputType: OutputType; templateId?: DeckTemplateId }
  | { kind: 'none' }

/** Lowercase, trim and collapse whitespace. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** True when `word` appears in `text` as a whole word (or phrase). */
export function hasWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s-]')
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text)
}

/**
 * Keywords per format, checked in this order; the first format with a match
 * wins. Engagement map comes before Map, so "engagement map" is not a Map.
 */
export const FORMAT_KEYWORDS: { outputType: OutputType; words: string[] }[] = [
  { outputType: 'engagement-map', words: ['engagement'] },
  { outputType: 'email-signature', words: ['email signature', 'signature'] },
  { outputType: 'deck', words: ['deck', 'decks', 'slides', 'slide', 'presentation'] },
  { outputType: 'two-pager', words: ['two-pager', 'two pager', '2-pager', '2 pager', 'one-pager', 'one pager', 'brief'] },
  { outputType: 'social-post', words: ['social', 'post', 'instagram', 'linkedin'] },
  { outputType: 'background', words: ['background', 'backgrounds', 'zoom', 'teams'] },
  { outputType: 'map', words: ['map', 'maps'] },
]

/** The format the text asks for, or null. */
export function matchFormat(text: string): OutputType | null {
  const t = normalize(text)
  return FORMAT_KEYWORDS.find(({ words }) => words.some((w) => hasWord(t, w)))?.outputType ?? null
}

export const TEMPLATE_KEYWORDS: { id: DeckTemplateId; words: string[] }[] = [
  { id: 'master-deck', words: ['master'] },
  { id: 'from-scratch', words: ['scratch', 'blank', 'empty'] },
  { id: 'partnership-deck', words: ['partnership', 'partner', 'partners', 'funder', 'funders'] },
  { id: 'government-briefing', words: ['government', 'briefing', 'ministry', 'ministries'] },
]

/** The deck template the text names, or null. */
export function matchTemplate(text: string): DeckTemplateId | null {
  const t = normalize(text)
  return TEMPLATE_KEYWORDS.find(({ words }) => words.some((w) => hasWord(t, w)))?.id ?? null
}

/** Format, plus Master deck when "master" appears with Deck. */
export function matchIntent(text: string): Intent {
  const outputType = matchFormat(text)
  if (!outputType) return { kind: 'none' }
  if (outputType === 'deck' && hasWord(normalize(text), 'master')) {
    return { kind: 'format', outputType, templateId: 'master-deck' }
  }
  return { kind: 'format', outputType }
}

const SKIP_WORDS = ['skip', 'anyone', 'no one', 'nobody', 'everyone', 'not sure']

/** True when the reply means "no particular audience". */
export function isSkip(text: string): boolean {
  const t = normalize(text)
  return SKIP_WORDS.some((w) => hasWord(t, w))
}

/**
 * The audience group the text names: the full group name, or its first word
 * without a plural "s" ("government" matches "Governments"). First match wins.
 */
export function matchAudienceGroup<T extends { id: string; name: string }>(text: string, groups: T[]): T | null {
  const t = normalize(text)
  const full = groups.find((g) => t.includes(normalize(g.name)))
  if (full) return full
  return (
    groups.find((g) => {
      const first = normalize(g.name).split(' ')[0]
      const stem = first.length > 4 && first.endsWith('s') ? first.slice(0, -1) : first
      return stem.length >= 4 && (hasWord(t, stem) || hasWord(t, first))
    }) ?? null
  )
}
