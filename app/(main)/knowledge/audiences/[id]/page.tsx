import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { BackLink, BetaNote, KNOWLEDGE_MAIN, SectionTitle, Tag } from '@/components/knowledge/knowledge-ui'
import {
  AUDIENCES,
  getAudience,
  getAudienceGroup,
  getOfferingCategory,
  needsForAudience,
  offeringsForAudience,
} from '@/lib/knowledge'

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

  const needGroups = needsForAudience(audience.id)
  const offerings = offeringsForAudience(audience.id)

  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <BackLink href="/knowledge/audiences">All audiences</BackLink>
      <div className="mb-3">
        <Tag>{getAudienceGroup(audience.audienceGroupId)?.name}</Tag>
      </div>
      <PageHeader title={audience.name} description={audience.description} />

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="needs-title">
          <div id="needs-title">
            <SectionTitle>Needs</SectionTitle>
          </div>
          {needGroups.length > 0 ? (
            <div className="mt-4 flex flex-col gap-6">
              {needGroups.map(({ group, needs }) => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-muted-foreground">{group.name}</h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {needs.map((n) => (
                      <li key={n.id} className="rounded-2xl border border-border bg-card p-4 shadow-stripe">
                        <p className="font-heading text-[15px] font-medium text-foreground">{n.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{n.statement}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No needs recorded for this audience yet.</p>
          )}
        </section>

        <section aria-labelledby="offerings-title">
          <div id="offerings-title">
            <SectionTitle>Offerings that serve them</SectionTitle>
          </div>
          {offerings.length > 0 ? (
            <ul className="mt-4 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card shadow-stripe">
              {offerings.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/knowledge/offerings/${o.id}`}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  >
                    <span className="text-[15px] font-medium text-foreground">{o.name}</span>
                    <span className="text-xs text-muted-foreground">{getOfferingCategory(o.offeringCategoryId)?.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No offerings linked to this audience yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}
