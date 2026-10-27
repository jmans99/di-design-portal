import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

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
export function KnowledgeCard({ href, title, description }: { href: string; title: string; description?: string }) {
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
