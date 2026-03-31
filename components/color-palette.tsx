'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { COLOR_SCALES } from '@/lib/color-tokens'

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
      className="group flex w-full flex-col rounded-lg border border-border bg-card transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background hover:shadow-md hover:scale-[1.02] active:scale-[0.99]"
      title={`Copy ${hex}`}
    >
      <div
        className="h-16 w-full shrink-0 overflow-visible rounded-t-lg transition-smooth-transform"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex w-full flex-col justify-center overflow-visible rounded-b-lg bg-card px-4 py-3 text-left">
        <span className="text-xs font-semibold text-card-foreground">{name}</span>
        <span className="mt-0.5 font-mono text-[11px] text-muted-foreground transition-all duration-smooth ease-smooth">
          {copied ? 'Copied!' : hex}
        </span>
      </div>
    </button>
  )
}

const PRIMARY_600 = '#277AFF'

const ANCHOR_LINKS = [
  { label: 'Main', href: '#colors-main' },
  { label: 'Primary', href: '#colors-primary' },
  { label: 'Grey', href: '#colors-grey' },
  { label: 'Connectivity', href: '#colors-connectivity' },
]

export function ColorPalette() {
  return (
    <div className="flex min-w-0 w-full flex-col gap-10 overflow-visible">
      {/* Anchor links */}
      <div className="flex flex-wrap gap-2">
        {ANCHOR_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground shadow-sm transition-smooth hover:border-primary hover:bg-accent hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Main colors: White, Black, Primary 600 */}
      <Card id="colors-main" className="min-w-0 w-full overflow-visible rounded-[4px] border-0 bg-transparent shadow-none scroll-mt-24">
        <CardContent className="min-w-0 w-full overflow-visible p-0">
          <div className="mb-4 flex items-center gap-2 overflow-visible">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              Main colors
            </h3>
          </div>
          <div className="grid min-w-0 w-full grid-cols-3 gap-2 overflow-visible p-0 sm:flex sm:flex-nowrap sm:gap-2">
            <div className="min-w-0 overflow-visible sm:flex-1">
              <ColorSwatch name="White" hex="#FFFFFF" scaleName="Main" />
            </div>
            <div className="min-w-0 overflow-visible sm:flex-1">
              <ColorSwatch name="Black" hex="#000000" scaleName="Main" />
            </div>
            <div className="min-w-0 overflow-visible sm:flex-1">
              <ColorSwatch name="Primary" hex={PRIMARY_600} scaleName="Main" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color scales */}
      {COLOR_SCALES.filter((scale) => scale.name !== 'Connectivity Red' && scale.name !== 'Connectivity Green').map((scale) => (
        <Card
          key={scale.name}
          id={`colors-${scale.name.toLowerCase()}`}
          className="min-w-0 w-full scroll-mt-24 overflow-visible rounded-[4px] border-0 bg-transparent shadow-none"
        >
          <CardContent className={`min-w-0 w-full overflow-visible ${scale.name === 'Grey' || scale.name === 'Connectivity' || scale.name === 'Primary' ? 'p-0' : 'p-6'}`}>
            <div className="mb-4 flex flex-col gap-1 overflow-visible">
              <div className="flex items-center gap-2 overflow-visible">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  {scale.name}
                </h3>
              </div>
              {scale.description && (
                <p className="text-sm text-muted-foreground">
                  {scale.description}
                </p>
              )}
            </div>
            <div className="grid min-w-0 w-full grid-cols-3 gap-2 overflow-visible p-0 md:grid-cols-5 lg:grid-cols-10">
              {scale.tokens.map((token) => (
                <div key={`${scale.name}-${token.name}`} className="min-w-0 overflow-visible">
                  <ColorSwatch
                    name={token.name}
                    hex={token.hex}
                    scaleName={scale.name}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
