// The pages read their own lists, search reads data/assets.json: both must give an asset the same brand.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BRAND_ASSETS, logosForBrand } from '../brand-registry.ts'
import { ILLUSTRATIONS, ILLUSTRATIONS_PAGE_BRAND } from '../illustration-registry.ts'
import { PHOTO_AWARD_BRAND } from '../photo-awards.ts'

const ASSETS = JSON.parse(readFileSync(new URL('../../data/assets.json', import.meta.url), 'utf8'))

test('the partnership logo is listed under both Logos tabs, and shared in search', () => {
  const name = 'Giga + UNICEF + ITU'
  assert.ok(logosForBrand('di').some((l) => l.brandName === name))
  assert.ok(logosForBrand('giga').some((l) => l.brandName === name))
  assert.equal(BRAND_ASSETS.find((l) => l.brandName === name).brand, 'both')
  const lockups = ASSETS.filter((a) => a.id.startsWith('giga-unicef-itu'))
  assert.equal(lockups.length, 8)
  assert.ok(lockups.every((a) => a.brand === 'both' && a.page === '/logos'))
})

test('illustrations and photos: the index brand matches the page lists', () => {
  const general = ILLUSTRATIONS.filter((i) => i.category === 'general')
  assert.equal(general.length, 35)
  assert.ok(general.every((i) => i.brand === 'both'))
  assert.equal(ASSETS.filter((a) => a.type === 'illustration' && a.brand === 'both').length, 105)
  assert.equal(ASSETS.filter((a) => a.type === 'illustration' && a.brand === 'giga').length, 19)
  // Pillars and Giga Meter stay Giga, so the page keeps the Giga pill.
  assert.equal(ILLUSTRATIONS_PAGE_BRAND, 'giga')
  assert.equal(PHOTO_AWARD_BRAND, 'both')
  assert.ok(ASSETS.filter((a) => a.type === 'photo').every((a) => a.brand === PHOTO_AWARD_BRAND))
})
