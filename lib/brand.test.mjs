// Brand filters: All / Digital Inclusion / Giga in the URL, and what each one shows.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brandFilterFromParams, brandFromParams, inBrandFilter, withBrand } from './brand.ts'
import { BRAND_ASSETS, logosForFilter } from './brand-registry.ts'

const params = (q) => new URLSearchParams(q)

test('the filter in the URL: no parameter means All; old links still work', () => {
  assert.equal(brandFilterFromParams(params('')), 'all')
  assert.equal(brandFilterFromParams(params('brand=all')), 'all')
  assert.equal(brandFilterFromParams(params('brand=di')), 'di')
  assert.equal(brandFilterFromParams(params('brand=giga')), 'giga')
  assert.equal(brandFilterFromParams(params('palette=giga')), 'giga')
  assert.equal(brandFilterFromParams(params('brand=nope')), 'all')
  // Colors keeps two tabs, Digital Inclusion by default.
  assert.equal(brandFromParams(params('')), 'di')
  assert.equal(brandFromParams(params('palette=giga')), 'giga')
})

test('withBrand drops ?brand= for All and keeps other parameters', () => {
  assert.equal(withBrand('/logos', params('brand=giga&variant=White'), 'all'), '/logos?variant=White')
  assert.equal(withBrand('/logos', params(''), 'all'), '/logos')
  assert.equal(withBrand('/logos', params('palette=giga'), 'di'), '/logos?brand=di')
})

test('All = everything; Digital Inclusion = di + both; Giga = giga + both', () => {
  assert.deepEqual(['di', 'both', 'giga'].filter((b) => inBrandFilter(b, 'all')), ['di', 'both', 'giga'])
  assert.deepEqual(['di', 'both', 'giga'].filter((b) => inBrandFilter(b, 'di')), ['di', 'both'])
  assert.deepEqual(['di', 'both', 'giga'].filter((b) => inBrandFilter(b, 'giga')), ['both', 'giga'])
  const all = logosForFilter('all')
  assert.equal(all.length, BRAND_ASSETS.length)
  assert.equal(all[0].brandName, 'UNICEF Digital Inclusion')
  assert.deepEqual([...new Set(all.map((l) => l.brand))], ['di', 'both', 'giga'])
  assert.ok(logosForFilter('di').every((l) => l.brand !== 'giga'))
  assert.ok(logosForFilter('giga').every((l) => l.brand !== 'di'))
})
