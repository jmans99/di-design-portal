import { PageHeader } from '@/components/page-header'
import { BetaNote, KNOWLEDGE_MAIN, KnowledgeCard, SectionTitle } from '@/components/knowledge/knowledge-ui'
import { offeringsByCategory } from '@/lib/knowledge'

export const metadata = { title: 'Offerings — Digital Inclusion' }

export default function OfferingsPage() {
  return (
    <main className={KNOWLEDGE_MAIN}>
      <BetaNote />
      <PageHeader
        title="Offerings"
        description="What Digital Inclusion offers, in six categories. Open an offering to see which audiences it serves."
      />
      <div className="flex flex-col gap-10">
        {offeringsByCategory().map(({ category, offerings }) => (
          <section key={category.id} aria-labelledby={`category-${category.id}`}>
            <div id={`category-${category.id}`}>
              <SectionTitle>{category.name}</SectionTitle>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((o) => (
                <li key={o.id}>
                  <KnowledgeCard href={`/knowledge/offerings/${o.id}`} title={o.name} description={o.description} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
