import Link from 'next/link'
import { ArrowRight, Images, PlayCircle } from 'lucide-react'

const SECTIONS = [
  {
    href: '/logos',
    label: 'Logos',
    title: 'Logo variants',
    description: 'All color variants, orientations, and partner lockups. SVG, PNG, JPEG.',
    preview: 'logos',
  },
  {
    href: '/illustrations',
    label: 'Illustrations',
    title: 'Pictograms',
    description: 'Fill and outline pictograms in Giga Blue or White, every format.',
    preview: 'illustrations',
  },
  {
    href: '/colors',
    label: 'Colors',
    title: 'Brand palette',
    description: 'Primary, neutral, and semantic tokens — hex values ready to copy.',
    preview: 'colors',
  },
  {
    href: '/typography',
    label: 'Typography',
    title: 'Type system',
    description: 'Manrope for headings, Open Sans for body. Scale, weights, and usage.',
    preview: 'typography',
  },
  {
    href: '/media',
    label: 'Media',
    title: 'Photo & video library',
    description: 'Curated assets across Flickr, UNICEF, SharePoint, and YouTube.',
    preview: 'media',
  },
  {
    href: '/guidelines/video',
    label: 'Guidelines',
    title: 'Video guidelines',
    description: 'Brand rules and asset specs for Giga video and broadcast content.',
    preview: 'video',
  },
] as const

export default function HomePage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      {/* Hero */}
      <div
        className="-mx-6 -mt-10 mb-10"
        style={{ background: 'linear-gradient(180deg, hsl(214 100% 97%) 0%, hsl(210 40% 98.3%) 100%)' }}
      >
        <div className="px-6 pb-8 pt-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            Giga · Brand Assets
          </p>
          <h1 className="font-heading text-[2.75rem] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Brand Assets
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Official resources for Giga partners — logos, colors, type, illustrations, and guidelines, all in one place.
          </p>
        </div>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-stripe transition-all duration-300 hover:-translate-y-0.5 hover:shadow-stripe-md"
          >
            {/* Preview area */}
            <SectionPreview type={section.preview} />

            {/* Body */}
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                {section.label}
              </p>
              <h2 className="mt-1 font-heading text-[15px] font-semibold leading-snug text-foreground">
                {section.title}
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {section.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-primary transition-all duration-200 group-hover:gap-2">
                Explore
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Per-section preview areas                                          */
/* ------------------------------------------------------------------ */

function SectionPreview({ type }: { type: string }) {
  const base = 'relative flex h-[140px] w-full items-center justify-center overflow-hidden'
  const heroBg = 'linear-gradient(135deg, hsl(214 100% 96%) 0%, hsl(214 100% 92%) 100%)'

  if (type === 'logos') {
    return (
      <div className={base} style={{ background: heroBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/giga-complete-horizontal.svg"
          alt=""
          aria-hidden
          className="w-[160px] opacity-90"
        />
      </div>
    )
  }

  if (type === 'illustrations') {
    return (
      <div className={base} style={{ background: 'linear-gradient(135deg, hsl(230 80% 97%) 0%, hsl(230 80% 92%) 100%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/fill/mapping.svg"
          alt=""
          aria-hidden
          className="h-16 w-16 opacity-80"
          style={{ filter: 'hue-rotate(0deg)' }}
        />
      </div>
    )
  }

  if (type === 'colors') {
    return (
      <div className={`${base} bg-card px-6`}>
        <div className="flex w-full items-end gap-2">
          {[
            { hex: '#277AFF', h: 'h-16', label: 'Blue' },
            { hex: '#0A2540', h: 'h-12', label: 'Navy' },
            { hex: '#3D3D3D', h: 'h-10', label: 'Dark' },
            { hex: '#E8EDF5', h: 'h-8', label: 'Mist' },
            { hex: '#FFFFFF', h: 'h-6', label: 'White' },
          ].map((s) => (
            <div key={s.hex} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-md border border-border/60 ${s.h}`}
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-[9px] font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'typography') {
    return (
      <div className={base} style={{ background: 'linear-gradient(135deg, hsl(210 40% 97%) 0%, hsl(210 40% 93%) 100%)' }}>
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="font-heading text-[56px] font-bold leading-none tracking-[-0.04em] text-foreground/80"
          >
            Aa
          </span>
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground">
            Manrope · Open Sans
          </span>
        </div>
      </div>
    )
  }

  if (type === 'media') {
    return (
      <div className={base} style={{ background: 'linear-gradient(135deg, hsl(195 80% 97%) 0%, hsl(195 80% 92%) 100%)' }}>
        <Images className="h-14 w-14 text-[hsl(195,70%,55%)] opacity-80" strokeWidth={1.25} />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className={base} style={{ background: 'linear-gradient(135deg, hsl(222 78% 18%) 0%, hsl(222 78% 12%) 100%)' }}>
        <PlayCircle className="h-14 w-14 text-white/70" strokeWidth={1.25} />
      </div>
    )
  }

  return <div className={`${base} bg-muted`} />
}
