// Unit tests for the Country pitch demo (testing only). Run with `npm test` (Node 22 strips the TypeScript types).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  STEPS,
  autoplayPause,
  buildPitchSlides,
  clearPitchFrom,
  countryPitchHref,
  currentPitchStep,
  footnoteNumbers,
  formatDate,
  gapLabel,
  latestRecord,
  notYetPicked,
  notYetWarning,
  parseCountryPitch,
  parseSpeed,
  preselectOfferings,
  readOpening,
  statusLabel,
  titleSubtitle,
  validatePitchData,
} from './country-pitch-demo.ts'

const data = JSON.parse(readFileSync(new URL('../../data/demo/country-pitch.json', import.meta.url), 'utf8'))
const offeringIds = JSON.parse(readFileSync(new URL('../../data/knowledge/offerings.json', import.meta.url), 'utf8')).map((o) => o.id)

const catalog = {
  country: { iso: 'KE', name: 'Kenya', aliases: ['kenya'] },
  audiences: [
    { id: 'ministry-of-education', name: 'Ministry of Education' },
    { id: 'ministry-of-health', name: 'Ministry of Health' },
    { id: 'head-of-state', name: 'Head of State' },
  ],
  offeringIds: ['mapping', 'dashboards', 'connectivity-credits', 'research'],
}
const parse = (query) => parseCountryPitch(new URLSearchParams(query), catalog)

const full = {
  q: 'Meeting the Ministry of Education in Kenya',
  country: 'KE',
  audience: 'ministry-of-education',
  confirmed: true,
  pitch: true,
  goal: 'Propose a partnership',
  offerings: ['mapping', 'research'],
  length: 'standard',
  generated: true,
}

// ---- Data file --------------------------------------------------------------

test('the demo data is complete, sourced and marked illustrative', () => {
  assert.deepEqual(validatePitchData(data, offeringIds), [])
  assert.equal(data.illustrative, true)
})

test('validatePitchData flags an unsourced or real-looking figure', () => {
  const broken = structuredClone(data)
  broken.connectivity[0].illustrative = false
  delete broken.connectivity[1].source.validatedBy
  broken.offerings['made-up'] = { status: 'maybe', note: '' }
  const errors = validatePitchData(broken, offeringIds)
  assert.ok(errors.some((e) => e.includes('illustrative')))
  assert.ok(errors.some((e) => e.includes('validatedBy')))
  assert.ok(errors.some((e) => e.includes('unknown offering id')))
  assert.ok(errors.some((e) => e.includes('status must be')))
})

// ---- URL --------------------------------------------------------------------

test('only ?demo=country-pitch starts the demo', () => {
  assert.equal(parse(''), null)
  assert.equal(parse('demo=deck'), null)
  assert.deepEqual(parse('demo=country-pitch'), { state: {}, view: { autoplay: false, speed: 1, clean: false } })
})

test('the URL round-trips every answer and the view options', () => {
  const state = { ...full, commit: 'case-study', caseTitle: 'A new case study' }
  const view = { autoplay: true, speed: 1.5, clean: true }
  assert.deepEqual(parse(countryPitchHref(state, view).slice(2)), { state, view })
})

test('an unknown value is dropped and clears every later answer', () => {
  const { state } = parse('demo=country-pitch&country=GH&audience=ministry-of-education&confirmed=1&pitch=1')
  assert.deepEqual(state, {})
  const two = parse('demo=country-pitch&country=ke&audience=nope&confirmed=1').state
  assert.deepEqual(two, { country: 'KE' })
  const three = parse('demo=country-pitch&country=KE&audience=ministry-of-education&confirmed=1&pitch=1&goal=skip&offerings=nope&length=short').state
  assert.equal(three.goal, 'skip')
  assert.equal(three.offerings, undefined)
  assert.equal(three.length, undefined)
})

test('offerings keep catalogue order and drop unknown ids', () => {
  const { state } = parse('demo=country-pitch&country=KE&audience=ministry-of-education&confirmed=1&pitch=1&goal=x&offerings=research,zzz,mapping')
  assert.deepEqual(state.offerings, ['mapping', 'research'])
})

test('speed is a number from 0.5 to 2, else 1', () => {
  assert.equal(parseSpeed(null), 1)
  assert.equal(parseSpeed('fast'), 1)
  assert.equal(parseSpeed('0'), 1)
  assert.equal(parseSpeed('0.2'), 0.5)
  assert.equal(parseSpeed('1.25'), 1.25)
  assert.equal(parseSpeed('9'), 2)
  assert.ok(!countryPitchHref({}, { autoplay: false, speed: 1, clean: false }).includes('speed'))
})

// ---- Steps ------------------------------------------------------------------

test('the steps come in order', () => {
  assert.deepEqual(STEPS.slice(0, 8), ['opening', 'confirm', 'snapshot', 'goal', 'offerings', 'length', 'review', 'result'])
  const keys = ['country', 'audience', 'confirmed', 'pitch', 'goal', 'offerings', 'length', 'generated']
  const expected = ['opening', 'opening', 'confirm', 'snapshot', 'goal', 'offerings', 'length', 'review', 'result']
  let state = {}
  assert.equal(currentPitchStep(state), expected[0])
  keys.forEach((key, i) => {
    state = { ...state, [key]: full[key] }
    assert.equal(currentPitchStep(state), expected[i + 1], `after ${key}`)
  })
  assert.equal(currentPitchStep({ ...full, commit: 'case-study' }), 'case-study')
  assert.equal(currentPitchStep({ ...full, commit: 'case-study', caseTitle: 'T' }), 'submitted')
  assert.equal(currentPitchStep({ ...full, commit: 'not-now' }), 'not-now')
})

test('"Not now" ends the flow: no case study title is kept', () => {
  const { state } = parse(countryPitchHref({ ...full, commit: 'not-now', caseTitle: 'x' }).slice(2))
  assert.equal(state.commit, 'not-now')
  assert.equal(state.caseTitle, undefined)
})

test('Change clears the answer and every later one; the country also clears the opening', () => {
  assert.deepEqual(clearPitchFrom(full, 'offerings'), {
    q: full.q,
    country: 'KE',
    audience: 'ministry-of-education',
    confirmed: true,
    pitch: true,
    goal: 'Propose a partnership',
  })
  assert.deepEqual(clearPitchFrom(full, 'country'), {})
})

// ---- Opening ----------------------------------------------------------------

test('the opening message gives the country and the most specific audience', () => {
  assert.deepEqual(readOpening(data.opening, catalog), { country: 'KE', audience: 'ministry-of-education' })
  assert.deepEqual(readOpening('pitch for the ministry of health, kenya', catalog), { country: 'KE', audience: 'ministry-of-health' })
  assert.deepEqual(readOpening('I need a pitch', catalog), { country: undefined, audience: undefined })
  assert.equal(readOpening('Ghana, ministry of education', catalog).country, undefined)
})

// ---- Offerings --------------------------------------------------------------

test('pre-selection keeps available and pilot offerings, never "not yet" or unrecorded ones', () => {
  const statuses = { offerings: { a: { status: 'available' }, b: { status: 'pilot' }, c: { status: 'not-yet' } } }
  assert.deepEqual(preselectOfferings(['a', 'b', 'c', 'd'], statuses), ['a', 'b'])
  // With the real data, procurement on behalf of government is "not yet" in Kenya.
  assert.ok(!preselectOfferings(['procurement-on-behalf', 'mapping'], data).includes('procurement-on-behalf'))
})

test('a picked "not yet" offering gets the warning', () => {
  const statuses = { offerings: { a: { status: 'available' }, c: { status: 'not-yet' } } }
  assert.deepEqual(notYetPicked(['a'], statuses), [])
  assert.deepEqual(notYetPicked(['a', 'c'], statuses), ['c'])
  assert.equal(notYetWarning('Kenya'), 'Not yet available in Kenya. Check with Product before promising it.')
  assert.equal(statusLabel('not-yet', 'Kenya'), 'Not yet in Kenya')
  assert.equal(statusLabel('available', 'Kenya'), 'Available')
  assert.equal(statusLabel('unknown', 'Kenya'), 'Status not recorded')
})

// ---- Slides -----------------------------------------------------------------

const offering = (id, status, category) => ({ id, name: `Offering ${id}`, shortName: null, description: 'Does a thing.', status, note: 'A note.', category })
const input = (patch = {}) => ({
  country: 'Kenya',
  audienceName: 'Ministry of Education',
  pitchTitle: data.pitchTitle,
  goal: 'Propose a partnership',
  needs: [
    { name: 'Need 1', statement: 'S1' },
    { name: 'Need 2', statement: 'S2' },
    { name: 'Need 3', statement: 'S3' },
    { name: 'Need 4', statement: 'S4' },
  ],
  figures: data.connectivity,
  statusFact: data.offeringStatusSource,
  categories: [
    { name: 'Modelling', offerings: [offering('a', 'available')] },
    { name: 'Finance', offerings: [offering('b', 'pilot'), offering('c', 'available')] },
    { name: 'Network and data solutions', offerings: [offering('d', 'available')] },
    { name: 'Procurement', offerings: [offering('e', 'not-yet')] },
  ],
  caseStudy: latestRecord(data.records, 'case-study'),
  engagement: latestRecord(data.records, 'engagement'),
  gaps: data.gaps,
  length: 'standard',
  ...patch,
})

test('standard: title, why, one slide per category, proof, how, ask, contact', () => {
  const slides = buildPitchSlides(input())
  assert.deepEqual(
    slides.map((s) => s.kind),
    ['title', 'why', 'offerings', 'offerings', 'offerings', 'offerings', 'proof', 'how', 'ask', 'contact'],
  )
  assert.deepEqual(slides.slice(2, 6).map((s) => s.title), ['Modelling', 'Finance', 'Network and data solutions', 'Procurement'])
})

test('why it matters: the top 3 needs and 2 cited figures', () => {
  const why = buildPitchSlides(input()).find((s) => s.kind === 'why')
  assert.equal(why.needs.length, 3)
  assert.equal(why.figures.length, 2)
  assert.deepEqual(why.cites, [data.connectivity[0].id, data.connectivity[1].id])
})

test('short merges the categories into 2 slides; long adds one per offering', () => {
  const short = buildPitchSlides(input({ length: 'short' }))
  const cats = short.filter((s) => s.kind === 'offerings')
  assert.equal(cats.length, 2)
  assert.equal(cats[0].title, 'Modelling and finance')
  assert.equal(cats.flatMap((s) => s.offerings).length, 5)
  assert.ok(short.length <= 8)
  const long = buildPitchSlides(input({ length: 'long' }))
  assert.equal(long.filter((s) => s.kind === 'offering').length, 5)
  assert.equal(long[3].kind, 'offering')
  assert.equal(long[3].eyebrow, 'Modelling')
})

test('proof keeps the case study word for word, with its source, and every gap', () => {
  const proof = buildPitchSlides(input()).find((s) => s.kind === 'proof')
  assert.equal(proof.record.excerpt, data.records[0].excerpt)
  assert.deepEqual(proof.cites, [data.records[0].id])
  assert.deepEqual(proof.gaps.map((g) => g.slideNote), ['Gap: no recent case study. Add one before sending.'])
  const none = buildPitchSlides(input({ caseStudy: undefined })).find((s) => s.kind === 'proof')
  assert.equal(none.record, undefined)
  assert.deepEqual(none.cites, [])
  assert.equal(gapLabel(1), '1 gap flagged')
  assert.equal(gapLabel(2), '2 gaps flagged')
})

test('the ask starts with what is available and never promises what is not yet there', () => {
  const ask = buildPitchSlides(input()).find((s) => s.kind === 'ask')
  assert.equal(ask.title, 'The partnership we propose')
  assert.equal(ask.lines[0], 'Start now: Offering a, Offering c and Offering d')
  assert.equal(ask.lines[1], 'Test together: Offering b')
  assert.equal(ask.lines[2], 'Check with Product first: Offering e (not yet in Kenya)')
  assert.equal(buildPitchSlides(input({ goal: 'Ask for funding' })).find((s) => s.kind === 'ask').title, 'The ask')
  assert.equal(buildPitchSlides(input({ goal: 'skip' })).find((s) => s.kind === 'ask').title, 'Next steps')
})

test('the title slide carries the country, the audience and the goal', () => {
  const [title] = buildPitchSlides(input())
  assert.equal(title.eyebrow, 'Digital Inclusion · Kenya')
  assert.equal(title.subtitle, 'A partnership proposal for the Ministry of Education')
  assert.equal(titleSubtitle('skip', 'Ministry of Education'), 'For the Ministry of Education')
})

test('footnotes are numbered in order of first appearance, once per fact', () => {
  const numbers = footnoteNumbers(buildPitchSlides(input()))
  assert.deepEqual([...numbers.keys()], ['schools-mapped', 'schools-connected', 'offering-status', 'case-study-counties', 'engagement-workshop'])
  assert.deepEqual([...numbers.values()], [1, 2, 3, 4, 5])
})

// ---- Small helpers ----------------------------------------------------------

test('dates and autoplay pauses', () => {
  assert.equal(formatDate('2026-09-30'), '30 Sep 2026')
  assert.equal(formatDate('soon'), 'soon')
  assert.equal(autoplayPause('step', 1, false), 1500)
  assert.equal(autoplayPause('hold', 1, false), 2500)
  assert.equal(autoplayPause('step', 2, false), 750)
  assert.equal(autoplayPause('hold', 0.5, false), 5000)
  assert.equal(autoplayPause('hold', 2, true), 1000)
})
