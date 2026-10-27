/**
 * A brief: what someone is creating and for whom. Set on the DI home screen
 * and carried to the tool in the URL query (e.g.
 * /materials/maps?output=map&audienceGroup=governments). Tools ignore it for
 * now; it is the hand-off point for the deck builder later.
 */

export type OutputType = 'map' | 'social-post' | 'engagement-map' | 'email-signature' | 'background' | 'deck' | 'two-pager'

export type Brief = {
  outputType: OutputType
  /** Audience group id from data/knowledge/audience-groups.json; undefined = anyone. */
  audienceGroupId?: string
  /** Audience id from data/knowledge/audiences.json. */
  audienceId?: string
}

export type OutputOption = {
  type: OutputType
  label: string
  /** Tool route; null while the output is not available yet. */
  href: string | null
}

export const OUTPUT_OPTIONS: OutputOption[] = [
  { type: 'map', label: 'Map', href: '/materials/maps' },
  { type: 'social-post', label: 'Social post', href: '/materials/social-media' },
  { type: 'engagement-map', label: 'Engagement map', href: '/materials/engagement-map' },
  { type: 'email-signature', label: 'Email signature', href: '/materials/email-signature' },
  { type: 'background', label: 'Background', href: '/materials/backgrounds' },
  { type: 'deck', label: 'Deck', href: null },
  { type: 'two-pager', label: 'Two-pager', href: null },
]

const QUERY_KEYS = { outputType: 'output', audienceGroupId: 'audienceGroup', audienceId: 'audience' } as const

/** Brief → URL query string (without "?"). Empty fields are left out. */
export function briefToQuery(brief: Brief): string {
  const params = new URLSearchParams()
  params.set(QUERY_KEYS.outputType, brief.outputType)
  if (brief.audienceGroupId) params.set(QUERY_KEYS.audienceGroupId, brief.audienceGroupId)
  if (brief.audienceId) params.set(QUERY_KEYS.audienceId, brief.audienceId)
  return params.toString()
}

/** URL query → brief. Returns null when there is no valid output type. */
export function briefFromQuery(query: URLSearchParams | string): Brief | null {
  const params = typeof query === 'string' ? new URLSearchParams(query) : query
  const outputType = params.get(QUERY_KEYS.outputType)
  if (!OUTPUT_OPTIONS.some((option) => option.type === outputType)) return null
  return {
    outputType: outputType as OutputType,
    audienceGroupId: params.get(QUERY_KEYS.audienceGroupId) ?? undefined,
    audienceId: params.get(QUERY_KEYS.audienceId) ?? undefined,
  }
}

/** The tool URL for a brief, with the brief in the query; null when the output is not available yet. */
export function briefHref(brief: Brief): string | null {
  const option = OUTPUT_OPTIONS.find((o) => o.type === brief.outputType)
  return option?.href ? `${option.href}?${briefToQuery(brief)}` : null
}
