'use client'

import { useState } from 'react'
import { COLOR_SCALES } from '@/lib/color-tokens'
import type { ColorScale } from '@/lib/types'

function ColorSwatch({ name, hex, scaleName }: { name: string; hex: string; scaleName: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-stripe hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.99]"
      title={`Copy ${hex}`}
    >
      <div
        className="h-16 w-full shrink-0"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex w-full flex-col justify-center bg-card px-4 py-3 text-left">
        <span className="font-heading text-xs font-medium text-card-foreground">{name}</span>
        <span className="mt-0.5 font-mono text-[11px] text-muted-foreground transition-all duration-smooth ease-smooth">
          {copied ? 'Copied!' : hex}
        </span>
      </div>
    </button>
  )
}

const PRIMARY_600 = '#277AFF'

const MAIN_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Primary', hex: PRIMARY_600 },
]

/** Scales not shown as their own section (they are summed up in "Connectivity"). */
const HIDDEN_SCALES = ['Connectivity Red', 'Connectivity Green']

/** Defaults to the Giga palette; the Digital Inclusion tab passes its own scales and main colors. */
export function ColorPalette({
  scales = COLOR_SCALES,
  mainColors = MAIN_COLORS,
}: {
  scales?: ColorScale[]
  mainColors?: { name: string; hex: string }[]
} = {}) {
  const visibleScales = scales.filter((scale) => !HIDDEN_SCALES.includes(scale.name))
  const anchorLinks = [
    { label: 'Main', href: '#colors-main' },
    ...visibleScales.map((scale) => ({ label: scale.name, href: `#colors-${scale.name.toLowerCase()}` })),
  ]

  return (
    <div className="flex min-w-0 w-full flex-col gap-10 overflow-visible">
      {/* Anchor links */}
      <div className="flex flex-wrap gap-2">
        {anchorLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-smooth hover:bg-secondary/60 hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Main colors (Giga: White, Black, Primary 600) */}
      <section id="colors-main" className="min-w-0 w-full scroll-mt-24">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Main colors
          </h3>
        </div>
        <div className="grid min-w-0 w-full grid-cols-3 gap-2 sm:flex sm:flex-nowrap sm:gap-2">
          {mainColors.map((color) => (
            <div key={color.name} className="min-w-0 sm:flex-1">
              <ColorSwatch name={color.name} hex={color.hex} scaleName="Main" />
            </div>
          ))}
        </div>
      </section>

      {/* Color scales */}
      {visibleScales.map((scale) => (
        <section
          key={scale.name}
          id={`colors-${scale.name.toLowerCase()}`}
          className="min-w-0 w-full scroll-mt-24"
        >
          <div className="mb-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
                {scale.name}
              </h3>
            </div>
            {scale.description && (
              <p className="text-sm text-muted-foreground">
                {scale.description}
              </p>
            )}
          </div>
          <div className="grid min-w-0 w-full grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-10">
            {scale.tokens.map((token) => (
              <div key={`${scale.name}-${token.name}`} className="min-w-0">
                <ColorSwatch
                  name={token.name}
                  hex={token.hex}
                  scaleName={scale.name}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
