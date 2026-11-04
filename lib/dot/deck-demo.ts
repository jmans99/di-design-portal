/**
 * Deck demo (testing only; docs/design/dot-home.md, "Deck demo (testing)").
 * Dot asks a few questions one at a time, then "generates" a deck outline.
 * Nothing real is made: the deck builder is still the external tool.
 *
 * Every answer is in the home page URL, so refresh and Back work:
 * /?demo=deck&template=master-deck&audience=governments&who=head-of-state
 *   &goal=Ask%20for%20funding&offerings=all&length=standard&region=Kenya&generate=1
 *
 * Pure functions, no imports with side effects, so they can be unit tested
 * (`npm test`). The knowledge data is passed in as a small `DeckCatalog`.
 */

import { hasWord, isSkip, matchTemplate, normalize, type DeckTemplateId } from './intent.ts'

export const DEMO_VALUE = 'deck'

/** "skip" in an answer means the user skipped the question. */
export const SKIP = 'skip'

export const TEMPLATE_IDS: DeckTemplateId[] = ['from-scratch', 'master-deck', 'partnership-deck', 'government-briefing']

export type DeckLength = 'short' | 'standard' | 'long'

export const LENGTHS: { id: DeckLength; label: string; min: number; max: number }[] = [
  { id: 'short', label: 'Short, 5 to 8 slides', min: 5, max: 8 },
  { id: 'standard', label: 'Standard, 10 to 15 slides', min: 10, max: 15 },
  { id: 'long', label: 'Long, 20 or more slides', min: 20, max: 30 },
]

export const GOALS = ['Introduce Digital Inclusion', 'Ask for funding', 'Propose a partnership', 'Report on progress']

const MAX_GOAL = 60
const MAX_REGION = 40

/** What the demo needs to know about the knowledge data (lib/knowledge.ts), so this file stays testable. */
export type DeckCatalog = {
  audienceGroupIds: string[]
  /** Specific audiences, with the group each one belongs to. */
  audiences: { id: string; groupId: string }[]
  offeringIds: string[]
}

export type DeckDemoState = {
  template?: DeckTemplateId
  /** Audience group id, or SKIP. */
  audience?: string
  /** Specific audience id, or SKIP. Only asked when the group has audiences. */
  who?: string
  /** One of GOALS, the user's own short text, or SKIP. */
  goal?: string
  /** Offering ids, or 'all'. Master deck always has all. */
  offerings?: 'all' | string[]
  length?: DeckLength
  /** Country or region as typed, or SKIP. */
  region?: string
  /** "Generate deck" was pressed. */
  generated?: boolean
}

/** The questions, in the order they are asked. */
export const ANSWER_KEYS = ['template', 'audience', 'who', 'goal', 'offerings', 'length', 'region'] as const
export type AnswerKey = (typeof ANSWER_KEYS)[number]
export type DeckStep = AnswerKey | 'review' | 'result'

/** True when the audience group has specific audiences to pick from. */
export const groupHasAudiences = (catalog: DeckCatalog, groupId: string | undefined) =>
  !!groupId && groupId !== SKIP && catalog.audiences.some((a) => a.groupId === groupId)

/** Whether a question is asked for these answers (Who needs a group with audiences; Master deck skips Offerings). */
function isAsked(key: AnswerKey, state: DeckDemoState, catalog: DeckCatalog): boolean {
  if (key === 'who') return groupHasAudiences(catalog, state.audience)
  if (key === 'offerings') return state.template !== 'master-deck'
  return true
}

const clean = (value: string | null, max: number) => {
  const text = (value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  return text.slice(0, max).trim() || undefined
}

/**
 * Keeps answers in order: a missing or unknown answer clears every later one,
 * and Master deck always has all offerings. The step to show comes from this.
 */
export function normalizeDeckDemo(raw: DeckDemoState, catalog: DeckCatalog): DeckDemoState {
  const out: DeckDemoState = {}
  if (!raw.template) return out
  out.template = raw.template
  if (!raw.audience) return out
  out.audience = raw.audience
  if (groupHasAudiences(catalog, out.audience)) {
    if (!raw.who) return out
    out.who = raw.who
  }
  if (!raw.goal) return out
  out.goal = raw.goal
  if (out.template === 'master-deck') out.offerings = 'all'
  else {
    if (!raw.offerings) return out
    out.offerings = raw.offerings
  }
  if (!raw.length) return out
  out.length = raw.length
  if (!raw.region) return out
  out.region = raw.region
  if (raw.generated) out.generated = true
  return out
}

/** URL → demo state; null when the URL is not the deck demo. */
export function parseDeckDemo(params: URLSearchParams, catalog: DeckCatalog): DeckDemoState | null {
  if (params.get('demo') !== DEMO_VALUE) return null
  const template = TEMPLATE_IDS.find((id) => id === params.get('template'))
  const audienceParam = params.get('audience')
  const audience = audienceParam === SKIP || (audienceParam && catalog.audienceGroupIds.includes(audienceParam)) ? audienceParam : undefined
  const whoParam = params.get('who')
  const who =
    whoParam === SKIP || (whoParam && catalog.audiences.some((a) => a.id === whoParam && a.groupId === audience)) ? whoParam : undefined
  const offeringsParam = params.get('offerings')
  let offerings: DeckDemoState['offerings']
  if (offeringsParam === 'all') offerings = 'all'
  else if (offeringsParam) {
    const ids = catalog.offeringIds.filter((id) => offeringsParam.split(',').includes(id))
    offerings = ids.length ? ids : undefined
  }
  const goal = clean(params.get('goal'), MAX_GOAL)
  const length = LENGTHS.find((l) => l.id === params.get('length'))?.id
  const region = clean(params.get('region'), MAX_REGION)
  return normalizeDeckDemo(
    { template, audience, who: who ?? undefined, goal, offerings, length, region, generated: params.get('generate') === '1' },
    catalog,
  )
}

/** Demo state → home page URL. */
export function deckDemoHref(state: DeckDemoState): string {
  const params = new URLSearchParams({ demo: DEMO_VALUE })
  if (state.template) params.set('template', state.template)
  if (state.audience) params.set('audience', state.audience)
  if (state.who) params.set('who', state.who)
  if (state.goal) params.set('goal', state.goal)
  // Master deck always has all 18, so it is not written.
  if (state.offerings && state.template !== 'master-deck') params.set('offerings', state.offerings === 'all' ? 'all' : state.offerings.join(','))
  if (state.length) params.set('length', state.length)
  if (state.region) params.set('region', state.region)
  if (state.generated) params.set('generate', '1')
  return `/?${params.toString()}`
}

/** The step to show for these answers. */
export function currentStep(state: DeckDemoState, catalog: DeckCatalog): DeckStep {
  for (const key of ANSWER_KEYS) {
    if (isAsked(key, state, catalog) && !state[key]) return key
  }
  return state.generated ? 'result' : 'review'
}

/** The questions that apply to these answers, in order. */
export const askedKeys = (state: DeckDemoState, catalog: DeckCatalog) => ANSWER_KEYS.filter((key) => isAsked(key, state, catalog))

/** "Change" on the review card: goes back to a question and clears it and every later answer. */
export function clearFrom(state: DeckDemoState, key: AnswerKey): DeckDemoState {
  const out: DeckDemoState = { ...state }
  delete out.generated
  for (const k of ANSWER_KEYS.slice(ANSWER_KEYS.indexOf(key))) delete out[k]
  return out
}

/** The number of offerings in the answer ('all' = every offering). */
export const offeringCount = (offerings: 'all' | string[] | undefined, total: number) => (offerings === 'all' || !offerings ? total : offerings.length)

/** Offering ids for the answer, in the given (category) order. */
export const selectedOfferingIds = (offerings: 'all' | string[] | undefined, allIds: string[]) =>
  offerings === 'all' || !offerings ? allIds : allIds.filter((id) => offerings.includes(id))

/** What the user picks in the offerings step → what the URL stores: none or all picked means 'all'. */
export const offeringsAnswer = (picked: string[], allIds: string[]): 'all' | string[] =>
  picked.length === 0 || picked.length >= allIds.length ? 'all' : allIds.filter((id) => picked.includes(id))

// ---- Typed replies ----------------------------------------------------------

/** The option whose label the text contains, or that contains the text (lowercase; at least 3 letters). */
export function matchLabel<T extends { label: string }>(text: string, options: T[]): T | null {
  const t = normalize(text)
  if (t.length < 3) return null
  return options.find((o) => normalize(o.label).includes(t) || t.includes(normalize(o.label))) ?? null
}

/** A deck template by keyword ("master", "scratch", "funders"…) or by name. */
export function matchTemplateReply(text: string, templates: { id: DeckTemplateId; name: string }[]): DeckTemplateId | null {
  return matchTemplate(text) ?? matchLabel(text, templates.map((t) => ({ id: t.id, label: t.name })))?.id ?? null
}

/** A word from each goal chip, so "funding please" or "a partner deal" still find their chip. */
const GOAL_STEMS: [string, string][] = [
  ['introduce', GOALS[0]],
  ['fund', GOALS[1]],
  ['partner', GOALS[2]],
  ['progress', GOALS[3]],
]

/** One of the goal chips (by its label, or a word from it), or null. */
export function matchGoalChip(text: string): string | null {
  const byLabel = matchLabel(text, GOALS.map((label) => ({ label })))?.label
  if (byLabel) return byLabel
  const t = normalize(text)
  return GOAL_STEMS.find(([stem]) => t.includes(stem))?.[1] ?? null
}

/** The goal a typed reply stands for: skip, a chip, or the text itself (short). */
export function goalFromReply(text: string): string | undefined {
  if (isSkip(text)) return SKIP
  return matchGoalChip(text) ?? clean(text, MAX_GOAL)
}

/** The country or region a typed reply stands for: skip, or the text itself (short). */
export function regionFromReply(text: string): string | undefined {
  return isSkip(text) ? SKIP : clean(text, MAX_REGION)
}

const LENGTH_WORDS: Record<DeckLength, string[]> = {
  short: ['short', 'quick', 'brief', 'small'],
  standard: ['standard', 'medium', 'normal', 'regular', 'default'],
  long: ['long', 'big', 'full', 'detailed', 'large'],
}

/** A length from a typed reply: a chip label, a word ("short") or a number of slides. Null when nothing matches. */
export function matchLength(text: string): DeckLength | null {
  const t = normalize(text)
  const chip = matchLabel(text, LENGTHS)
  if (chip) return chip.id
  const word = (Object.keys(LENGTH_WORDS) as DeckLength[]).find((id) => LENGTH_WORDS[id].some((w) => hasWord(t, w)))
  if (word) return word
  const slides = t.match(/\d+/)
  if (slides) {
    const n = Number(slides[0])
    return n <= 9 ? 'short' : n <= 17 ? 'standard' : 'long'
  }
  return null
}

/** Offering ids named in a typed reply (by name or short name, in category order). */
export function matchOfferingIds(text: string, offerings: { id: string; name: string; shortName: string | null }[]): string[] {
  const t = normalize(text)
  return offerings
    .filter((o) => [o.name, o.shortName].some((n) => n && t.includes(normalize(n))))
    .map((o) => o.id)
}

/** "yes", "go", "ready", "generate deck"… on the review step. */
export function isGenerateReply(text: string): boolean {
  const t = normalize(text)
  return ['generate', 'go', 'yes', 'ready', 'ok', 'okay', 'continue', 'done'].some((w) => hasWord(t, w))
}

/** "continue", "done", "next"… on the offerings step: keep what is picked. */
export function isContinueReply(text: string): boolean {
  const t = normalize(text)
  return isSkip(text) || ['continue', 'done', 'next', 'ok', 'okay', 'yes'].some((w) => hasWord(t, w))
}

/** "all", "everything"… on the offerings step. */
export function isAllReply(text: string): boolean {
  const t = normalize(text)
  return ['all', 'everything', 'select all'].some((w) => hasWord(t, w))
}

// ---- Outline ("generating" without AI) -------------------------------------

export type Slide = { title: string; lines: string[] }

export type OutlineInput = {
  /** A goal chip or the user's text; undefined when skipped. */
  goal?: string
  /** The specific audience, or the group, by name; undefined when skipped. */
  audienceName?: string
  region?: string
  /** Names of the audience's needs (up to 3 are used); empty when no audience was picked. */
  needNames: string[]
  /** Only the categories with selected offerings, in order. */
  categories: { name: string; offerings: { name: string; shortName: string | null; description: string | null }[] }[]
  length: DeckLength
}

/** What the goal asks of the deck. Funding and partnership goals get "How we work together" and "The ask". */
export function goalKind(goal: string | undefined): 'funding' | 'partnership' | 'other' {
  const t = normalize(goal ?? '')
  if (t.includes('fund')) return 'funding'
  if (t.includes('partner')) return 'partnership'
  return 'other'
}

const GENERIC_WHY = 'Too many schools and communities are still offline. Digital inclusion is how we change that.'

/** An offering's description, cut to fit a small card. */
const shortDescription = (text: string | null, fallback: string) => {
  const t = (text ?? '').trim()
  if (!t) return fallback
  return t.length > 90 ? `${t.slice(0, 87).trim()}…` : t
}

/** Joins names for a merged slide title: "Modelling and finance", "Modelling, finance and procurement". */
const joinNames = (names: string[]) => {
  const lower = names.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1)))
  return lower.length <= 1 ? (lower[0] ?? '') : `${lower.slice(0, -1).join(', ')} and ${lower[lower.length - 1]}`
}

/**
 * The slide outline for the answers, from fixed rules (no AI): Title, Why it
 * matters, one slide per offering category, How we work together (funding or
 * partnership goals), The ask or Next steps, Contact. Trimmed (categories
 * merge) or padded (offering slides, then generic ones) to the length range as
 * well as it can.
 */
export function buildOutline(input: OutlineInput): Slide[] {
  const range = LENGTHS.find((l) => l.id === input.length) ?? LENGTHS[1]
  const kind = goalKind(input.goal)
  const together = kind !== 'other'

  const title: Slide = { title: 'Digital Inclusion', lines: [input.goal, input.audienceName, input.region].filter((l): l is string => !!l) }
  const why: Slide = {
    title: 'Why it matters',
    lines: input.needNames.length ? input.needNames.slice(0, 3) : [GENERIC_WHY],
  }
  const how: Slide[] = together
    ? [{ title: 'How we work together', lines: ['We plan with you', 'We support delivery', 'We share what we learn'] }]
    : []
  const ask: Slide =
    kind === 'other'
      ? { title: 'Next steps', lines: ['Agree the priorities', 'Plan the first steps', 'Set a date to meet again'] }
      : { title: 'The ask', lines: [kind === 'funding' ? 'The funding we need' : 'The partnership we propose', 'What it will unlock', 'What happens next'] }
  const contact: Slide = { title: 'Contact', lines: ['Your name and role', 'Email and phone'] }

  const fixed = 3 + how.length + 1 // Title, Why, Ask, Contact (+ How)
  let cats: Slide[] = input.categories.map((c) => ({ title: c.name, lines: c.offerings.map((o) => o.shortName ?? o.name) }))
  const extras: Record<'agenda' | 'messages' | 'where' | 'questions' | 'appendix', Slide[]> = {
    agenda: [],
    messages: [],
    where: [],
    questions: [],
    appendix: [],
  }

  if (fixed + cats.length > range.max) {
    // Too long: merge neighbouring categories into fewer slides.
    const slots = Math.max(1, range.max - fixed)
    const merged: Slide[] = []
    let from = 0
    for (let i = 0; i < slots; i++) {
      const size = Math.ceil((cats.length - from) / (slots - i))
      const chunk = cats.slice(from, from + size)
      from += size
      merged.push({ title: joinNames(chunk.map((c) => c.title)), lines: chunk.flatMap((c) => c.lines) })
    }
    cats = merged
  } else if (fixed + cats.length < range.min) {
    // Too short: first one slide per offering (after its category), then generic slides.
    let missing = range.min - fixed - cats.length
    const withDetails: Slide[] = []
    input.categories.forEach((c, i) => {
      withDetails.push(cats[i])
      for (const o of c.offerings) {
        if (missing <= 0) break
        withDetails.push({ title: o.name, lines: [shortDescription(o.description, c.name)] })
        missing--
      }
    })
    cats = withDetails
    const fillers: [keyof typeof extras, Slide][] = [
      ['agenda', { title: 'Agenda', lines: ['Why it matters', 'What we offer', 'Next steps'] }],
      ['messages', { title: 'Key messages', lines: ['One clear message', 'Three supporting points'] }],
      ['where', { title: 'Where we are today', lines: ['What is in place', 'What is still needed'] }],
      ['questions', { title: 'Questions and discussion', lines: ['Time to talk it through'] }],
      ['appendix', { title: 'Appendix', lines: ['Sources and notes'] }],
    ]
    for (const [key, slide] of fillers) {
      if (missing <= 0) break
      extras[key].push(slide)
      missing--
    }
  }

  return [title, ...extras.agenda, why, ...extras.messages, ...cats, ...extras.where, ...how, ask, ...extras.questions, ...extras.appendix, contact]
}
