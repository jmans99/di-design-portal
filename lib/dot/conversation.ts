/**
 * Dot's conversation lives in the home page URL, so refresh and Back work:
 * /?new=deck&template=master-deck&audience=governments&q=…&knowledge=off,
 * and for an asset search /?find=…&without=colour,type.
 */

import { OUTPUT_OPTIONS, type OutputType } from '@/lib/brief'
import type { Facet } from '@/lib/search/synonyms'
import { matchIntent, type DeckTemplateId } from '@/lib/dot/intent'
import { DECK_TEMPLATES } from '@/lib/dot/templates'

/** "skip" in `audience` means the user chose no particular audience. */
export const SKIP_AUDIENCE = 'skip'

export type ConversationState = {
  /** The format being made; undefined when typed text matched nothing. */
  format?: OutputType
  /** What the user typed to start, shown as their first message. */
  q?: string
  templateId?: DeckTemplateId
  /** Audience group id, or SKIP_AUDIENCE. */
  audience?: string
  useKnowledge: boolean
}

/** URL → conversation; null when the home page should show the empty Dot box. */
export function conversationFromParams(params: URLSearchParams): ConversationState | null {
  const newParam = params.get('new')
  const q = params.get('q')?.trim() || undefined
  // A bare ?q= (e.g. Dot's box submitted before the page's script ran) is matched like typed text.
  const intent = !newParam && q ? matchIntent(q) : undefined
  if (intent?.kind === 'search') return null
  const format = intent?.kind === 'format' ? intent.outputType : OUTPUT_OPTIONS.find((o) => o.type === newParam)?.type
  if (!format && !q) return null
  const template = params.get('template') ?? (intent?.kind === 'format' ? intent.templateId : undefined)
  return {
    format,
    q,
    templateId: DECK_TEMPLATES.find((t) => t.id === template)?.id,
    audience: params.get('audience') || undefined,
    useKnowledge: params.get('knowledge') !== 'off',
  }
}

/** Conversation → home page URL. */
export function conversationHref(state: ConversationState): string {
  const params = new URLSearchParams()
  if (state.format) params.set('new', state.format)
  if (state.templateId) params.set('template', state.templateId)
  if (state.audience) params.set('audience', state.audience)
  if (state.q) params.set('q', state.q)
  if (!state.useKnowledge) params.set('knowledge', 'off')
  const query = params.toString()
  return query ? `/?${query}` : '/'
}

/** An asset search in the URL: what was typed, and the facet chips the user removed. */
export type SearchState = { query: string; without: Facet[] }

const FACETS: Facet[] = ['brand', 'type', 'colour', 'layout', 'format']

/** URL → asset search: ?find=…, or a bare ?q= that reads as a search. */
export function searchFromParams(params: URLSearchParams): SearchState | null {
  const find = params.get('find')?.trim()
  const q = params.get('q')?.trim()
  const query = find || (!params.get('new') && q && matchIntent(q).kind === 'search' ? q : '')
  if (!query) return null
  const without = (params.get('without') ?? '').split(',').filter((f): f is Facet => FACETS.includes(f as Facet))
  return { query, without }
}

export function searchHref(state: SearchState): string {
  const params = new URLSearchParams({ find: state.query })
  if (state.without.length) params.set('without', state.without.join(','))
  return `/?${params.toString()}`
}
