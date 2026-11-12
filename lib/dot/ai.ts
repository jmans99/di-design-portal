/**
 * Dot's AI reply (docs/design/dot-ai.md): what the browser sends to
 * /api/dot and what comes back. Pure functions and no imports with side
 * effects, so they can be unit tested (`npm test`) and used on both sides.
 */

import type { OutputType } from '../brief'

/** One turn of the chat sent to the model. */
export type DotChatMessage = { role: 'user' | 'assistant'; content: string }

/** A portal page Dot can point to in an answer. */
export type DotLink = { label: string; href: string }

/** What Dot decided: start a format, search the assets, or answer in words. */
export type DotAiResult =
  | { action: 'create'; format: OutputType }
  | { action: 'search'; query: string }
  | { action: 'answer'; reply: string; links: DotLink[] }

/** Limits on what the browser may send: they cap the cost of one request. */
export const MAX_MESSAGES = 12
export const MAX_MESSAGE_LENGTH = 600
/** Longest answer shown, in characters (the model is asked for much less). */
export const MAX_REPLY_LENGTH = 1200

export const AI_FORMATS = ['deck', 'social-post', 'two-pager', 'map', 'engagement-map', 'background', 'email-signature'] as const satisfies readonly OutputType[]

/** The pages Dot may link to, by id. The model picks ids; hrefs never come from the model. */
export const AI_PAGES = {
  logos: { label: 'Logos', href: '/logos' },
  illustrations: { label: 'Illustrations', href: '/illustrations' },
  'image-galleries': { label: 'Image galleries', href: '/media' },
  'photo-awards': { label: 'Photo awards', href: '/media/photo-awards' },
  colors: { label: 'Colors', href: '/colors' },
  typography: { label: 'Typography', href: '/typography' },
  'brand-guidelines': { label: 'DI guidelines', href: '/guidelines/brand' },
  'video-guidelines': { label: 'Video guidelines', href: '/guidelines/video' },
  'ai-skills': { label: 'AI skills', href: '/materials/skills' },
} as const satisfies Record<string, DotLink>

export type AiPageId = keyof typeof AI_PAGES
export const AI_PAGE_IDS = Object.keys(AI_PAGES) as AiPageId[]

/** The chat as sent by the browser, checked and trimmed; null when it is not a usable chat. */
export function parseMessages(input: unknown): DotChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null
  const messages: DotChatMessage[] = []
  for (const item of input.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== 'object') return null
    const { role, content } = item as Record<string, unknown>
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const text = content.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!text) return null
    messages.push({ role, content: text })
  }
  // The model answers the user's last message.
  return messages[messages.length - 1].role === 'user' ? messages : null
}

/**
 * The model's JSON, checked: an unknown format, an empty query or an empty
 * reply gives null, and links keep only known page ids (at most three).
 */
export function parseAiResult(input: unknown): DotAiResult | null {
  if (!input || typeof input !== 'object') return null
  const { action, format, query, reply, links } = input as Record<string, unknown>
  if (action === 'create') {
    const match = AI_FORMATS.find((f) => f === format)
    return match ? { action, format: match } : null
  }
  if (action === 'search') {
    const text = typeof query === 'string' ? query.trim().slice(0, MAX_MESSAGE_LENGTH) : ''
    return text ? { action, query: text } : null
  }
  if (action === 'answer') {
    const text = typeof reply === 'string' ? reply.trim().slice(0, MAX_REPLY_LENGTH) : ''
    if (!text) return null
    const ids = Array.isArray(links) ? [...new Set(links)].filter((id): id is AiPageId => AI_PAGE_IDS.includes(id as AiPageId)) : []
    return { action, reply: text, links: ids.slice(0, 3).map((id) => AI_PAGES[id]) }
  }
  return null
}

/** JSON schema for the model's structured output (OpenAI strict mode: every field required, unused ones null). */
export const AI_RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['action', 'format', 'query', 'reply', 'links'],
  properties: {
    action: { type: 'string', enum: ['create', 'search', 'answer'] },
    format: { type: ['string', 'null'], enum: [...AI_FORMATS, null] },
    query: { type: ['string', 'null'] },
    reply: { type: ['string', 'null'] },
    links: { type: 'array', items: { type: 'string', enum: AI_PAGE_IDS } },
  },
} as const
