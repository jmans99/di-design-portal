import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { getOfferingCategory, type Need, type NeedGroup, type Offering } from '@/lib/knowledge'

const ICON_STROKE = 1.5

/** Shown at the top of every Knowledge page. */
export function BetaNote() {
  return (
    <p className="mb-6 flex items-start gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={ICON_STROKE} aria-hidden />
      Beta: this content is still being validated by the team.
    </p>
  )
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
      {children}
    </Link>
  )
}

/** Card linking to an audience or offering: name and a one-line description. */
export function KnowledgeCard({ href, title, description }: { href: string; title: string; description?: string | null }) {
  return (
    <Link
      href={href}
      className="block h-full rounded-2xl border border-border bg-card p-4 shadow-stripe transition-smooth hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block font-heading text-[15px] font-medium text-foreground">{title}</span>
      {description && <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</span>}
    </Link>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-xl font-medium text-foreground">{children}</h2>
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  )
}

export const KNOWLEDGE_MAIN = 'mx-auto w-full min-w-0 max-w-6xl flex-1 px-6 pb-16 pt-8'

type NeedGroupWithNeeds = { group: NeedGroup; needs: Need[] }

/**
 * Detail page body for an audience or a facility: its needs grouped by need
 * group, and the offerings that serve it (through those needs).
 */
export function NeedsAndOfferings({
  needGroups,
  offerings,
  subject,
}: {
  needGroups: NeedGroupWithNeeds[]
  offerings: Offering[]
  /** "audience" or "facility", for the empty states. */
  subject: string
}) {
  return (
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
          <p className="mt-2 text-sm text-muted-foreground">No needs recorded for this {subject} yet.</p>
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
          <p className="mt-2 text-sm text-muted-foreground">No offerings linked to this {subject} yet.</p>
        )}
      </section>
    </div>
  )
}
