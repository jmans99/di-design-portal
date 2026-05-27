import Link from 'next/link'
import { ArrowUpRight, Mail, Share2, Shapes, Brush, Monitor } from 'lucide-react'
import { Reveal } from '@/components/home/reveal'

const TILE =
  'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-stripe transition-smooth hover-lift'

// Giga Blue tonal scale, dark to light
const COLOR_SCALE = ['#002d9c', '#0050e6', '#277aff', '#5495ff', '#7eb0ff', '#bfd7ff']

export function SystemBento() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
          On brand, without the back-and-forth
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          No more chasing the design team for the right file. The correct asset, in
          the right format, is already here.
        </p>
      </Reveal>

      <Reveal className="grid auto-rows-[minmax(200px,auto)] grid-cols-2 gap-4 lg:grid-cols-4">
        {/* AI Skills — featured by width, kept clean */}
        <Link href="/materials/skills" className={`${TILE} col-span-2 !justify-end`}>
          <div>
            <span className="mb-3 inline-flex rounded-full bg-primary-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
            <h3 className="font-heading text-2xl font-semibold text-foreground">AI Skills</h3>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              The skills the Giga team builds with, packaged and ready to install on
              your AI platform.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-600">
              Get the skills
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Logos */}
        <Link href="/logos" className={TILE}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Shapes className="anim-twist h-5 w-5" />
          </span>
          <TileLabel title="Logos" sub="Every variant and format" className="pt-3" />
        </Link>

        {/* Colors — palette field (kept as-is) */}
        <Link href="/colors" className={`${TILE} !p-0`}>
          <div aria-hidden className="absolute inset-0 flex">
            {COLOR_SCALE.map((c) => (
              <span key={c} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/10 to-transparent"
          />
          <div className="relative mt-auto p-5">
            <h3 className="font-heading text-base font-semibold text-white">Colors</h3>
            <p className="mt-0.5 text-[13px] text-white/85">Palette and tokens</p>
          </div>
        </Link>

        {/* Maps — connectivity map image */}
        <Link href="/materials/maps" className={`${TILE} col-span-2 !p-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/giga-map.png"
            alt=""
            aria-hidden
            className="zoom-on-group-hover absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/25 to-transparent" />
          <div className="relative mt-auto p-5">
            <h3 className="font-heading text-lg font-semibold text-white">Maps</h3>
            <p className="mt-0.5 text-[13px] text-white/80">Connectivity maps for any country.</p>
          </div>
        </Link>

        {/* Typography — clean specimen */}
        <Link href="/typography" className={TILE}>
          <span className="font-heading text-4xl font-semibold leading-none tracking-tight text-foreground">
            Aa
          </span>
          <TileLabel title="Typography" sub="The full type scale" className="pt-3" />
        </Link>

        {/* Illustrations */}
        <Link href="/illustrations" className={TILE}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Brush className="anim-wiggle h-5 w-5" />
          </span>
          <TileLabel title="Illustrations" sub="Fill and outline" className="pt-3" />
        </Link>

        {/* Media — photo */}
        <Link href="/media" className={`${TILE} !p-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/stat-assets.jpg"
            alt=""
            aria-hidden
            className="zoom-on-group-hover absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/20 to-transparent" />
          <div className="relative mt-auto p-5">
            <h3 className="font-heading text-base font-semibold text-white">Media</h3>
            <p className="mt-0.5 text-[13px] text-white/80">Photo and video library</p>
          </div>
        </Link>

        {/* Backgrounds */}
        <Link href="/materials/backgrounds" className={TILE}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Monitor className="anim-bounce h-5 w-5" />
          </span>
          <TileLabel title="Backgrounds" sub="4K backgrounds for calls" className="pt-3" />
        </Link>

        {/* Email signature */}
        <Link href="/materials/email-signature" className={TILE}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Mail className="anim-send h-5 w-5" />
          </span>
          <TileLabel title="Email signature" sub="Build and copy yours" className="pt-3" />
        </Link>

        {/* Social media */}
        <Link href="/materials/social-media" className={TILE}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Share2 className="anim-share h-5 w-5" />
          </span>
          <TileLabel title="Social media" sub="Country announcements" className="pt-3" />
        </Link>
      </Reveal>
    </section>
  )
}

function TileLabel({
  title,
  sub,
  className = '',
}: {
  title: string
  sub: string
  className?: string
}) {
  return (
    <div className={className}>
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{sub}</p>
    </div>
  )
}
