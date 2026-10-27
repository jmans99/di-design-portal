/**
 * Knowledge data (DI site): audiences, needs and offerings, imported from the
 * review cockpit by scripts/import-knowledge.mjs into data/knowledge/.
 */
import audienceGroupsJson from '@/data/knowledge/audience-groups.json'
import audiencesJson from '@/data/knowledge/audiences.json'
import needGroupsJson from '@/data/knowledge/need-groups.json'
import needsJson from '@/data/knowledge/needs.json'
import offeringCategoriesJson from '@/data/knowledge/offering-categories.json'
import offeringsJson from '@/data/knowledge/offerings.json'
import audienceNeedsJson from '@/data/knowledge/audience-needs.json'
import audienceOfferingsJson from '@/data/knowledge/audience-offerings.json'

export type AudienceGroup = { id: string; name: string }
export type Audience = { id: string; name: string; description: string; audienceGroupId: string | null }
export type NeedGroup = { id: string; name: string }
export type Need = { id: string; name: string; statement: string; needGroupId: string; offeringIds: string[] }
export type OfferingCategory = { id: string; name: string }
export type Offering = { id: string; name: string; description: string; offeringCategoryId: string }

export const AUDIENCE_GROUPS: AudienceGroup[] = audienceGroupsJson
/** Audiences mapped to one of the nine audience groups (unmapped ones are not shown). */
export const AUDIENCES: Audience[] = (audiencesJson as Audience[]).filter((a) => a.audienceGroupId !== null)
export const NEED_GROUPS: NeedGroup[] = needGroupsJson
export const NEEDS: Need[] = needsJson
export const OFFERING_CATEGORIES: OfferingCategory[] = offeringCategoriesJson
export const OFFERINGS: Offering[] = offeringsJson

const audienceNeeds: { audienceId: string; needId: string }[] = audienceNeedsJson
const audienceOfferings: { audienceId: string; offeringId: string }[] = audienceOfferingsJson

export const getAudience = (id: string) => AUDIENCES.find((a) => a.id === id)
export const getOffering = (id: string) => OFFERINGS.find((o) => o.id === id)
export const getAudienceGroup = (id: string | null) => AUDIENCE_GROUPS.find((g) => g.id === id)
export const getOfferingCategory = (id: string) => OFFERING_CATEGORIES.find((c) => c.id === id)

/** Audience groups, each with its audiences, in display order. */
export function audiencesByGroup() {
  return AUDIENCE_GROUPS.map((group) => ({
    group,
    audiences: AUDIENCES.filter((a) => a.audienceGroupId === group.id),
  }))
}

/** Offering categories, each with its offerings, in display order. */
export function offeringsByCategory() {
  return OFFERING_CATEGORIES.map((category) => ({
    category,
    offerings: OFFERINGS.filter((o) => o.offeringCategoryId === category.id),
  }))
}

/** An audience's needs, grouped by need group (need group order). */
export function needsForAudience(audienceId: string) {
  const ids = new Set(audienceNeeds.filter((l) => l.audienceId === audienceId).map((l) => l.needId))
  return NEED_GROUPS.map((group) => ({
    group,
    needs: NEEDS.filter((n) => n.needGroupId === group.id && ids.has(n.id)),
  })).filter((g) => g.needs.length > 0)
}

/** Offerings that serve an audience (through its needs), in category order. */
export function offeringsForAudience(audienceId: string) {
  const ids = new Set(audienceOfferings.filter((l) => l.audienceId === audienceId).map((l) => l.offeringId))
  return offeringsByCategory()
    .flatMap(({ offerings }) => offerings)
    .filter((o) => ids.has(o.id))
}

/** Audiences an offering serves, grouped by audience group. */
export function audiencesForOffering(offeringId: string) {
  const ids = new Set(audienceOfferings.filter((l) => l.offeringId === offeringId).map((l) => l.audienceId))
  return audiencesByGroup()
    .map(({ group, audiences }) => ({ group, audiences: audiences.filter((a) => ids.has(a.id)) }))
    .filter((g) => g.audiences.length > 0)
}
