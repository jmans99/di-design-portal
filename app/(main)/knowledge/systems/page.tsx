import { PageHeader } from '@/components/page-header'
import { BetaNote, KNOWLEDGE_MAIN, KnowledgeCard, SectionTitle } from '@/components/knowledge/knowledge-ui'
import { systemsByGroup } from '@/lib/knowledge'

export const metadata = { title: 'Systems — Digital Inclusion' }

export default function SystemsPage() {
  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <PageHeader
        title="Systems"
        description="The education and health systems, services and institutions that connectivity supports. Open a system to see what it needs and which offerings serve it."
      />
      <div className="flex flex-col gap-10">
        {systemsByGroup().map(({ group, systems }) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div id={`group-${group.id}`}>
              <SectionTitle>{group.name}</SectionTitle>
            </div>
            {systems.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {systems.map((s) => (
                  <li key={s.id}>
                    <KnowledgeCard href={`/knowledge/systems/${s.id}`} title={s.name} description={s.description} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No systems in this group yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
