import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { BackLink, BetaNote, KNOWLEDGE_MAIN, KnowledgeCard, SectionTitle, Tag } from '@/components/knowledge/knowledge-ui'
import { OFFERINGS, audiencesForOffering, facilitiesForOffering, getOffering, getOfferingCategory } from '@/lib/knowledge'

export const dynamicParams = false

export function generateStaticParams() {
  return OFFERINGS.map((o) => ({ id: o.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const offering = getOffering((await params).id)
  return { title: offering ? `${offering.name} — Offerings` : 'Offerings' }
}

export default async function OfferingPage({ params }: { params: Promise<{ id: string }> }) {
  const offering = getOffering((await params).id)
  if (!offering) notFound()

  const audienceGroups = audiencesForOffering(offering.id)
  const facilityGroups = facilitiesForOffering(offering.id)

  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <BackLink href="/knowledge/offerings">All offerings</BackLink>
      <div className="mb-3">
        <Tag>{getOfferingCategory(offering.offeringCategoryId)?.name}</Tag>
      </div>
      <PageHeader title={offering.name} description={offering.description ?? undefined} />

      <section aria-labelledby="audiences-title">
        <div id="audiences-title">
          <SectionTitle>Audiences it serves</SectionTitle>
        </div>
        {audienceGroups.length > 0 ? (
          <div className="mt-4 flex flex-col gap-6">
            {audienceGroups.map(({ group, audiences }) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-muted-foreground">{group.name}</h3>
                <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {audiences.map((a) => (
                    <li key={a.id}>
                      <KnowledgeCard href={`/knowledge/audiences/${a.id}`} title={a.name} description={a.description} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No audiences linked to this offering yet.</p>
        )}
      </section>

      {facilityGroups.length > 0 && (
        <section aria-labelledby="facilities-title" className="mt-10">
          <div id="facilities-title">
            <SectionTitle>Facilities it serves</SectionTitle>
          </div>
          <div className="mt-4 flex flex-col gap-6">
            {facilityGroups.map(({ group, facilities }) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-muted-foreground">{group.name}</h3>
                <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {facilities.map((f) => (
                    <li key={f.id}>
                      <KnowledgeCard href={`/knowledge/facilities/${f.id}`} title={f.name} description={f.description} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
