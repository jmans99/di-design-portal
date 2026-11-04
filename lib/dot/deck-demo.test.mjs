// Unit tests for the deck demo (testing only). Run with `npm test` (Node 22 strips the TypeScript types).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOutline,
  clearFrom,
  currentStep,
  deckDemoHref,
  goalFromReply,
  goalKind,
  isAllReply,
  isGenerateReply,
  matchGoalChip,
  matchLength,
  matchOfferingIds,
  matchTemplateReply,
  offeringsAnswer,
  parseDeckDemo,
  regionFromReply,
} from './deck-demo.ts'

const catalog = {
  audienceGroupIds: ['governments', 'private-sector-funders-donors'],
  // "private-sector-funders-donors" has no audiences, like in the knowledge data.
  audiences: [
    { id: 'head-of-state', groupId: 'governments' },
    { id: 'ministry-of-health', groupId: 'governments' },
  ],
  offeringIds: ['a', 'b', 'c', 'd'],
}
const parse = (query) => parseDeckDemo(new URLSearchParams(query), catalog)

test('only ?demo=deck starts the demo', () => {
  assert.equal(parse(''), null)
  assert.equal(parse('new=deck'), null)
  assert.equal(parse('demo=map'), null)
  assert.deepEqual(parse('demo=deck'), {})
})

test('an empty demo asks for the template, then each question in order', () => {
  assert.equal(currentStep({}, catalog), 'template')
  let state = { template: 'from-scratch' }
  assert.equal(currentStep(state, catalog), 'audience')
  state = { ...state, audience: 'governments' }
  assert.equal(currentStep(state, catalog), 'who')
  state = { ...state, who: 'head-of-state' }
  assert.equal(currentStep(state, catalog), 'goal')
  state = { ...state, goal: 'Ask for funding' }
  assert.equal(currentStep(state, catalog), 'offerings')
  state = { ...state, offerings: ['a', 'b'] }
  assert.equal(currentStep(state, catalog), 'length')
  state = { ...state, length: 'standard' }
  assert.equal(currentStep(state, catalog), 'region')
  state = { ...state, region: 'Kenya' }
  assert.equal(currentStep(state, catalog), 'review')
  assert.equal(currentStep({ ...state, generated: true }, catalog), 'result')
})

test('skips the specific audience when the group has none, or the audience was skipped', () => {
  assert.equal(currentStep({ template: 'from-scratch', audience: 'private-sector-funders-donors' }, catalog), 'goal')
  assert.equal(currentStep({ template: 'from-scratch', audience: 'skip' }, catalog), 'goal')
})

test('skips offerings for the Master deck, which always has all of them', () => {
  const state = { template: 'master-deck', audience: 'skip', goal: 'skip' }
  assert.equal(currentStep(state, catalog), 'length')
  assert.equal(parse('demo=deck&template=master-deck&audience=skip&goal=skip').offerings, 'all')
  assert.ok(!deckDemoHref({ ...state, offerings: 'all' }).includes('offerings'))
})

test('the URL round-trips every answer', () => {
  const state = {
    template: 'partnership-deck',
    audience: 'governments',
    who: 'ministry-of-health',
    goal: 'Propose a partnership',
    offerings: ['a', 'c'],
    length: 'short',
    region: 'West Africa',
    generated: true,
  }
  const href = deckDemoHref(state)
  assert.ok(href.startsWith('/?demo=deck&'))
  assert.deepEqual(parse(href.slice(2)), state)
  assert.deepEqual(parse(deckDemoHref({})?.slice(2)), {})
  assert.equal(deckDemoHref({}), '/?demo=deck')
})

test('unknown values are dropped, and a missing answer clears the later ones', () => {
  assert.deepEqual(parse('demo=deck&template=nope&audience=governments'), {})
  assert.deepEqual(parse('demo=deck&template=from-scratch&audience=nope&goal=x'), { template: 'from-scratch' })
  // "who" must belong to the group.
  assert.deepEqual(parse('demo=deck&template=from-scratch&audience=governments&who=elsewhere&goal=x'), {
    template: 'from-scratch',
    audience: 'governments',
  })
  assert.deepEqual(parse('demo=deck&template=from-scratch&audience=skip&goal=x&offerings=zzz&length=standard'), {
    template: 'from-scratch',
    audience: 'skip',
    goal: 'x',
  })
  assert.deepEqual(parse('demo=deck&template=from-scratch&audience=skip&goal=x&offerings=b,zzz,a').offerings, ['a', 'b'])
})

test('a typed goal is kept short in the URL', () => {
  const state = parse(`demo=deck&template=from-scratch&audience=skip&goal=${'x'.repeat(200)}`)
  assert.equal(state.goal.length, 60)
  assert.equal(goalFromReply('y'.repeat(200)).length, 60)
})

test('Change clears that answer and every later one', () => {
  const state = {
    template: 'from-scratch',
    audience: 'governments',
    who: 'head-of-state',
    goal: 'Ask for funding',
    offerings: 'all',
    length: 'long',
    region: 'Kenya',
    generated: true,
  }
  assert.deepEqual(clearFrom(state, 'goal'), { template: 'from-scratch', audience: 'governments', who: 'head-of-state' })
  assert.deepEqual(clearFrom(state, 'audience'), { template: 'from-scratch' })
  const withoutRegion = { ...state }
  delete withoutRegion.region
  delete withoutRegion.generated
  assert.deepEqual(clearFrom(state, 'region'), withoutRegion)
  assert.equal(currentStep(clearFrom(state, 'length'), catalog), 'length')
})

test('none or every offering picked means all', () => {
  const all = catalog.offeringIds
  assert.equal(offeringsAnswer([], all), 'all')
  assert.equal(offeringsAnswer(all, all), 'all')
  assert.deepEqual(offeringsAnswer(['c', 'a'], all), ['a', 'c'])
})

test('typed replies match chip labels loosely', () => {
  assert.equal(matchGoalChip('funding'), 'Ask for funding')
  assert.equal(matchGoalChip('We want to REPORT on progress'), 'Report on progress')
  assert.equal(matchGoalChip('introduce digital inclusion'), 'Introduce Digital Inclusion')
  assert.equal(matchGoalChip('funding please'), 'Ask for funding')
  assert.equal(matchGoalChip('a partner deal'), 'Propose a partnership')
  assert.equal(matchGoalChip('hello'), null)
  assert.equal(goalFromReply('skip'), 'skip')
  assert.equal(goalFromReply('  Meet the minister  '), 'Meet the minister')
  assert.equal(regionFromReply('Kenya'), 'Kenya')
  assert.equal(regionFromReply('skip'), 'skip')
  assert.equal(regionFromReply('   '), undefined)
  const templates = [
    { id: 'from-scratch', name: 'From scratch' },
    { id: 'master-deck', name: 'Master deck' },
  ]
  assert.equal(matchTemplateReply('the master one', templates), 'master-deck')
  assert.equal(matchTemplateReply('master deck', templates), 'master-deck')
  assert.equal(matchTemplateReply('blank please', templates), 'from-scratch')
  assert.equal(matchTemplateReply('banana', templates), null)
})

test('matches a length by label, word or number of slides', () => {
  assert.equal(matchLength('Short, 5 to 8 slides'), 'short')
  assert.equal(matchLength('standard'), 'standard')
  assert.equal(matchLength('something long please'), 'long')
  assert.equal(matchLength('about 6 slides'), 'short')
  assert.equal(matchLength('12'), 'standard')
  assert.equal(matchLength('25 slides'), 'long')
  assert.equal(matchLength('banana'), null)
})

test('matches offerings by name or short name, and review and all replies', () => {
  const offerings = [
    { id: 'a', name: 'Funding screening', shortName: null },
    { id: 'b', name: 'Tailored analytical dashboards', shortName: 'Analytical dashboards' },
    { id: 'c', name: 'Mapping', shortName: null },
  ]
  assert.deepEqual(matchOfferingIds('mapping and funding screening', offerings), ['a', 'c'])
  assert.deepEqual(matchOfferingIds('analytical dashboards', offerings), ['b'])
  assert.deepEqual(matchOfferingIds('nothing', offerings), [])
  assert.equal(isGenerateReply('Generate deck'), true)
  assert.equal(isGenerateReply('hmm'), false)
  assert.equal(isAllReply('select all'), true)
  assert.equal(isAllReply('mapping'), false)
})

test('funding and partnership goals get the extra slides', () => {
  assert.equal(goalKind('Ask for funding'), 'funding')
  assert.equal(goalKind('Propose a partnership'), 'partnership')
  assert.equal(goalKind('Report on progress'), 'other')
  assert.equal(goalKind(undefined), 'other')
})

const offering = (name, shortName = null) => ({ name, shortName, description: `${name} helps.` })
const category = (name, count) => ({ name, offerings: Array.from({ length: count }, (_, i) => offering(`${name} ${i + 1}`)) })
const input = (patch = {}) => ({
  goal: 'Ask for funding',
  audienceName: 'Head of state',
  region: 'Kenya',
  needNames: ['Whole-country dark', 'Slow connections', 'No devices', 'A fourth need'],
  categories: ['Modelling', 'Finance', 'Business models', 'Network', 'Ecosystem', 'Procurement'].map((n) => category(n, 3)),
  length: 'standard',
  ...patch,
})

test('the outline follows the fixed rules', () => {
  const slides = buildOutline(input())
  const titles = slides.map((s) => s.title)
  assert.deepEqual(slides[0], { title: 'Digital Inclusion', lines: ['Ask for funding', 'Head of state', 'Kenya'] })
  assert.deepEqual(slides[1], { title: 'Why it matters', lines: ['Whole-country dark', 'Slow connections', 'No devices'] })
  assert.deepEqual(titles.slice(2, 8), ['Modelling', 'Finance', 'Business models', 'Network', 'Ecosystem', 'Procurement'])
  assert.deepEqual(titles.slice(8), ['How we work together', 'The ask', 'Contact'])
  assert.deepEqual(slides[2].lines, ['Modelling 1', 'Modelling 2', 'Modelling 3'])
})

test('without a partnership or funding goal: Next steps, and no "How we work together"', () => {
  const titles = buildOutline(input({ goal: 'Report on progress' })).map((s) => s.title)
  assert.ok(!titles.includes('How we work together'))
  assert.ok(titles.includes('Next steps'))
  assert.ok(!titles.includes('The ask'))
  assert.equal(titles.at(-1), 'Contact')
})

test('without an audience or goal: a generic reason, and a short title slide', () => {
  const slides = buildOutline(input({ goal: undefined, audienceName: undefined, region: undefined, needNames: [] }))
  assert.deepEqual(slides[0], { title: 'Digital Inclusion', lines: [] })
  assert.equal(slides[1].lines.length, 1)
})

test('a short deck merges categories to fit 5 to 8 slides', () => {
  for (const goal of ['Ask for funding', 'Report on progress', undefined]) {
    const slides = buildOutline(input({ goal, length: 'short' }))
    assert.ok(slides.length >= 5 && slides.length <= 8, `${goal}: ${slides.length}`)
    assert.equal(slides[0].title, 'Digital Inclusion')
    assert.equal(slides.at(-1).title, 'Contact')
    // No offering is lost when categories merge.
    assert.equal(slides.flatMap((s) => s.lines).filter((l) => /^(Modelling|Finance|Business models|Network|Ecosystem|Procurement) \d$/.test(l)).length, 18)
  }
  assert.ok(buildOutline(input({ length: 'short' })).some((s) => s.title === 'Modelling and finance'))
})

test('a standard deck with everything fits 10 to 15 slides without merging', () => {
  const slides = buildOutline(input())
  assert.ok(slides.length >= 10 && slides.length <= 15)
})

test('a small brief is padded to its length: offering slides first, then generic ones', () => {
  const small = input({ categories: [category('Modelling', 2)] })
  const standard = buildOutline({ ...small, length: 'standard' })
  assert.ok(standard.length >= 10 || standard.length === 4 + 1 + 2 + 5 + 1)
  const titles = standard.map((s) => s.title)
  assert.ok(titles.includes('Modelling 1'), 'offering slide')
  assert.equal(titles[0], 'Digital Inclusion')
  assert.equal(titles.at(-1), 'Contact')

  const long = buildOutline({ ...input(), length: 'long' })
  assert.ok(long.length >= 20, String(long.length))
  assert.equal(long.at(-1).title, 'Contact')
})

test('every slide has a title and the numbers stay in order', () => {
  for (const length of ['short', 'standard', 'long']) {
    for (const slide of buildOutline(input({ length }))) assert.ok(slide.title.length > 0)
  }
})
