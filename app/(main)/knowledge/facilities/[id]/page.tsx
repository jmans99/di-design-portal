import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { BackLink, BetaNote, KNOWLEDGE_MAIN, NeedsAndOfferings, Tag } from '@/components/knowledge/knowledge-ui'
import { FACILITIES, getFacility, getFacilityGroup, needsForFacility, offeringsForFacility } from '@/lib/knowledge'

export const dynamicParams = false

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ id: f.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const facility = getFacility((await params).id)
  return { title: facility ? `${facility.name} — Facilities` : 'Facilities' }
}

export default async function FacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const facility = getFacility((await params).id)
  if (!facility) notFound()

  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <BackLink href="/knowledge/facilities">All facilities</BackLink>
      <div className="mb-3">
        <Tag>{getFacilityGroup(facility.facilityGroupId)?.name}</Tag>
      </div>
      <PageHeader title={facility.name} description={facility.description} />
      <NeedsAndOfferings
        needGroups={needsForFacility(facility.id)}
        offerings={offeringsForFacility(facility.id)}
        subject="facility"
      />
    </main>
  )
}
