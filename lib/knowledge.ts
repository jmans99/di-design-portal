/**
 * Knowledge data (DI site): audiences, facilities, needs and offerings,
 * imported from the review cockpit by scripts/import-knowledge.mjs into
 * data/knowledge/.
 */
import audienceGroupsJson from '@/data/knowledge/audience-groups.json'
import audiencesJson from '@/data/knowledge/audiences.json'
import needGroupsJson from '@/data/knowledge/need-groups.json'
import needsJson from '@/data/knowledge/needs.json'
import offeringCategoriesJson from '@/data/knowledge/offering-categories.json'
import offeringsJson from '@/data/knowledge/offerings.json'
import audienceNeedsJson from '@/data/knowledge/audience-needs.json'
import audienceOfferingsJson from '@/data/knowledge/audience-offerings.json'
import facilityGroupsJson from '@/data/knowledge/facility-groups.json'
import facilitiesJson from '@/data/knowledge/facilities.json'
import facilityNeedsJson from '@/data/knowledge/facility-needs.json'
import facilityOfferingsJson from '@/data/knowledge/facility-offerings.json'

export type AudienceGroup = { id: string; name: string }
export type Audience = { id: string; name: string; description: string; audienceGroupId: string | null }
export type FacilityGroup = { id: string; name: string }
export type Facility = { id: string; name: string; description: string; facilityGroupId: string }
export type NeedGroup = { id: string; name: string }
export type Need = { id: string; name: string; statement: string; needGroupId: string; offeringIds: string[] }
export type OfferingCategory = { id: string; name: string }
export type Offering = {
  id: string
  name: string
  /** Short name for tight spaces (later use); null when the full name is short already. */
  shortName: string | null
  /** null when the offering has no match in the cockpit data yet. */
  description: string | null
  offeringCategoryId: string
}

export const AUDIENCE_GROUPS: AudienceGroup[] = audienceGroupsJson
/** Audiences mapped to one of the nine audience groups (unmapped ones are not shown). */
export const AUDIENCES: Audience[] = (audiencesJson as Audience[]).filter((a) => a.audienceGroupId !== null)
export const FACILITY_GROUPS: FacilityGroup[] = facilityGroupsJson
export const FACILITIES: Facility[] = facilitiesJson
export const NEED_GROUPS: NeedGroup[] = needGroupsJson
export const NEEDS: Need[] = needsJson
export const OFFERING_CATEGORIES: OfferingCategory[] = offeringCategoriesJson
export const OFFERINGS: Offering[] = offeringsJson

const audienceNeeds: { audienceId: string; needId: string }[] = audienceNeedsJson
const audienceOfferings: { audienceId: string; offeringId: string }[] = audienceOfferingsJson
const facilityNeeds: { facilityId: string; needId: string }[] = facilityNeedsJson
const facilityOfferings: { facilityId: string; offeringId: string }[] = facilityOfferingsJson

export const getAudience = (id: string) => AUDIENCES.find((a) => a.id === id)
export const getOffering = (id: string) => OFFERINGS.find((o) => o.id === id)
export const getAudienceGroup = (id: string | null) => AUDIENCE_GROUPS.find((g) => g.id === id)
export const getFacility = (id: string) => FACILITIES.find((f) => f.id === id)
export const getFacilityGroup = (id: string) => FACILITY_GROUPS.find((g) => g.id === id)
export const getOfferingCategory = (id: string) => OFFERING_CATEGORIES.find((c) => c.id === id)

/** Audience groups, each with its audiences, in display order. */
export function audiencesByGroup() {
  return AUDIENCE_GROUPS.map((group) => ({
    group,
    audiences: AUDIENCES.filter((a) => a.audienceGroupId === group.id),
  }))
}

/** Facility groups, each with its facilities, in display order. */
export function facilitiesByGroup() {
  return FACILITY_GROUPS.map((group) => ({
    group,
    facilities: FACILITIES.filter((f) => f.facilityGroupId === group.id),
  }))
}

/** Offering categories, each with its offerings, in display order. */
export function offeringsByCategory() {
  return OFFERING_CATEGORIES.map((category) => ({
    category,
    offerings: OFFERINGS.filter((o) => o.offeringCategoryId === category.id),
  }))
}

/** Needs with the given ids, grouped by need group (need group order). */
function groupNeeds(ids: Set<string>) {
  return NEED_GROUPS.map((group) => ({
    group,
    needs: NEEDS.filter((n) => n.needGroupId === group.id && ids.has(n.id)),
  })).filter((g) => g.needs.length > 0)
}

/** Offerings with the given ids, in category order. */
function orderedOfferings(ids: Set<string>) {
  return offeringsByCategory()
    .flatMap(({ offerings }) => offerings)
    .filter((o) => ids.has(o.id))
}

/** An audience's needs, grouped by need group. */
export function needsForAudience(audienceId: string) {
  return groupNeeds(new Set(audienceNeeds.filter((l) => l.audienceId === audienceId).map((l) => l.needId)))
}

/** Offerings that serve an audience (through its needs), in category order. */
export function offeringsForAudience(audienceId: string) {
  return orderedOfferings(new Set(audienceOfferings.filter((l) => l.audienceId === audienceId).map((l) => l.offeringId)))
}

/** A facility's needs, grouped by need group. */
export function needsForFacility(facilityId: string) {
  return groupNeeds(new Set(facilityNeeds.filter((l) => l.facilityId === facilityId).map((l) => l.needId)))
}

/** Offerings that serve a facility (through its needs), in category order. */
export function offeringsForFacility(facilityId: string) {
  return orderedOfferings(new Set(facilityOfferings.filter((l) => l.facilityId === facilityId).map((l) => l.offeringId)))
}

/** Audiences an offering serves, grouped by audience group. */
export function audiencesForOffering(offeringId: string) {
  const ids = new Set(audienceOfferings.filter((l) => l.offeringId === offeringId).map((l) => l.audienceId))
  return audiencesByGroup()
    .map(({ group, audiences }) => ({ group, audiences: audiences.filter((a) => ids.has(a.id)) }))
    .filter((g) => g.audiences.length > 0)
}

/** Facilities an offering serves (through their needs), grouped by facility group. */
export function facilitiesForOffering(offeringId: string) {
  const ids = new Set(facilityOfferings.filter((l) => l.offeringId === offeringId).map((l) => l.facilityId))
  return facilitiesByGroup()
    .map(({ group, facilities }) => ({ group, facilities: facilities.filter((f) => ids.has(f.id)) }))
    .filter((g) => g.facilities.length > 0)
}
