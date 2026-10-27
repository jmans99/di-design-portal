#!/usr/bin/env node
/**
 * Import the Knowledge data (audiences, facilities, needs, offerings) from
 * the review cockpit into data/knowledge/*.json.
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
 * AUDIENCE_GROUPS, AUDIENCE_GROUP_MAP, AUDIENCE_OVERRIDES, FACILITY_GROUPS,
 * FACILITIES, OFFERING_CATEGORIES, OFFERINGS and TEXT_OVERRIDES.
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
  'school-institutions': null, // facilities, see FACILITIES
  'health-institutions': null, // facilities, see FACILITIES
  'children-communities': 'community',
  'patients-mothers': 'community',
  'internal-unicef': 'unicef',
}

// Single audiences that belong somewhere other than their cockpit group.
const AUDIENCE_OVERRIDES = {
  'multilateral-igo': 'public-sector-partners', // UN agencies / IGOs in coordination and standard-setting roles, not funders
  'local-entrepreneur': 'community', // individual innovators, farmers, gig workers, not operators
}

// ── Facilities ───────────────────────────────────────────────────────────
// Schools and health institutions are facilities, not audiences. These
// cockpit audiences (audGroups[].atoms[].id) become facilities, keeping
// their needs links.
const FACILITY_GROUPS = [
  { id: 'schools', name: 'Schools' },
  { id: 'health-institutions', name: 'Health institutions' },
]

const FACILITIES = {
  school: 'schools',
  'school-leader': 'schools',
  teacher: 'schools',
  'school-system': 'schools',
  'health-facility': 'health-institutions',
  'health-system': 'health-institutions',
  'health-workforce': 'health-institutions',
  'health-information-system': 'health-institutions',
  'mnch-service': 'health-institutions',
  'child-facing-institution': 'health-institutions',
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

// The official offerings list, in display order. `cockpit` is the matching
// cockpit offering (solutions[].services[].id), matched by meaning: its
// description and needs links are used. null = no cockpit match (the
// offering is shown with its name and category only). Cockpit offerings not
// listed here are not imported.
const OFFERINGS = [
  { id: 'predictive-modelling', name: 'Predictive policy and planning modelling', shortName: 'Policy modelling', category: 'modelling', cockpit: 'predictive-modelling' },
  { id: 'infra-modelling', name: 'Infrastructure modelling', shortName: null, category: 'modelling', cockpit: 'infra-modelling' },
  { id: 'funding-screening', name: 'Funding screening', shortName: null, category: 'finance', cockpit: 'funding-screening' },
  { id: 'investment-case', name: 'Investment case', shortName: null, category: 'finance', cockpit: 'investment-case' },
  { id: 'ifi-engagement', name: 'IFI engagement strategy', shortName: 'IFI engagement', category: 'finance', cockpit: 'ifi-engagement' },
  { id: 'investment-proposal', name: 'Investment proposal', shortName: null, category: 'finance', cockpit: 'investment-proposal' },
  { id: 'connectivity-credits', name: 'Connectivity credits', shortName: null, category: 'sustainable-business-models', cockpit: 'connectivity-credits' },
  { id: 'x-as-a-hub', name: 'X as a hub', shortName: null, category: 'sustainable-business-models', cockpit: 'x-as-a-hub' },
  { id: 'mapping', name: 'Mapping', shortName: null, category: 'network-data-solutions', cockpit: 'mapping' },
  { id: 'real-time-monitoring', name: 'Real-time monitoring', shortName: null, category: 'network-data-solutions', cockpit: 'rtm' },
  { id: 'dashboards', name: 'Tailored analytical dashboards', shortName: 'Analytical dashboards', category: 'network-data-solutions', cockpit: 'dashboards' },
  { id: 'institutional-development', name: 'Institutional development', shortName: null, category: 'ecosystem-readiness', cockpit: 'institutional-development' },
  { id: 'in-country-implementation', name: 'In-country implementation and support', shortName: 'In-country support', category: 'ecosystem-readiness', cockpit: 'in-country-implementation' },
  { id: 'global-convening', name: 'Global convening', shortName: null, category: 'ecosystem-readiness', cockpit: 'global-convening' },
  { id: 'research', name: 'Research', shortName: null, category: 'ecosystem-readiness', cockpit: 'evidence' }, // cockpit "Evidence": M&E, Geneva Research Lab, academic collaboration
  { id: 'delivery-toolkit', name: 'Delivery solutions toolkit', shortName: 'Delivery toolkit', category: 'procurement', cockpit: 'delivery-toolkit' },
  { id: 'supported-procurement', name: 'Supported public procurement', shortName: 'Supported procurement', category: 'procurement', cockpit: 'supported-procurement' },
  { id: 'procurement-on-behalf', name: 'Procurement on behalf of government', shortName: 'Procurement for government', category: 'procurement', cockpit: 'procurement-on-behalf' },
]

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

// Audiences and facilities
const audiences = []
const facilities = []
for (const group of data.audGroups) {
  if (!(group.id in AUDIENCE_GROUP_MAP)) throw new Error(`Audience group "${group.id}" is missing from AUDIENCE_GROUP_MAP`)
  for (const a of group.atoms ?? []) {
    if (a.id in FACILITIES) {
      facilities.push({
        id: a.id,
        name: name('facility', a.id, a.label),
        description: text('facility', a.id, 'description', a.def),
        facilityGroupId: FACILITIES[a.id],
      })
      continue
    }
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

const missingFacilities = Object.keys(FACILITIES).filter((id) => !facilities.some((f) => f.id === id))
if (missingFacilities.length) throw new Error(`FACILITIES ids not found in the cockpit: ${missingFacilities.join(', ')}`)

// Offerings: the official list, with descriptions from the matched cockpit offering
const cockpitOfferings = new Map(data.solutions.flatMap((cat) => cat.services.map((s) => [s.id, s])))
const offeringCategories = OFFERING_CATEGORIES
const offerings = OFFERINGS.map((o) => {
  if (!OFFERING_CATEGORIES.some((c) => c.id === o.category)) throw new Error(`Offering "${o.id}" has unknown category "${o.category}"`)
  if (o.cockpit && !cockpitOfferings.has(o.cockpit)) throw new Error(`Offering "${o.id}": cockpit offering "${o.cockpit}" not found`)
  if (!o.cockpit) unmapped.push(`official offering ${o.id} (no cockpit match: no description or needs links)`)
  return {
    id: o.id,
    name: o.name,
    shortName: o.shortName,
    description: o.cockpit ? text('offering', o.id, 'description', cockpitOfferings.get(o.cockpit).desc) : null,
    offeringCategoryId: o.category,
  }
})
// Cockpit offering id → official offering id
const officialId = new Map(OFFERINGS.filter((o) => o.cockpit).map((o) => [o.cockpit, o.id]))
for (const id of cockpitOfferings.keys()) {
  if (!officialId.has(id)) unmapped.push(`cockpit offering ${id} (no official match, not imported)`)
}

// Needs and need groups
const needGroups = data.painGroups.map((g) => ({ id: g.id, name: name('needGroup', g.id, g.label) }))
const needs = data.painGroups.flatMap((g) =>
  g.atoms.map((n) => ({
    id: n.id,
    name: name('need', n.id, n.label),
    statement: text('need', n.id, 'statement', n.need),
    needGroupId: g.id,
    offeringIds: [...new Set((data.mappings[n.id] ?? []).filter((id) => officialId.has(id)).map((id) => officialId.get(id)))],
  })),
)

// Audience/facility ↔ need links: presence of a link only, never its counts.
const needIds = new Set(needs.map((n) => n.id))
const needLinks = (ids, key) =>
  data.graph.atom_edges.filter((e) => ids.has(e.audience) && needIds.has(e.pain)).map((e) => ({ [key]: e.audience, needId: e.pain }))
const audienceNeeds = needLinks(new Set(audiences.map((a) => a.id)), 'audienceId')
const facilityNeeds = needLinks(new Set(facilities.map((f) => f.id)), 'facilityId')

// Audience/facility ↔ offering links, derived through needs. The cockpit has
// no off / included / lead state, so none is set.
const needOfferings = new Map(needs.map((n) => [n.id, n.offeringIds]))
function offeringLinks(links, key) {
  const linkMap = new Map()
  for (const link of links) {
    for (const offeringId of needOfferings.get(link.needId)) {
      const mapKey = `${link[key]}|${offeringId}`
      if (!linkMap.has(mapKey)) linkMap.set(mapKey, { [key]: link[key], offeringId, needIds: [] })
      linkMap.get(mapKey).needIds.push(link.needId)
    }
  }
  return [...linkMap.values()]
}
const audienceOfferings = offeringLinks(audienceNeeds, 'audienceId')
const facilityOfferings = offeringLinks(facilityNeeds, 'facilityId')

const unusedOverrides = Object.keys(TEXT_OVERRIDES).filter((key) => !usedOverrides.has(key))
if (unusedOverrides.length) throw new Error(`TEXT_OVERRIDES keys match nothing: ${unusedOverrides.join(', ')}`)

fs.mkdirSync(OUT, { recursive: true })
const write = (file, value) => fs.writeFileSync(path.join(OUT, file), JSON.stringify(value, null, 2) + '\n')
write('audience-groups.json', AUDIENCE_GROUPS)
write('audiences.json', audiences)
write('facility-groups.json', FACILITY_GROUPS)
write('facilities.json', facilities)
write('need-groups.json', needGroups)
write('needs.json', needs)
write('offering-categories.json', offeringCategories)
write('offerings.json', offerings)
write('audience-needs.json', audienceNeeds)
write('audience-offerings.json', audienceOfferings)
write('facility-needs.json', facilityNeeds)
write('facility-offerings.json', facilityOfferings)

console.log(`Read ${path.relative(process.cwd(), SOURCE)}`)
console.log(
  `Wrote ${AUDIENCE_GROUPS.length} audience groups, ${audiences.length} audiences, ` +
    `${FACILITY_GROUPS.length} facility groups, ${facilities.length} facilities, ${needGroups.length} need groups, ` +
    `${needs.length} needs, ${offeringCategories.length} offering categories, ${offerings.length} offerings, ` +
    `${audienceNeeds.length} audience-need links, ${audienceOfferings.length} audience-offering links, ` +
    `${facilityNeeds.length} facility-need links, ${facilityOfferings.length} facility-offering links to data/knowledge/`,
)
if (unmapped.length) console.log(`Not mapped (fix the tables at the top of this script):\n  - ${unmapped.join('\n  - ')}`)
