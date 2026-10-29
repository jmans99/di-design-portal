// Unit tests for the keyword asset search, on the real index (data/assets.json). Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuery, searchAssets } from './match.ts'

const ASSETS = JSON.parse(readFileSync(new URL('../../data/assets.json', import.meta.url), 'utf8'))
const search = (q) => searchAssets(q, ASSETS)

test('"I want the logo of Digital Inclusion in black": top result is a DI logo, black', () => {
  const { facets, results } = search('I want the logo of Digital Inclusion in black')
  assert.deepEqual(facets, { type: 'logo', brand: 'di', colour: 'black' })
  assert.equal(results[0].type, 'logo')
  assert.equal(results[0].brand, 'di')
  assert.equal(results[0].colour, 'black')
  assert.equal(results[0].id, 'unicef-digital-inclusion-black')
})

test('"giga logo white": only Giga (and shared) results, top is a white logo', () => {
  const { results } = search('giga logo white')
  assert.ok(results.length > 0)
  assert.ok(results.every((a) => a.brand === 'giga' || a.brand === 'both'))
  assert.equal(results[0].id, 'giga-main-horizontal-white')
  assert.equal(results[0].type, 'logo')
  assert.equal(results[0].colour, 'white')
})

test('"DI logo png": DI logos that have a PNG', () => {
  const { facets, results } = search('DI logo png')
  assert.deepEqual(facets, { brand: 'di', type: 'logo', format: 'png' })
  assert.ok(results.length > 0)
  assert.ok(results.every((a) => (a.brand === 'di' || a.brand === 'both') && a.type === 'logo'))
  assert.ok(results.every((a) => a.formats.some((f) => f.ext === 'png')))
})

test('"dark unicef di logo vertical": DI, black, vertical first', () => {
  const { facets, results } = search('dark unicef di logo vertical')
  assert.deepEqual(facets, { colour: 'black', brand: 'di', type: 'logo', layout: 'vertical' })
  assert.ok(results.every((a) => a.brand === 'di' || a.brand === 'both'))
  assert.equal(results[0].colour, 'black')
  // Ranking: black and vertical (5) before black only (3) before vertical only (2).
  const rank = (a) => (a.colour === 'black' ? 3 : 0) + (a.layout === 'vertical' ? 2 : 0)
  for (let i = 1; i < results.length; i++) assert.ok(rank(results[i - 1]) >= rank(results[i]), `${results[i - 1].id} before ${results[i].id}`)
})

test('"logo": DI logos listed before Giga logos', () => {
  const { results } = search('logo')
  const firstGiga = results.findIndex((a) => a.brand === 'giga')
  const lastDi = results.map((a) => a.brand).lastIndexOf('di')
  assert.ok(firstGiga > 0 && lastDi < firstGiga)
})

test('a nonsense query has no results', () => {
  assert.equal(search('zxqv blorp').results.length, 0)
  assert.equal(search('').results.length, 0)
})

test('multi-word synonyms win over single words, filler words are dropped', () => {
  assert.deepEqual(parseQuery('UNICEF blue logo').facets, { colour: 'blue', type: 'logo' })
  assert.deepEqual(parseQuery('unicef digital inclusion').facets, { brand: 'di' })
  assert.deepEqual(parseQuery('please give me the vector mark').facets, { format: 'svg,pdf', type: 'logo' })
  assert.deepEqual(parseQuery('can you show me some kid drawings').words, ['kid', 'drawings'])
})

test('free words match titles and tags: "gigasync white logo" puts the white GigaSync logo first', () => {
  const { results } = search('gigasync white logo')
  assert.equal(results[0].id, 'product-gigasync-white')
})

test('removed facets are ignored', () => {
  const { facets, results } = searchAssets('giga logo white', ASSETS, ['colour'])
  assert.deepEqual(facets, { brand: 'giga', type: 'logo' })
  assert.ok(results.length > 0)
})

test('shared fonts ("both") come back for DI, Giga and no brand', () => {
  const fonts = ['Manrope font', 'Open Sans font']
  for (const q of ['giga font', 'di font', 'font']) {
    const { results } = search(q)
    assert.deepEqual(results.map((a) => a.title).sort(), fonts, q)
    assert.ok(results.every((a) => a.brand === 'both'), q)
  }
})

test('a named brand returns that brand plus "both"; no brand orders DI, both, Giga', () => {
  const both = { id: 'x-both', title: 'Shared logo', type: 'logo', brand: 'both', colour: null, layout: null, formats: [], preview: null, page: '/', tags: [] }
  const giga = { ...both, id: 'x-giga', title: 'Giga logo', brand: 'giga' }
  const di = { ...both, id: 'x-di', title: 'DI logo', brand: 'di' }
  const order = (q) => searchAssets(q, [giga, both, di]).results.map((a) => a.brand)
  assert.deepEqual(order('logo'), ['di', 'both', 'giga'])
  assert.deepEqual(order('giga logo'), ['giga', 'both'])
  assert.deepEqual(order('di logo'), ['di', 'both'])
})

test('newly shared material comes back for DI: illustrations, photos, the partnership logo', () => {
  const ill = search('DI illustration').results
  assert.ok(ill.length === 105 && ill.every((a) => a.type === 'illustration' && a.brand === 'both'), `DI illustration: ${ill.length}`)
  const photos = search('DI photo').results
  assert.ok(photos.length === 48 && photos.every((a) => a.type === 'photo' && a.brand === 'both'), `DI photo: ${photos.length}`)
  const { results } = search('DI partnership logo')
  assert.ok(results[0].id.startsWith('giga-unicef-itu') && results[0].brand === 'both', results[0].id)
  assert.equal(results.filter((a) => a.id.startsWith('giga-unicef-itu')).length, 8)
  // Giga still gets its own illustrations plus the shared ones.
  const giga = search('Giga illustration').results
  assert.ok(giga.length === 124 && giga.some((a) => a.brand === 'giga') && giga.some((a) => a.brand === 'both'))
  assert.ok(giga.findIndex((a) => a.brand === 'both') > giga.map((a) => a.brand).lastIndexOf('giga'), 'Giga-only first, then shared')
})
