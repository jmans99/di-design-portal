import { PageHeader } from '@/components/page-header'
import { BetaNote, KNOWLEDGE_MAIN, KnowledgeCard, SectionTitle } from '@/components/knowledge/knowledge-ui'
import { facilitiesByGroup } from '@/lib/knowledge'

export const metadata = { title: 'Facilities — Digital Inclusion' }

export default function FacilitiesPage() {
  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <PageHeader
        title="Facilities"
        description="The places where connectivity is delivered: schools and health facilities. Open a facility to see what it needs and which offerings serve it."
      />
      <div className="flex flex-col gap-10">
        {facilitiesByGroup().map(({ group, facilities }) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div id={`group-${group.id}`}>
              <SectionTitle>{group.name}</SectionTitle>
            </div>
            {facilities.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map((f) => (
                  <li key={f.id}>
                    <KnowledgeCard href={`/knowledge/facilities/${f.id}`} title={f.name} description={f.description} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No facilities in this group yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
