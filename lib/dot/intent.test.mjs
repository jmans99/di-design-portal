// Unit tests for Dot's keyword matcher. Run with `npm test` (Node 22 strips the TypeScript types).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSkip, matchAudienceGroup, matchFormat, matchIntent, matchTemplate } from './intent.ts'

test('matches each format from its keywords', () => {
  const cases = {
    'I need a deck for Kenya': 'deck',
    'some SLIDES please': 'deck',
    'a presentation on connectivity': 'deck',
    'social post for the launch': 'social-post',
    'Instagram announcement': 'social-post',
    'something for LinkedIn': 'social-post',
    'a two-pager on finance': 'two-pager',
    'two pager': 'two-pager',
    '2-pager for donors': 'two-pager',
    'one-pager': 'two-pager',
    'a short brief': 'two-pager',
    'map of schools in Ghana': 'map',
    'maps': 'map',
    'engagement map': 'engagement-map',
    'which countries are engaged? engagement': 'engagement-map',
    'background for zoom': 'background',
    'Teams call': 'background',
    'email signature': 'email-signature',
    'my signature': 'email-signature',
  }
  for (const [text, expected] of Object.entries(cases)) assert.equal(matchFormat(text), expected, text)
})

test('does not match words inside other words', () => {
  assert.equal(matchFormat('roadmap'), null)
  assert.equal(matchFormat('postal'), null)
  assert.equal(matchFormat('hello there'), null)
})

test('pre-picks Master deck when "master" appears with deck', () => {
  assert.deepEqual(matchIntent('the master deck for governments'), { kind: 'format', outputType: 'deck', templateId: 'master-deck' })
  assert.deepEqual(matchIntent('a deck'), { kind: 'format', outputType: 'deck' })
  assert.deepEqual(matchIntent('master map'), { kind: 'format', outputType: 'map' })
  assert.deepEqual(matchIntent('nothing here'), { kind: 'none' })
})

test('matches deck templates', () => {
  assert.equal(matchTemplate('the master one'), 'master-deck')
  assert.equal(matchTemplate('from scratch'), 'from-scratch')
  assert.equal(matchTemplate('for partners'), 'partnership-deck')
  assert.equal(matchTemplate('a government briefing'), 'government-briefing')
  assert.equal(matchTemplate('not sure'), null)
})

test('matches audience groups and skip', () => {
  const groups = [
    { id: 'governments', name: 'Governments' },
    { id: 'public-sector-funders-donors', name: 'Public sector funders and donors' },
    { id: 'unicef', name: 'UNICEF' },
  ]
  assert.equal(matchAudienceGroup('for the government', groups)?.id, 'governments')
  assert.equal(matchAudienceGroup('Public sector funders and donors', groups)?.id, 'public-sector-funders-donors')
  assert.equal(matchAudienceGroup('unicef colleagues', groups)?.id, 'unicef')
  assert.equal(matchAudienceGroup('my cat', groups), null)
  assert.equal(isSkip('Skip'), true)
  assert.equal(isSkip('anyone really'), true)
  assert.equal(isSkip('governments'), false)
})

test('create or find', () => {
  const kind = (q) => matchIntent(q).kind
  assert.deepEqual(matchIntent('make a social post'), { kind: 'format', outputType: 'social-post' })
  assert.deepEqual(matchIntent('make a virtual background'), { kind: 'format', outputType: 'background' })
  assert.deepEqual(matchIntent('background for teams'), { kind: 'search', query: 'background for teams', offerBackground: true })
  assert.equal(kind('I want the logo of Digital Inclusion in black'), 'search')
  assert.equal(kind('giga logo white'), 'search')
  assert.equal(kind('DI logo png'), 'search')
  assert.equal(kind('logo'), 'search')
  assert.equal(kind('where is the sudan story'), 'search')
  assert.equal(kind('a deck for donors'), 'format')
  assert.equal(kind('teams call'), 'format')
  assert.equal(kind('illustration of a map'), 'search')
  assert.equal(matchIntent('logo').offerBackground, false)
  assert.equal(kind('zxqv blorp'), 'none')
})
