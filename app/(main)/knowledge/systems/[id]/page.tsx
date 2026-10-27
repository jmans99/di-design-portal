import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { BackLink, BetaNote, KNOWLEDGE_MAIN, NeedsAndOfferings, Tag } from '@/components/knowledge/knowledge-ui'
import { SYSTEMS, getSystem, getSystemGroup, needsForSystem, offeringsForSystem } from '@/lib/knowledge'

export const dynamicParams = false

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const system = getSystem((await params).id)
  return { title: system ? `${system.name} — Systems` : 'Systems' }
}

export default async function SystemPage({ params }: { params: Promise<{ id: string }> }) {
  const system = getSystem((await params).id)
  if (!system) notFound()

  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <BackLink href="/knowledge/systems">All systems</BackLink>
      <div className="mb-3">
        <Tag>{getSystemGroup(system.systemGroupId)?.name}</Tag>
      </div>
      <PageHeader title={system.name} description={system.description} />
      <NeedsAndOfferings
        needGroups={needsForSystem(system.id)}
        offerings={offeringsForSystem(system.id)}
        subject="system"
      />
    </main>
  )
}
