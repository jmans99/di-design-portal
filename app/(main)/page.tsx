import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroGradient } from '@/components/hero-gradient'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LOGO_PREVIEWS = [
  { src: '/logos/giga-complete-horizontal.svg', bg: '#F0F6FF', label: 'Bicolor' },
  { src: '/logos/giga-complete-horizontal.svg', bg: '#277AFF', label: 'Blue', invert: false, tint: true },
  { src: '/logos/giga-main-horizontal.svg', bg: '#161616', label: 'White' },
  { src: '/logos/giga-main-horizontal.svg', bg: '#F5F5F5', label: 'Black' },
]

const ILLUSTRATION_PREVIEWS = [
  '/illustrations/fill/mapping.svg',
  '/illustrations/fill/finance.svg',
  '/illustrations/fill/development.svg',
  '/illustrations/fill/contract.svg',
  '/illustrations/fill/model.svg',
  '/illustrations/outlines/capacity-development-blue.svg',
]

const BRAND_COLORS = [
  { name: 'Giga Blue', hex: '#277AFF' },
  { name: 'Navy', hex: '#0A2540' },
  { name: 'Dark', hex: '#3D3D3D' },
  { name: 'Light', hex: '#E8EDF5' },
  { name: 'White', hex: '#FFFFFF' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible">

      {/* ── Hero ── */}
      <section className="relative -mx-0 overflow-hidden px-6 pb-24 pt-24 text-center">
        {/* Shader gradient background */}
        <HeroGradient />

        {/* Content */}
        <div className="relative z-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Giga · Brand Assets
          </p>
          <h1 className="font-heading mx-auto max-w-2xl text-[3.25rem] font-normal leading-[1.07] tracking-[-0.03em] text-foreground text-balance">
            One place for all Giga brand resources
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            Official logos, colors, typography, illustrations, and guidelines — ready to download for authorized Giga partners.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/logos"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-stripe transition-all duration-200 hover:brightness-110 hover:shadow-stripe-md active:scale-[0.98]"
            >
              Explore logos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/guidelines/video"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card/80 px-6 text-sm font-semibold text-foreground shadow-stripe backdrop-blur-sm transition-all duration-200 hover:shadow-stripe-md active:scale-[0.98]"
            >
              View guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* ── Logos ── */}
      <section className="border-b border-border px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Logos</p>
            <h2 className="font-heading text-[2rem] font-normal leading-[1.15] tracking-[-0.025em] text-foreground">
              Every logo variant,<br />ready to download
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Bicolor, blue, white, black — in horizontal and vertical orientations, with and without partner lockups. SVG, PNG, and JPEG.
            </p>
            <Link
              href="/logos"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-2.5"
            >
              Go to Logos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Visual */}
          <div className="grid grid-cols-2 gap-3">
            {LOGO_PREVIEWS.map((logo, i) => (
              <div
                key={i}
                className="flex h-[110px] items-center justify-center rounded-xl border border-border/60 p-5"
                style={{ backgroundColor: logo.bg }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.label}
                  className="max-h-8 w-auto max-w-full"
                  style={logo.bg === '#161616' ? { filter: 'brightness(0) invert(1)' } : logo.tint ? { filter: 'brightness(0) invert(1)' } : {}}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Colors ── */}
      <section className="border-b border-border px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Visual — left on this section */}
          <div className="order-2 lg:order-1">
            <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-8 shadow-stripe">
              {BRAND_COLORS.map((color, i) => {
                const heights = ['h-28', 'h-20', 'h-16', 'h-12', 'h-8']
                return (
                  <div key={color.hex} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-lg border border-border/50 ${heights[i]}`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {color.name}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/70">
                      {color.hex}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Text — right */}
          <div className="order-1 lg:order-2">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Colors</p>
            <h2 className="font-heading text-[2rem] font-normal leading-[1.15] tracking-[-0.025em] text-foreground">
              A palette built<br />for digital and print
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Primary blue, deep navy, neutrals, and semantic tokens — with hex values, usage guidelines, and accessibility notes.
            </p>
            <Link
              href="/colors"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-2.5"
            >
              View palette <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Illustrations ── */}
      <section className="border-b border-border px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Illustrations</p>
            <h2 className="font-heading text-[2rem] font-normal leading-[1.15] tracking-[-0.025em] text-foreground">
              Pictograms for<br />every use case
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Fill and outline styles, Giga Blue or White, downloadable in SVG, PNG, and JPEG at any resolution.
            </p>
            <Link
              href="/illustrations"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-2.5"
            >
              Browse pictograms <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Visual */}
          <div className="grid grid-cols-3 gap-3">
            {ILLUSTRATION_PREVIEWS.map((src, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-xl border border-border bg-card p-5 shadow-stripe"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" aria-hidden className="h-full w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Typography ── */}
      <section className="border-b border-border px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Visual — left */}
          <div className="order-2 lg:order-1 rounded-2xl border border-border bg-card p-10 shadow-stripe">
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Heading — Manrope</p>
                <p className="font-heading text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-foreground">
                  Connecting the world
                </p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Body — Open Sans</p>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  Giga is a UNICEF initiative working to connect every school to the internet and every young person to information, opportunity, and choice.
                </p>
              </div>
              <div className="h-px bg-border" />
              <div className="flex gap-6">
                {['400', '500', '600', '700'].map((w) => (
                  <div key={w} className="flex flex-col items-center gap-1">
                    <span className="font-heading text-xl text-foreground" style={{ fontWeight: w }}>Ag</span>
                    <span className="text-[9px] text-muted-foreground">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text — right */}
          <div className="order-1 lg:order-2">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Typography</p>
            <h2 className="font-heading text-[2rem] font-normal leading-[1.15] tracking-[-0.025em] text-foreground">
              Two fonts.<br />Every context.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Manrope for headlines, Open Sans for body text. Type scale, weights, line heights, and usage rules in one place.
            </p>
            <Link
              href="/typography"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-2.5"
            >
              See type system <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Media + Guidelines (2-col cards) ── */}
      <section className="px-6 py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Media */}
          <Link
            href="/media"
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-stripe transition-all duration-300 hover:-translate-y-0.5 hover:shadow-stripe-md"
          >
            <div
              className="flex h-48 items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(195 80% 96%) 0%, hsl(195 60% 90%) 100%)' }}
            >
              <div className="grid grid-cols-3 gap-2 p-6 opacity-80">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-md"
                    style={{
                      backgroundColor: `hsl(195 ${50 + i * 5}% ${60 + i * 4}%)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Media</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">Photo & video library</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Curated assets across Flickr, UNICEF, SharePoint, and YouTube.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary transition-all duration-200 group-hover:gap-2">
                Explore media <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>

          {/* Video Guidelines */}
          <Link
            href="/guidelines/video"
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-stripe transition-all duration-300 hover:-translate-y-0.5 hover:shadow-stripe-md"
          >
            <div
              className="flex h-48 flex-col items-start justify-end p-8"
              style={{ background: 'linear-gradient(135deg, hsl(222 78% 20%) 0%, hsl(222 78% 12%) 100%)' }}
            >
              <p className="font-heading text-3xl font-semibold leading-tight text-white/90">
                16:9<br />
                <span className="text-white/50">aspect ratio</span>
              </p>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Guidelines</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">Video guidelines</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Brand rules and asset specs for Giga video and broadcast content.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary transition-all duration-200 group-hover:gap-2">
                View guidelines <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

    </main>
  )
}
