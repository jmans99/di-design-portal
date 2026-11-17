/**
 * Country pitch demo (testing only; docs/design/dot-home.md, "Country pitch
 * demo (testing)"). The Country Engagement story: a country engagement lead
 * sees what DI knows about a country, builds an accurate pitch, then commits
 * what she learned. Nothing real is made and nothing is saved.
 *
 * Every answer is in the home page URL, so refresh and Back work:
 * /?demo=country-pitch&country=KE&audience=ministry-of-education&confirmed=1
 *   &pitch=1&goal=Propose%20a%20partnership&offerings=mapping,dashboards
 *   &length=standard&generate=1&commit=case-study
 * Recording options ride along: &autoplay=1&speed=1.5&clean=1.
 *
 * Pure functions, no imports with side effects, so they can be unit tested
 * (`npm test`). The demo data (data/demo/country-pitch.json) and the knowledge
 * data are passed in.
 */

import { hasWord, normalize } from './intent.ts'
import { GOALS, LENGTHS, SKIP, goalKind, type DeckLength } from './deck-demo.ts'

export const DEMO_VALUE = 'country-pitch'
export { GOALS, LENGTHS, SKIP }
export const DEFAULT_GOAL = 'Propose a partnership'

const MAX_TEXT = 160
const MAX_CASE_TITLE = 100

// ---- Demo data (data/demo/country-pitch.json) -------------------------------

export type Source = { title: string; type: string; committedBy: string; validatedBy: string; date: string }
/** A fact: one figure or statement, its exact wording (excerpt) and where it comes from. */
export type Fact = { id: string; label: string; value: string; excerpt: string; illustrative: boolean; source: Source }
export type OfferingStatus = 'available' | 'pilot' | 'not-yet'
export type PitchRecord = Omit<Fact, 'label' | 'value'> & { kind: 'case-study' | 'engagement'; title: string; team: string; date: string }
export type Gap = { id: string; label: string; detail: string; slideNote: string; owner: string }

export type CountryPitchData = {
  illustrative: boolean
  country: { name: string; iso: string; aliases: string[] }
  audienceId: string
  opening: string
  pitchTitle: string
  connectivity: Fact[]
  offeringStatusSource: Fact
  offerings: Record<string, { status: OfferingStatus; note: string }>
  records: PitchRecord[]
  gaps: Gap[]
  caseStudyDraft: { title: string; body: string }
}

export const STATUSES: OfferingStatus[] = ['available', 'pilot', 'not-yet']

/** "Available", "Pilot", "Not yet in Kenya"… for pills; `unknown` when the data has no status. */
export function statusLabel(status: OfferingStatus | 'unknown', country: string, long = false): string {
  if (status === 'available') return long ? `Available in ${country}` : 'Available'
  if (status === 'pilot') return long ? `Pilot in ${country}` : 'Pilot'
  if (status === 'not-yet') return `Not yet in ${country}`
  return 'Status not recorded'
}

/** An offering's status in the country, or 'unknown' when the demo data has none. */
export const statusOf = (data: Pick<CountryPitchData, 'offerings'>, offeringId: string): OfferingStatus | 'unknown' =>
  data.offerings[offeringId]?.status ?? 'unknown'

/**
 * Checks the demo data before it is used, so a swapped country can't put an
 * unsourced figure on a slide. Returns the problems; empty when it is fine.
 */
export function validatePitchData(data: CountryPitchData, offeringIds: string[]): string[] {
  const errors: string[] = []
  const facts: Fact[] = [...data.connectivity, data.offeringStatusSource]
  const sourced = (id: string, s: Partial<Source> | undefined) => {
    for (const key of ['title', 'type', 'committedBy', 'validatedBy', 'date'] as const) {
      if (!s?.[key]) errors.push(`${id}: source.${key} is missing`)
    }
    if (s?.date && !/^\d{4}-\d{2}-\d{2}$/.test(s.date)) errors.push(`${id}: source.date must be YYYY-MM-DD`)
  }
  if (!data.country?.name || !/^[A-Z]{2}$/.test(data.country?.iso ?? '')) errors.push('country: name and a 2-letter ISO code are needed')
  if (data.connectivity.length < 3 || data.connectivity.length > 4) errors.push('connectivity: 3 to 4 figures are needed')
  for (const f of facts) {
    if (!f.id || !f.label || !f.value || !f.excerpt) errors.push(`${f.id || 'fact'}: id, label, value and excerpt are needed`)
    if (f.illustrative !== true) errors.push(`${f.id}: mark it "illustrative": true`)
    sourced(f.id, f.source)
  }
  for (const r of data.records) {
    if (!r.excerpt || !r.title || !r.team) errors.push(`${r.id}: title, team and excerpt are needed`)
    if (r.illustrative !== true) errors.push(`${r.id}: mark it "illustrative": true`)
    sourced(r.id, r.source)
  }
  if (data.records.length < 1 || data.records.length > 2) errors.push('records: 1 to 2 records are needed')
  if (data.gaps.length < 1 || data.gaps.length > 2) errors.push('gaps: 1 to 2 gaps are needed')
  for (const [id, o] of Object.entries(data.offerings)) {
    if (!offeringIds.includes(id)) errors.push(`offerings: unknown offering id "${id}"`)
    if (!STATUSES.includes(o.status)) errors.push(`offerings.${id}: status must be available, pilot or not-yet`)
    if (!o.note) errors.push(`offerings.${id}: a one-line note is needed`)
  }
  return errors
}

/** The newest record of a kind (records carry their own date). */
export const latestRecord = (records: PitchRecord[], kind: PitchRecord['kind']) =>
  records.filter((r) => r.kind === kind).sort((a, b) => b.date.localeCompare(a.date))[0]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 2026-09-30 → "30 Sep 2026" (fixed, so the server and the browser agree). */
export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim()
}

// ---- State and URL ------------------------------------------------------------

/** What the demo needs to know about the data, so this file stays testable. */
export type PitchCatalog = {
  country: { iso: string; name: string; aliases: string[] }
  /** Specific audiences from the knowledge data. */
  audiences: { id: string; name: string }[]
  /** Every offering id, in category order. */
  offeringIds: string[]
}

export type CommitChoice = 'case-study' | 'not-now'

export type CountryPitchState = {
  /** The opening message as typed. */
  q?: string
  /** ISO code of the country Dot picked out. */
  country?: string
  /** Audience id Dot picked out. */
  audience?: string
  /** "Looks right" on the picked country and audience. */
  confirmed?: boolean
  /** "Build the pitch" on the snapshot. */
  pitch?: boolean
  /** One of GOALS, the user's own short text, or SKIP. */
  goal?: string
  /** Offering ids, in category order (at least one). */
  offerings?: string[]
  length?: DeckLength
  /** "Generate pitch" was pressed. */
  generated?: boolean
  commit?: CommitChoice
  /** The case study title, once submitted for review. */
  caseTitle?: string
}

/** How the demo plays, for recording. Not answers: they never clear anything. */
export type PitchView = {
  /** Plays the whole flow by itself. */
  autoplay: boolean
  /** Scales every autoplay pause, 0.5 (slower) to 2 (faster). */
  speed: number
  /** Hides the side panel and the Demo pill. */
  clean: boolean
}

export const DEFAULT_VIEW: PitchView = { autoplay: false, speed: 1, clean: false }

/** The steps, in the order they come. */
export const STEPS = [
  'opening',
  'confirm',
  'snapshot',
  'goal',
  'offerings',
  'length',
  'review',
  'result',
  'case-study',
  'submitted',
  'not-now',
] as const
export type PitchStep = (typeof STEPS)[number]

/** The answers, in order: a missing one clears every later one. */
const ORDER = ['country', 'audience', 'confirmed', 'pitch', 'goal', 'offerings', 'length', 'generated', 'commit', 'caseTitle'] as const
export type PitchKey = (typeof ORDER)[number]

export const clean = (value: string | null | undefined, max: number) => {
  const text = (value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  return text.slice(0, max).trim() || undefined
}

/** speed= from the URL: a number from 0.5 to 2, else 1. */
export function parseSpeed(value: string | null): number {
  const n = Number(value)
  if (!value || !Number.isFinite(n) || n <= 0) return 1
  return Math.min(2, Math.max(0.5, n))
}

/** Keeps answers in order: the first missing answer clears every later one. */
export function normalizePitch(raw: CountryPitchState): CountryPitchState {
  const out: CountryPitchState = {}
  if (raw.q) out.q = raw.q
  for (const key of ORDER) {
    const value = raw[key]
    if (value === undefined || value === false || (Array.isArray(value) && value.length === 0)) break
    ;(out as Record<string, unknown>)[key] = value
    // Only the case study needs a title; "Not now" ends the flow.
    if (key === 'commit' && value === 'not-now') break
  }
  return out
}

/** URL → the demo's state and view; null when the URL is not this demo. */
export function parseCountryPitch(params: URLSearchParams, catalog: PitchCatalog): { state: CountryPitchState; view: PitchView } | null {
  if (params.get('demo') !== DEMO_VALUE) return null
  const country = params.get('country')?.toUpperCase() === catalog.country.iso ? catalog.country.iso : undefined
  const audienceParam = params.get('audience')
  const audience = catalog.audiences.some((a) => a.id === audienceParam) ? (audienceParam as string) : undefined
  const offeringsParam = (params.get('offerings') ?? '').split(',')
  const offerings = catalog.offeringIds.filter((id) => offeringsParam.includes(id))
  const commitParam = params.get('commit')
  const state = normalizePitch({
    q: clean(params.get('q'), MAX_TEXT),
    country,
    audience,
    confirmed: params.get('confirmed') === '1',
    pitch: params.get('pitch') === '1',
    goal: clean(params.get('goal'), 60),
    offerings,
    length: LENGTHS.find((l) => l.id === params.get('length'))?.id,
    generated: params.get('generate') === '1',
    commit: commitParam === 'case-study' || commitParam === 'not-now' ? commitParam : undefined,
    caseTitle: clean(params.get('case'), MAX_CASE_TITLE),
  })
  const view: PitchView = {
    autoplay: params.get('autoplay') === '1',
    speed: parseSpeed(params.get('speed')),
    clean: params.get('clean') === '1',
  }
  return { state, view }
}

/** State (and view) → home page URL. */
export function countryPitchHref(state: CountryPitchState, view: PitchView = DEFAULT_VIEW): string {
  const params = new URLSearchParams({ demo: DEMO_VALUE })
  const s = normalizePitch(state)
  if (s.q) params.set('q', s.q)
  if (s.country) params.set('country', s.country)
  if (s.audience) params.set('audience', s.audience)
  if (s.confirmed) params.set('confirmed', '1')
  if (s.pitch) params.set('pitch', '1')
  if (s.goal) params.set('goal', s.goal)
  if (s.offerings?.length) params.set('offerings', s.offerings.join(','))
  if (s.length) params.set('length', s.length)
  if (s.generated) params.set('generate', '1')
  if (s.commit) params.set('commit', s.commit)
  if (s.caseTitle) params.set('case', s.caseTitle)
  if (view.autoplay) params.set('autoplay', '1')
  if (view.speed !== 1) params.set('speed', String(view.speed))
  if (view.clean) params.set('clean', '1')
  return `/?${params.toString()}`
}

/** The step to show for these answers. */
export function currentPitchStep(state: CountryPitchState): PitchStep {
  if (!state.country || !state.audience) return 'opening'
  if (!state.confirmed) return 'confirm'
  if (!state.pitch) return 'snapshot'
  if (!state.goal) return 'goal'
  if (!state.offerings?.length) return 'offerings'
  if (!state.length) return 'length'
  if (!state.generated) return 'review'
  if (state.commit === 'not-now') return 'not-now'
  if (state.commit === 'case-study') return state.caseTitle ? 'submitted' : 'case-study'
  return 'result'
}

/** "Change" on the review card (or on the picked country): clears the answer and every later one. */
export function clearPitchFrom(state: CountryPitchState, key: PitchKey): CountryPitchState {
  const out: CountryPitchState = { ...state }
  for (const k of ORDER.slice(ORDER.indexOf(key))) delete out[k]
  // Changing the country or the audience starts again from the opening message.
  if (key === 'country' || key === 'audience') delete out.q
  return out
}

// ---- Opening message ----------------------------------------------------------

/**
 * Picks the country and the audience out of the opening message: the demo's
 * country by name or alias, and the specific audience whose name appears (the
 * longest one wins, so "Ministry of Education" beats "Ministry").
 */
export function readOpening(text: string, catalog: PitchCatalog): { country?: string; audience?: string } {
  const t = normalize(text).replace(/[’']/g, "'")
  const names = [catalog.country.name, ...catalog.country.aliases]
  const country = names.some((n) => hasWord(t, normalize(n))) ? catalog.country.iso : undefined
  const audience = [...catalog.audiences]
    .sort((a, b) => b.name.length - a.name.length)
    .find((a) => hasWord(t, normalize(a.name)))?.id
  return { country, audience }
}

// ---- Offerings ----------------------------------------------------------------

/**
 * Offerings ticked when the step opens: the audience's offerings that are
 * available or in pilot in the country. "Not yet" (and unrecorded) offerings
 * are never pre-selected.
 */
export function preselectOfferings(audienceOfferingIds: string[], data: Pick<CountryPitchData, 'offerings'>): string[] {
  return audienceOfferingIds.filter((id) => {
    const status = statusOf(data, id)
    return status === 'available' || status === 'pilot'
  })
}

/** The picked offerings that are not yet in the country: each gets the inline warning. */
export const notYetPicked = (picked: string[], data: Pick<CountryPitchData, 'offerings'>) =>
  picked.filter((id) => statusOf(data, id) === 'not-yet')

/** The inline warning for a "not yet" offering. */
export const notYetWarning = (country: string) => `Not yet available in ${country}. Check with Product before promising it.`

/** "1 gap flagged", "2 gaps flagged". */
export const gapLabel = (n: number) => `${n} ${n === 1 ? 'gap' : 'gaps'} flagged`

// ---- Typed replies --------------------------------------------------------------

/** "yes", "right", "correct"… on the confirm step. */
export function isYesReply(text: string): boolean {
  const t = normalize(text)
  return ['yes', 'yep', 'right', 'correct', 'looks right', 'ok', 'okay', 'confirm', 'go', 'continue'].some((w) => hasWord(t, w))
}

/** "build", "pitch", "next"… on the snapshot. */
export function isBuildReply(text: string): boolean {
  const t = normalize(text)
  return ['build', 'pitch', 'next', 'continue', 'yes', 'go', 'ok', 'okay'].some((w) => hasWord(t, w))
}

// ---- Slides ("generating" without AI) ------------------------------------------

export type PitchOffering = { id: string; name: string; shortName: string | null; description: string | null; status: OfferingStatus | 'unknown'; note: string }

export type PitchInput = {
  country: string
  audienceName: string
  pitchTitle: string
  /** A goal chip, the user's text, or SKIP. */
  goal: string
  /** The audience's needs, in need-group order (the first 3 are used). */
  needs: { name: string; statement: string }[]
  /** The connectivity figures (the first 2 go on "Why it matters"). */
  figures: Fact[]
  /** The fact every offering status comes from. */
  statusFact: Fact
  /** Only the categories with selected offerings, in order. */
  categories: { name: string; offerings: PitchOffering[] }[]
  caseStudy?: PitchRecord
  engagement?: PitchRecord
  gaps: Gap[]
  length: DeckLength
}

type Cited = { cites: string[] }
export type PitchSlide = Cited &
  (
    | { kind: 'title'; eyebrow: string; title: string; subtitle: string }
    | { kind: 'why'; title: string; needs: { name: string; statement: string }[]; figures: Fact[] }
    | { kind: 'offerings'; eyebrow: string; title: string; offerings: PitchOffering[] }
    | { kind: 'offering'; eyebrow: string; offering: PitchOffering }
    | { kind: 'proof'; title: string; record?: PitchRecord; gaps: Gap[] }
    | { kind: 'how'; title: string; steps: { title: string; text: string }[]; record?: PitchRecord }
    | { kind: 'ask'; title: string; lines: string[] }
    | { kind: 'contact'; title: string; lines: string[] }
  )

/** The subtitle of the title slide, from the goal. */
export function titleSubtitle(goal: string, audienceName: string): string {
  if (goal === SKIP || !goal) return `For the ${audienceName}`
  if (goal === GOALS[0]) return `An introduction to Digital Inclusion for the ${audienceName}`
  if (goal === GOALS[1]) return `A funding proposal for the ${audienceName}`
  if (goal === GOALS[2]) return `A partnership proposal for the ${audienceName}`
  if (goal === GOALS[3]) return `A progress report for the ${audienceName}`
  return `${goal}, for the ${audienceName}`
}

const names = (offerings: PitchOffering[], max = 3) => {
  const list = offerings.map((o) => o.shortName ?? o.name)
  if (list.length <= max) return list.length <= 1 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`
  return `${list.slice(0, max).join(', ')} and ${list.length - max} more`
}

/**
 * The ask, from the selected offerings and their status: start with what is
 * available, test what is in pilot, and never promise what is not yet there.
 */
export function askLines(goal: string, offerings: PitchOffering[], country: string): string[] {
  const by = (s: OfferingStatus | 'unknown') => offerings.filter((o) => o.status === s)
  const lines: string[] = []
  if (by('available').length) lines.push(`Start now: ${names(by('available'))}`)
  if (by('pilot').length) lines.push(`Test together: ${names(by('pilot'))}`)
  const notYet = [...by('not-yet'), ...by('unknown')]
  if (notYet.length) lines.push(`Check with Product first: ${names(notYet)} (not yet in ${country})`)
  const kind = goalKind(goal)
  lines.push(kind === 'funding' ? 'Agree the funding and the first step' : kind === 'partnership' ? 'Agree a first step and a date to meet again' : 'Agree the next step')
  return lines
}

const HOW_STEPS = [
  { title: 'We plan with you', text: 'One joint plan, owned by the ministry.' },
  { title: 'We support delivery', text: 'Our country team works next to yours.' },
  { title: 'We share what we learn', text: 'Results are measured and published.' },
]

/** Joins category names for a merged slide: "Modelling and finance", "Modelling, finance and procurement". */
const joinNames = (list: string[]) => {
  const lower = list.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1)))
  return lower.length <= 1 ? (lower[0] ?? '') : `${lower.slice(0, -1).join(', ')} and ${lower[lower.length - 1]}`
}

/**
 * The pitch, from fixed rules (no AI): Title, Why it matters (top 3 needs and
 * 2 figures), one slide per selected offering category, Proof (the case study
 * word for word, plus every gap), How we work together, The ask, Contact.
 * Short merges the categories into 2 slides at most; Long adds one slide per
 * offering after its category.
 */
export function buildPitchSlides(input: PitchInput): PitchSlide[] {
  const figures = input.figures.slice(0, 2)
  const kind = goalKind(input.goal)
  const title: PitchSlide = {
    kind: 'title',
    eyebrow: `Digital Inclusion · ${input.country}`,
    title: input.pitchTitle,
    subtitle: titleSubtitle(input.goal, input.audienceName),
    cites: [],
  }
  const why: PitchSlide = {
    kind: 'why',
    title: `Why it matters for the ${input.audienceName}`,
    needs: input.needs.slice(0, 3),
    figures,
    cites: figures.map((f) => f.id),
  }

  let categories: PitchSlide[] = input.categories.map((c) => ({
    kind: 'offerings',
    eyebrow: 'What we offer',
    title: c.name,
    offerings: c.offerings,
    cites: [input.statusFact.id],
  }))
  if (input.length === 'short' && categories.length > 2) {
    const half = Math.ceil(input.categories.length / 2)
    categories = [input.categories.slice(0, half), input.categories.slice(half)].map((chunk) => ({
      kind: 'offerings',
      eyebrow: 'What we offer',
      title: joinNames(chunk.map((c) => c.name)),
      offerings: chunk.flatMap((c) => c.offerings),
      cites: [input.statusFact.id],
    }))
  } else if (input.length === 'long') {
    categories = input.categories.flatMap((c, i) => [
      categories[i],
      ...c.offerings.map((o): PitchSlide => ({ kind: 'offering', eyebrow: c.name, offering: o, cites: [input.statusFact.id] })),
    ])
  }

  const proof: PitchSlide = {
    kind: 'proof',
    title: `What we've seen in ${input.country}`,
    record: input.caseStudy,
    gaps: input.gaps,
    cites: input.caseStudy ? [input.caseStudy.id] : [],
  }
  const how: PitchSlide = { kind: 'how', title: 'How we work together', steps: HOW_STEPS, record: input.engagement, cites: input.engagement ? [input.engagement.id] : [] }
  const all = input.categories.flatMap((c) => c.offerings)
  const ask: PitchSlide = {
    kind: 'ask',
    title: kind === 'partnership' ? 'The partnership we propose' : kind === 'funding' ? 'The ask' : 'Next steps',
    lines: askLines(input.goal, all, input.country),
    cites: all.length ? [input.statusFact.id] : [],
  }
  const contact: PitchSlide = { kind: 'contact', title: 'Thank you', lines: ['Your name and role', 'Your email'], cites: [] }

  return [title, why, ...categories, proof, how, ask, contact]
}

/** Footnote numbers: each cited fact gets a number, in the order it first appears on the slides. */
export function footnoteNumbers(slides: PitchSlide[]): Map<string, number> {
  const numbers = new Map<string, number>()
  for (const slide of slides) for (const id of slide.cites) if (!numbers.has(id)) numbers.set(id, numbers.size + 1)
  return numbers
}

/** Autoplay pauses in ms: "step" about 1.5 s, "hold" (snapshot, slides) about 2.5 s, scaled by speed; 1 s each with reduced motion. */
export function autoplayPause(kind: 'step' | 'hold' | 'beat', speed: number, reducedMotion: boolean): number {
  if (reducedMotion) return 1000
  const base = kind === 'hold' ? 2500 : kind === 'step' ? 1500 : 450
  return Math.round(base / parseSpeed(String(speed)))
}

/** True for /?demo=country-pitch&clean=1: the app shell hides the side panel for a clean recording frame. */
export const isCleanPitchFrame = (pathname: string, params: URLSearchParams) =>
  pathname === '/' && params.get('demo') === DEMO_VALUE && params.get('clean') === '1'
