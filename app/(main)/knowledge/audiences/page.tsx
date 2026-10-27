import { PageHeader } from '@/components/page-header'
import { BetaNote, KNOWLEDGE_MAIN, KnowledgeCard, SectionTitle } from '@/components/knowledge/knowledge-ui'
import { audiencesByGroup } from '@/lib/knowledge'

export const metadata = { title: 'Audiences — Digital Inclusion' }

export default function AudiencesPage() {
  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <PageHeader
        title="Audiences"
        description="Who Digital Inclusion talks to, in nine audience groups. Open an audience to see what it needs and which offerings serve it."
      />
      <div className="flex flex-col gap-10">
        {audiencesByGroup().map(({ group, audiences }) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div id={`group-${group.id}`}>
              <SectionTitle>{group.name}</SectionTitle>
            </div>
            {audiences.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {audiences.map((a) => (
                  <li key={a.id}>
                    <KnowledgeCard href={`/knowledge/audiences/${a.id}`} title={a.name} description={a.description} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No audiences in this group yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
