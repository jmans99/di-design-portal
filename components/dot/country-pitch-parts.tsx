'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clock, FileText, FlaskConical, Quote } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TEXT_BUTTON } from '@/components/dot/demo-parts'
import {
  formatDate,
  statusLabel,
  type Fact,
  type Gap,
  type OfferingStatus,
  type PitchOffering,
  type PitchRecord,
  type PitchSlide,
} from '@/lib/dot/country-pitch-demo'
import { buildCountryPath } from '@/lib/social-media/projection'
import { getCountryFeature } from '@/lib/social-media/silhouette-loader'
import { cn } from '@/lib/utils'

/**
 * The Country pitch demo's pieces (docs/design/dot-home.md, "Country pitch
 * demo (testing)"): the source chip and its popover, the status pills, the
 * country snapshot card and the slides. The slides are generated output, so
 * they keep the master deck colours in both themes (like the template
 * previews); everything around them uses the theme tokens.
 */

// ---- Sources ------------------------------------------------------------------

/** A small chip under a figure: the source title. Opens the exact wording and who committed and validated it. */
export function SourceChip({
  fact,
  open,
  onOpenChange,
  className,
  quiet = false,
}: {
  fact: Pick<Fact, 'id' | 'excerpt' | 'source'> & { label?: string; title?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  /** Autoplay: focus stays where it is when it opens and closes (no focus ring in the video). */
  quiet?: boolean
}) {
  const name = fact.label ?? fact.title ?? fact.source.title
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Source for ${name}: ${fact.source.title}`}
          className={cn(
            'focus-ring inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-line-card bg-card px-2 text-[11px] text-ink-muted transition-colors hover:bg-hover-soft hover:text-ink data-[state=open]:border-chosen-border data-[state=open]:bg-chosen data-[state=open]:text-link',
            className,
          )}
        >
          <FileText className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
          <span className="truncate">{fact.source.title}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[320px] rounded-xl border-line-card p-4 shadow-menu"
        onOpenAutoFocus={(e) => quiet && e.preventDefault()}
        onCloseAutoFocus={(e) => quiet && e.preventDefault()}
      >
        <p className="text-xs text-ink-muted">Exact wording</p>
        <blockquote className="mt-1 border-l-2 border-chosen-border pl-3 text-sm leading-relaxed text-ink">&ldquo;{fact.excerpt}&rdquo;</blockquote>
        <dl className="mt-3 grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-xs">
          <dt className="text-ink-muted">Source</dt>
          <dd className="text-ink">{fact.source.title}</dd>
          <dt className="text-ink-muted">Type</dt>
          <dd className="text-ink">{fact.source.type}</dd>
          <dt className="text-ink-muted">Committed by</dt>
          <dd className="text-ink">{fact.source.committedBy}</dd>
          <dt className="text-ink-muted">Validated by</dt>
          <dd className="text-ink">{fact.source.validatedBy}</dd>
          <dt className="text-ink-muted">Date</dt>
          <dd className="text-ink">{formatDate(fact.source.date)}</dd>
        </dl>
      </PopoverContent>
    </Popover>
  )
}

// ---- Status pills ---------------------------------------------------------------

const STATUS_ICON = { available: Check, pilot: FlaskConical, 'not-yet': Clock, unknown: Clock } as const

/** Available / Pilot / Not yet in Kenya, in the theme colours. Text and icon, never colour alone. */
export function StatusPill({ status, country, long = false, className }: { status: OfferingStatus | 'unknown'; country: string; long?: boolean; className?: string }) {
  const Icon = STATUS_ICON[status]
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 text-[11px] font-semibold',
        status === 'available' && 'bg-chosen text-link',
        status === 'pilot' && 'bg-subtle text-ink-secondary',
        (status === 'not-yet' || status === 'unknown') && 'border border-dashed border-line-dashed font-normal text-ink-muted',
        className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} aria-hidden />
      {statusLabel(status, country, long)}
    </span>
  )
}

// ---- Snapshot -------------------------------------------------------------------

export type SnapshotProps = {
  country: { name: string; iso: string }
  audience: { name: string; groupName?: string }
  figures: Fact[]
  statusFact: Fact
  offerings: { id: string; name: string; shortName: string | null; status: OfferingStatus | 'unknown' }[]
  caseStudy?: PitchRecord
  needs: { name: string; statement: string }[]
  gaps: Gap[]
  openFact: string | null
  onOpenFact: (id: string | null) => void
  quiet?: boolean
}

const SECTION_LABEL = 'text-xs text-ink-muted'

/** "Here's what DI knows about Kenya": figures, offerings by status, the latest case study, the audience's top needs and the gaps. */
export function SnapshotCard({ country, audience, figures, statusFact, offerings, caseStudy, needs, gaps, openFact, onOpenFact, quiet }: SnapshotProps) {
  const toggle = (id: string) => (open: boolean) => onOpenFact(open ? id : null)
  const groups: { status: OfferingStatus; items: typeof offerings }[] = (['available', 'pilot', 'not-yet'] as const).map((status) => ({
    status,
    items: offerings.filter((o) => (status === 'not-yet' ? o.status === 'not-yet' || o.status === 'unknown' : o.status === status)),
  }))

  return (
    <section aria-label={`What DI knows about ${country.name}`} className="overflow-hidden rounded-2xl border border-line-card bg-card">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line-divider px-5 py-3.5">
        <h2 className="flex items-baseline gap-2 font-heading text-[17px] font-semibold text-ink">
          {country.name}
          <span className="text-xs font-normal text-ink-muted">{country.iso}</span>
        </h2>
        <span className="inline-flex h-7 items-center rounded-full bg-subtle px-2.5 text-xs text-ink">
          {audience.name}
          {audience.groupName && <span className="ml-1 text-ink-muted">· {audience.groupName}</span>}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">
        <div>
          <h3 className={SECTION_LABEL}>Connectivity</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {figures.map((f) => (
              <li key={f.id} className="flex min-w-0 flex-col rounded-xl bg-subtle/60 p-3">
                <span className="font-heading text-[22px] font-semibold leading-tight text-ink">{f.value}</span>
                <span className="mt-0.5 line-clamp-2 min-h-[36px] text-xs text-ink-secondary">{f.label}</span>
                <SourceChip fact={f} open={openFact === f.id} onOpenChange={toggle(f.id)} quiet={quiet} className="mt-2 self-start" />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={SECTION_LABEL}>DI offerings in {country.name}</h3>
            <SourceChip fact={statusFact} open={openFact === statusFact.id} onOpenChange={toggle(statusFact.id)} quiet={quiet} />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {groups.map(({ status, items }) => (
              <div key={status} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                <span className="w-[132px] shrink-0 pt-0.5">
                  <StatusPill status={status} country={country.name} />
                  <span className="sr-only">: {items.length} offerings</span>
                </span>
                <ul className="flex flex-wrap gap-1.5" aria-label={statusLabel(status, country.name, true)}>
                  {items.map((o) => (
                    <li key={o.id} className="rounded-md border border-line-card px-1.5 py-0.5 text-xs text-ink-secondary">
                      {o.shortName ?? o.name}
                    </li>
                  ))}
                  {items.length === 0 && <li className="text-xs text-ink-muted">None</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <h3 className={SECTION_LABEL}>Latest case study</h3>
            {caseStudy ? (
              <div className="mt-2">
                <p className="font-heading text-sm font-semibold text-ink">{caseStudy.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {caseStudy.team} · {formatDate(caseStudy.date)}
                </p>
                <blockquote className="mt-2 border-l-2 border-chosen-border pl-3 text-[13px] leading-relaxed text-ink-secondary">&ldquo;{caseStudy.excerpt}&rdquo;</blockquote>
                <SourceChip fact={caseStudy} open={openFact === caseStudy.id} onOpenChange={toggle(caseStudy.id)} quiet={quiet} className="mt-2" />
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-ink-muted">No case study committed yet.</p>
            )}
          </div>
          <div className="min-w-0">
            <h3 className={SECTION_LABEL}>What the {audience.name} needs most</h3>
            <ol className="mt-2 flex flex-col gap-2">
              {needs.slice(0, 3).map((n, i) => (
                <li key={n.name} className="flex gap-2.5">
                  <span aria-hidden className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chosen text-[11px] font-semibold text-link">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink">{n.name}</span>
                    <span className="block text-xs text-ink-secondary">{n.statement}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] text-ink-muted">From DI knowledge: Audiences</p>
          </div>
        </div>

        {gaps.map((gap) => (
          <div key={gap.id} data-gap="" className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-dashed border-line-dashed px-3.5 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">Gap flagged, not filled</p>
              <p className="text-[13px] font-semibold text-ink">{gap.label}</p>
              <p className="text-xs text-ink-secondary">{gap.detail}</p>
            </div>
            {/* Demo only: it does nothing. */}
            <button type="button" className={cn(TEXT_BUTTON, 'shrink-0')}>
              Ask {gap.owner}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---- Country shape ----------------------------------------------------------------

const shapes = new Map<string, Promise<string | null>>()

/** The country's outline as an SVG path (1040x740), from the world atlas file the social media tool uses. Local, no external call. */
function loadShape(iso: string) {
  if (!shapes.has(iso)) {
    shapes.set(
      iso,
      getCountryFeature(iso)
        .then((feature) => (feature ? buildCountryPath(feature) : null))
        .catch(() => null),
    )
  }
  return shapes.get(iso)!
}

/** The country silhouette in white on the title slide's blue panel; nothing while it loads or if it can't. */
function CountryShape({ iso, name }: { iso: string; name: string }) {
  const [path, setPath] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    loadShape(iso).then((d) => live && setPath(d))
    return () => {
      live = false
    }
  }, [iso])
  if (!path) return null
  return (
    <svg viewBox="0 0 1040 740" role="img" aria-label={`Map of ${name}`} className="h-[78%] w-[78%]">
      <path d={path} className="fill-white/90" />
    </svg>
  )
}

// ---- Slides -------------------------------------------------------------------

/** A footnote marker. */
function Note({ n, light = false }: { n: number | undefined; light?: boolean }) {
  if (!n) return null
  return <sup className={cn('ml-[0.25em] align-super text-[0.5em] font-semibold', light ? 'text-primary-200' : 'text-primary-700')}>{n}</sup>
}

/** Status pill on a slide: fixed master deck colours. */
function SlideStatus({ status, country, n }: { status: OfferingStatus | 'unknown'; country: string; n?: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-[0.8cqw] py-[0.2cqw] text-[length:1.15cqw] font-semibold leading-tight',
        status === 'available' && 'bg-primary-50 text-primary-700',
        status === 'pilot' && 'bg-navy/[0.06] text-navy/80',
        (status === 'not-yet' || status === 'unknown') && 'border border-dashed border-navy/30 font-normal text-navy/60',
      )}
    >
      {statusLabel(status, country, true)}
      <Note n={n} />
    </span>
  )
}

function SlideLogo({ light = false }: { light?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={light ? '/logos/unicef-digital-inclusion-white.svg' : '/logos/unicef-digital-inclusion-blue.svg'}
      alt=""
      className="h-[2.4cqw] w-auto"
    />
  )
}

const SLIDE_TITLE = 'font-heading text-[length:3.3cqw] font-semibold leading-[1.12] tracking-[-0.02em]'
const SLIDE_EYEBROW = 'font-heading text-[length:1.3cqw] font-semibold text-primary-700'

/** The short name of a slide, for captions, the dialog and screen readers. */
export function slideName(slide: PitchSlide): string {
  switch (slide.kind) {
    case 'title':
      return 'Title'
    case 'why':
      return 'Why it matters'
    case 'offerings':
      return slide.title
    case 'offering':
      return slide.offering.name
    case 'proof':
      return 'Proof'
    case 'how':
      return 'How we work together'
    case 'ask':
      return slide.title
    case 'contact':
      return 'Contact'
  }
}

/** One 16:9 slide, drawn in container units so the thumbnail and the large view are the same slide. */
export function PitchSlideView({
  slide,
  number,
  notes,
  country,
}: {
  slide: PitchSlide
  number: number
  notes: Map<string, number>
  country: { name: string; iso: string }
}) {
  const dark = slide.kind === 'ask' || slide.kind === 'contact'
  const footnotes = slide.cites.map((id) => notes.get(id)).filter((n): n is number => !!n)
  const footer = (
    <div className="absolute inset-x-[5cqw] bottom-[2.6cqw] flex items-end justify-between gap-[2cqw]">
      <SlideLogo light={dark} />
      <span className={cn('flex items-baseline gap-[2.4cqw] text-[length:1.05cqw]', dark ? 'text-white/70' : 'text-navy/55')}>
        {footnotes.length > 0 && <span>Sources {footnotes.join(', ')}</span>}
        <span className="font-semibold">{number}</span>
      </span>
    </div>
  )

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-white font-sans text-navy [container-type:inline-size]">
      {slide.kind === 'title' && (
        <div className="absolute inset-0 grid grid-cols-[58fr_42fr]">
          <div className="flex flex-col justify-center px-[5cqw] pb-[6cqw]">
            <p className={SLIDE_EYEBROW}>{slide.eyebrow}</p>
            <h3 className="mt-[1.4cqw] font-heading text-[length:4.6cqw] font-semibold leading-[1.06] tracking-[-0.02em]">{slide.title}</h3>
            <p className="mt-[1.6cqw] text-[length:1.8cqw] leading-snug text-navy/70">{slide.subtitle}</p>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <CountryShape iso={country.iso} name={country.name} />
          </div>
        </div>
      )}

      {slide.kind === 'why' && (
        <div className="absolute inset-0 px-[5cqw] pt-[4.5cqw]">
          <h3 className={SLIDE_TITLE}>{slide.title}</h3>
          <div className="mt-[3cqw] grid grid-cols-[1.45fr_1fr] gap-[3.5cqw]">
            <ol className="flex flex-col gap-[2cqw]">
              {slide.needs.map((n, i) => (
                <li key={n.name} className="flex gap-[1.4cqw]">
                  <span className="flex h-[3cqw] w-[3cqw] shrink-0 items-center justify-center rounded-full bg-primary-50 font-heading text-[length:1.4cqw] font-semibold text-primary-700">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-heading text-[length:1.8cqw] font-semibold leading-tight">{n.name}</span>
                    <span className="mt-[0.4cqw] block text-[length:1.3cqw] leading-snug text-navy/70">{n.statement}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-[1.6cqw]">
              {slide.figures.map((f) => (
                <div key={f.id} className="rounded-[1.4cqw] bg-primary-50 px-[2cqw] py-[1.6cqw]">
                  <p className="font-heading text-[length:4.4cqw] font-semibold leading-none tracking-[-0.02em] text-primary-700">
                    {f.value}
                    <Note n={notes.get(f.id)} />
                  </p>
                  <p className="mt-[0.8cqw] text-[length:1.3cqw] leading-snug text-navy/75">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {slide.kind === 'offerings' && <OfferingsSlide slide={slide} notes={notes} country={country.name} />}

      {slide.kind === 'offering' && (
        <div className="absolute inset-0 px-[5cqw] pt-[4.5cqw]">
          <p className={SLIDE_EYEBROW}>{slide.eyebrow}</p>
          <h3 className={cn(SLIDE_TITLE, 'mt-[1cqw] max-w-[70cqw]')}>{slide.offering.name}</h3>
          <p className="mt-[2cqw] max-w-[62cqw] text-[length:2cqw] leading-snug text-navy/75">{slide.offering.description}</p>
          <div className="mt-[3cqw] flex items-center gap-[1.4cqw]">
            <SlideStatus status={slide.offering.status} country={country.name} n={notes.get(slide.cites[0])} />
            <span className="text-[length:1.4cqw] text-navy/65">{slide.offering.note}</span>
          </div>
        </div>
      )}

      {slide.kind === 'proof' && (
        <div className="absolute inset-0 px-[5cqw] pt-[4.5cqw]">
          <p className={SLIDE_EYEBROW}>Proof</p>
          <h3 className={cn(SLIDE_TITLE, 'mt-[1cqw]')}>{slide.title}</h3>
          {slide.record && (
            <figure className="mt-[2.6cqw] flex gap-[1.6cqw]">
              <Quote className="h-[3.4cqw] w-[3.4cqw] shrink-0 text-primary-500" strokeWidth={2} aria-hidden />
              <div>
                <blockquote className="text-[length:2.1cqw] leading-[1.4]">&ldquo;{slide.record.excerpt}&rdquo;</blockquote>
                <figcaption className="mt-[1.2cqw] text-[length:1.3cqw] text-navy/60">
                  {slide.record.source.title} · {slide.record.team} · {formatDate(slide.record.date)}
                  <Note n={notes.get(slide.record.id)} />
                </figcaption>
              </div>
            </figure>
          )}
          {slide.gaps.map((gap) => (
            <p
              key={gap.id}
              className="mt-[2.4cqw] flex items-center gap-[1cqw] rounded-[1.2cqw] border-[0.15cqw] border-dashed border-navy/30 px-[1.8cqw] py-[1.3cqw] text-[length:1.45cqw] text-navy/70"
            >
              <AlertTriangle className="h-[1.8cqw] w-[1.8cqw] shrink-0" strokeWidth={2} aria-hidden />
              {gap.slideNote}
            </p>
          ))}
        </div>
      )}

      {slide.kind === 'how' && (
        <div className="absolute inset-0 px-[5cqw] pt-[4.5cqw]">
          <h3 className={SLIDE_TITLE}>{slide.title}</h3>
          <ol className="mt-[3cqw] grid grid-cols-3 gap-[2.4cqw]">
            {slide.steps.map((s, i) => (
              <li key={s.title} className="border-t-[0.25cqw] border-primary-500 pt-[1.4cqw]">
                <span className="font-heading text-[length:2.6cqw] font-semibold text-primary-500">{i + 1}</span>
                <span className="mt-[0.6cqw] block font-heading text-[length:1.8cqw] font-semibold leading-tight">{s.title}</span>
                <span className="mt-[0.6cqw] block text-[length:1.3cqw] leading-snug text-navy/70">{s.text}</span>
              </li>
            ))}
          </ol>
          {slide.record && (
            <div className="mt-[3cqw] rounded-[1.4cqw] bg-primary-50 px-[2.2cqw] py-[1.6cqw]">
              <p className="text-[length:1.2cqw] text-navy/60">From our last meeting, {formatDate(slide.record.date)}</p>
              <p className="mt-[0.5cqw] text-[length:1.7cqw] leading-snug">
                &ldquo;{slide.record.excerpt}&rdquo;
                <Note n={notes.get(slide.record.id)} />
              </p>
            </div>
          )}
        </div>
      )}

      {slide.kind === 'ask' && (
        <div className="absolute inset-0 bg-navy px-[5cqw] pt-[4.5cqw] text-white">
          <p className="font-heading text-[length:1.3cqw] font-semibold text-primary-300">The ask</p>
          <h3 className={cn(SLIDE_TITLE, 'mt-[1cqw]')}>{slide.title}</h3>
          <ul className="mt-[3cqw] flex flex-col gap-[1.8cqw]">
            {slide.lines.map((line, i) => (
              <li key={line} className="flex items-start gap-[1.4cqw] text-[length:2cqw] leading-snug">
                <Check className="mt-[0.3cqw] h-[2.2cqw] w-[2.2cqw] shrink-0 text-primary-300" strokeWidth={2.5} aria-hidden />
                <span>
                  {line}
                  {i < slide.lines.length - 1 && <Note n={notes.get(slide.cites[0])} light />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {slide.kind === 'contact' && (
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-[5cqw] pb-[5cqw] text-white">
          <h3 className="font-heading text-[length:5cqw] font-semibold leading-none tracking-[-0.02em]">{slide.title}</h3>
          <div className="mt-[2.4cqw] flex flex-col gap-[0.6cqw] text-[length:1.8cqw] text-white/85">
            {slide.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      )}

      {slide.kind !== 'title' && footer}
      {slide.kind === 'title' && (
        <div className="absolute bottom-[2.6cqw] left-[5cqw]">
          <SlideLogo />
        </div>
      )}
    </div>
  )
}

function OfferingsSlide({ slide, notes, country }: { slide: Extract<PitchSlide, { kind: 'offerings' }>; notes: Map<string, number>; country: string }) {
  const n = slide.offerings.length
  const cols = n <= 2 ? n : n <= 4 ? 2 : 3
  const compact = n > 6
  const roomy = n <= 2
  return (
    <div className="absolute inset-0 px-[5cqw] pt-[4.5cqw]">
      <p className={SLIDE_EYEBROW}>{slide.eyebrow}</p>
      <h3 className={cn(SLIDE_TITLE, 'mt-[1cqw]')}>{slide.title}</h3>
      <ul className={cn('mt-[2.4cqw] grid', compact ? 'gap-[1cqw]' : 'gap-[1.6cqw]')} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {slide.offerings.map((o: PitchOffering) => (
          <li
            key={o.id}
            className={cn(
              'flex flex-col rounded-[1.2cqw] border-[0.1cqw] border-navy/10',
              compact ? 'px-[1.4cqw] py-[1cqw]' : roomy ? 'px-[2.4cqw] py-[2.2cqw]' : 'px-[1.8cqw] py-[1.5cqw]',
              n === 1 && 'max-w-[56cqw]',
            )}
          >
            <SlideStatus status={o.status} country={country} n={notes.get(slide.cites[0])} />
            <span className={cn('mt-[0.9cqw] font-heading font-semibold leading-tight', compact ? 'text-[length:1.45cqw]' : roomy ? 'text-[length:2.3cqw]' : 'text-[length:1.75cqw]')}>
              {o.name}
            </span>
            {!compact && o.description && (
              <span className={cn('mt-[0.6cqw] line-clamp-3 leading-snug text-navy/70', roomy ? 'text-[length:1.6cqw]' : 'text-[length:1.25cqw]')}>{o.description}</span>
            )}
            {!compact && o.note && (
              <span className={cn('mt-auto border-t-[0.1cqw] border-navy/10 pt-[0.8cqw] text-navy/60', roomy ? 'mt-[1.6cqw] text-[length:1.35cqw]' : 'mt-[1cqw] text-[length:1.1cqw]')}>
                {o.note}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A slide large, with Prev and Next (also the arrow keys) and its sources. */
export function SlideDialog({
  slides,
  index,
  onIndexChange,
  notes,
  country,
  sources,
  quiet = false,
}: {
  slides: PitchSlide[]
  index: number | null
  onIndexChange: (index: number | null) => void
  notes: Map<string, number>
  country: { name: string; iso: string }
  sources: Map<string, Pick<Fact, 'source'> & { label: string }>
  /** Autoplay: focus stays where it is when it opens and closes (no focus ring in the video). */
  quiet?: boolean
}) {
  const slide = index === null ? undefined : slides[index]
  const prev = () => index !== null && index > 0 && onIndexChange(index - 1)
  const next = () => index !== null && index < slides.length - 1 && onIndexChange(index + 1)
  const cited = slide ? slide.cites.filter((id) => notes.has(id)) : []
  return (
    <Dialog open={index !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        className="max-w-[min(1120px,calc(100vw-2rem))] gap-3 rounded-2xl border-line-card bg-card p-4 sm:p-5"
        onOpenAutoFocus={(e) => quiet && e.preventDefault()}
        onCloseAutoFocus={(e) => quiet && e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev()
          if (e.key === 'ArrowRight') next()
        }}
      >
        {slide && index !== null && (
          <>
            <DialogTitle className="pr-8 text-sm font-semibold text-ink">
              Slide {index + 1} of {slides.length}: {slideName(slide)}
            </DialogTitle>
            <DialogDescription className="sr-only">Use Prev and Next, or the arrow keys, to move between slides.</DialogDescription>
            <div className="overflow-hidden rounded-xl border border-line-card">
              <PitchSlideView slide={slide} number={index + 1} notes={notes} country={country} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-xs text-ink-muted">
                {cited.length > 0
                  ? cited.map((id) => `${notes.get(id)}. ${sources.get(id)?.source.title ?? ''}`).join(' · ')
                  : 'No figures on this slide.'}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={index === 0}
                  className="focus-ring inline-flex h-9 items-center gap-1 rounded-full border border-line-card bg-card px-3 text-sm text-ink transition-colors hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={index === slides.length - 1}
                  className="focus-ring inline-flex h-9 items-center gap-1 rounded-full border border-line-card bg-card px-3 text-sm text-ink transition-colors hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
