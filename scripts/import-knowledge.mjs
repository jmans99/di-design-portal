#!/usr/bin/env node
/**
 * Import the Knowledge data (audiences, needs, offerings) from the review
 * cockpit into data/knowledge/*.json.
 *
 *   node scripts/import-knowledge.mjs [path/to/review-cockpit/data/appdata.json]
 *
 * Default source: ../review-cockpit/data/appdata.json (a clone of
 * jmans99/review-cockpit next to this repo).
 *
 * Only names, descriptions, groupings and links are imported. Evidence,
 * excerpts, sources and counts are never read into the output.
 *
 * Everything you may want to correct lives in the tables right below:
 * AUDIENCE_GROUPS, AUDIENCE_GROUP_MAP, AUDIENCE_OVERRIDES,
 * OFFERING_CATEGORIES, OFFERING_CATEGORY_MAP and TEXT_OVERRIDES.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.resolve(process.argv[2] ?? path.join(ROOT, '..', 'review-cockpit', 'data', 'appdata.json'))
const OUT = path.join(ROOT, 'data', 'knowledge')

// ── Audience groups ──────────────────────────────────────────────────────
// The nine Digital Inclusion audience groups, in display order.
const AUDIENCE_GROUPS = [
  { id: 'governments', name: 'Governments' },
  { id: 'public-sector-funders-donors', name: 'Public sector funders and donors' },
  { id: 'private-sector-funders-donors', name: 'Private sector funders and donors' },
  { id: 'public-sector-partners', name: 'Public sector partners' },
  { id: 'private-sector-partners', name: 'Private sector partners' },
  { id: 'operators-providers', name: 'Operators and providers' },
  { id: 'unicef', name: 'UNICEF' },
  { id: 'community', name: 'Community' },
  { id: 'civil-society', name: 'Civil society' },
]

// Cockpit audience group (audGroups[].id) → Digital Inclusion audience group.
// null = no clear match yet: those audiences are imported with
// audienceGroupId null and are not shown on screen until mapped.
const AUDIENCE_GROUP_MAP = {
  'heads-of-state': 'governments',
  'government-institutions': 'governments',
  'funders-igos': 'public-sector-funders-donors',
  'donors-private': 'private-sector-funders-donors',
  'operators-vendors': 'operators-providers',
  'civil-society': 'civil-society',
  'school-institutions': null, // delivery points: public sector partners?
  'health-institutions': null, // delivery points: public sector partners?
  'children-communities': 'community',
  'patients-mothers': 'community',
  'internal-unicef': 'unicef',
}

// Single audiences that belong somewhere other than their cockpit group.
const AUDIENCE_OVERRIDES = {
  'multilateral-igo': 'public-sector-partners', // UN agencies / IGOs in coordination and standard-setting roles, not funders
  'local-entrepreneur': 'community', // individual innovators, farmers, gig workers, not operators
}

// ── Offering categories ──────────────────────────────────────────────────
const OFFERING_CATEGORIES = [
  { id: 'modelling', name: 'Modelling' },
  { id: 'finance', name: 'Finance' },
  { id: 'sustainable-business-models', name: 'Sustainable business models' },
  { id: 'network-data-solutions', name: 'Network and data solutions' },
  { id: 'ecosystem-readiness', name: 'Ecosystem readiness' },
  { id: 'procurement', name: 'Procurement' },
]

// Cockpit offering category (solutions[].id) → offering category. null = not imported.
const OFFERING_CATEGORY_MAP = {
  modelling: 'modelling',
  finance: 'finance',
  'sustainable-business-models': 'sustainable-business-models',
  'network-data-solutions': 'network-data-solutions',
  'ecosystem-building': 'ecosystem-readiness',
  procurement: 'procurement',
  'technology-advocacy-tools': null, // advocacy products, not one of the six categories
}

// ── Text fixes ───────────────────────────────────────────────────────────
// Names are converted to sentence case (see sentenceCase below). Use this
// table for names that need a fixed spelling, and for descriptions that use
// research vocabulary. Keys are "<kind>:<id>.<field>".
const TEXT_OVERRIDES = {
  'audience:national-government.description':
    'Generic state actor, used when government is addressed broadly rather than a specific ministry.',
  'audience:ministry-of-education.name': 'Ministry of Education',
  'audience:ministry-of-health.name': 'Ministry of Health',
  'audience:ministry-of-ict.name': 'Ministry of ICT',
  'audience:finance-minister.name': 'Finance minister / treasury',
  'audience:country-office.name': 'UNICEF country office',
  'offering:x-as-a-hub.name': 'X as a hub',
  'offering:ifi-engagement.name': 'IFI engagement strategy',
}

// Words kept as written when sentence-casing (acronyms and proper nouns).
const KEEP_CASE = new Set(['AI', 'ICT', 'MNCH', 'NGO', 'IGO', 'IFI', 'ISP', 'UNICEF', 'M&E', 'TA', 'GTEP', 'GEP', 'Geneva'])

// ─────────────────────────────────────────────────────────────────────────

function sentenceCase(text) {
  const lower = text
    .split(/(\s+|\/|-)/)
    .map((part) => (KEEP_CASE.has(part.replace(/[^A-Za-z&]/g, '')) ? part : part.toLowerCase()))
    .join('')
  return lower.replace(/[A-Za-z]/, (c) => c.toUpperCase())
}

const usedOverrides = new Set()
const text = (kind, id, field, value) => {
  const key = `${kind}:${id}.${field}`
  if (!(key in TEXT_OVERRIDES)) return value
  usedOverrides.add(key)
  return TEXT_OVERRIDES[key]
}
const name = (kind, id, value) => text(kind, id, 'name', sentenceCase(value))

const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
const unmapped = []

// Audiences
const audiences = []
for (const group of data.audGroups) {
  if (!(group.id in AUDIENCE_GROUP_MAP)) throw new Error(`Audience group "${group.id}" is missing from AUDIENCE_GROUP_MAP`)
  for (const a of group.atoms ?? []) {
    const audienceGroupId = AUDIENCE_OVERRIDES[a.id] ?? AUDIENCE_GROUP_MAP[group.id]
    if (!audienceGroupId) unmapped.push(`audience ${a.id} (cockpit group ${group.id})`)
    audiences.push({
      id: a.id,
      name: name('audience', a.id, a.label),
      description: text('audience', a.id, 'description', a.def),
      audienceGroupId,
    })
  }
}

// Needs and need groups
const needGroups = data.painGroups.map((g) => ({ id: g.id, name: name('needGroup', g.id, g.label) }))
const offeringIds = new Set()
const offeringCategories = OFFERING_CATEGORIES
const offerings = []
for (const cat of data.solutions) {
  if (!(cat.id in OFFERING_CATEGORY_MAP)) throw new Error(`Offering category "${cat.id}" is missing from OFFERING_CATEGORY_MAP`)
  const offeringCategoryId = OFFERING_CATEGORY_MAP[cat.id]
  if (!offeringCategoryId) {
    unmapped.push(`offering category ${cat.id} (${cat.services.map((s) => s.id).join(', ')})`)
    continue
  }
  for (const s of cat.services) {
    offeringIds.add(s.id)
    offerings.push({
      id: s.id,
      name: name('offering', s.id, s.label),
      description: text('offering', s.id, 'description', s.desc),
      offeringCategoryId,
    })
  }
}

const needs = data.painGroups.flatMap((g) =>
  g.atoms.map((n) => ({
    id: n.id,
    name: name('need', n.id, n.label),
    statement: text('need', n.id, 'statement', n.need),
    needGroupId: g.id,
    offeringIds: (data.mappings[n.id] ?? []).filter((id) => offeringIds.has(id)),
  })),
)

// Audience ↔ need links: presence of a link only, never its counts.
const needIds = new Set(needs.map((n) => n.id))
const audienceIds = new Set(audiences.map((a) => a.id))
const audienceNeeds = data.graph.atom_edges
  .filter((e) => audienceIds.has(e.audience) && needIds.has(e.pain))
  .map((e) => ({ audienceId: e.audience, needId: e.pain }))

// Audience ↔ offering links, derived through needs. The cockpit has no
// off / included / lead state, so none is set.
const needOfferings = new Map(needs.map((n) => [n.id, n.offeringIds]))
const linkMap = new Map()
for (const { audienceId, needId } of audienceNeeds) {
  for (const offeringId of needOfferings.get(needId)) {
    const key = `${audienceId}|${offeringId}`
    if (!linkMap.has(key)) linkMap.set(key, { audienceId, offeringId, needIds: [] })
    linkMap.get(key).needIds.push(needId)
  }
}
const audienceOfferings = [...linkMap.values()]

const unusedOverrides = Object.keys(TEXT_OVERRIDES).filter((key) => !usedOverrides.has(key))
if (unusedOverrides.length) throw new Error(`TEXT_OVERRIDES keys match nothing: ${unusedOverrides.join(', ')}`)

fs.mkdirSync(OUT, { recursive: true })
const write = (file, value) => fs.writeFileSync(path.join(OUT, file), JSON.stringify(value, null, 2) + '\n')
write('audience-groups.json', AUDIENCE_GROUPS)
write('audiences.json', audiences)
write('need-groups.json', needGroups)
write('needs.json', needs)
write('offering-categories.json', offeringCategories)
write('offerings.json', offerings)
write('audience-needs.json', audienceNeeds)
write('audience-offerings.json', audienceOfferings)

console.log(`Read ${path.relative(process.cwd(), SOURCE)}`)
console.log(
  `Wrote ${AUDIENCE_GROUPS.length} audience groups, ${audiences.length} audiences, ${needGroups.length} need groups, ` +
    `${needs.length} needs, ${offeringCategories.length} offering categories, ${offerings.length} offerings, ` +
    `${audienceNeeds.length} audience-need links, ${audienceOfferings.length} audience-offering links to data/knowledge/`,
)
if (unmapped.length) console.log(`Not mapped (fix the tables at the top of this script):\n  - ${unmapped.join('\n  - ')}`)
