import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { BackLink, BetaNote, KNOWLEDGE_MAIN, NeedsAndOfferings, Tag } from '@/components/knowledge/knowledge-ui'
import { AUDIENCES, getAudience, getAudienceGroup, needsForAudience, offeringsForAudience } from '@/lib/knowledge'

export const dynamicParams = false

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ id: a.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const audience = getAudience((await params).id)
  return { title: audience ? `${audience.name} — Audiences` : 'Audiences' }
}

export default async function AudiencePage({ params }: { params: Promise<{ id: string }> }) {
  const audience = getAudience((await params).id)
  if (!audience) notFound()

  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <BackLink href="/knowledge/audiences">All audiences</BackLink>
      <div className="mb-3">
        <Tag>{getAudienceGroup(audience.audienceGroupId)?.name}</Tag>
      </div>
      <PageHeader title={audience.name} description={audience.description} />
      <NeedsAndOfferings
        needGroups={needsForAudience(audience.id)}
        offerings={offeringsForAudience(audience.id)}
        subject="audience"
      />
    </main>
  )
}
