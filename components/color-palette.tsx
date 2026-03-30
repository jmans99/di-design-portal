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
      className="group flex w-full flex-col rounded-lg border border-grey-200 bg-white transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background hover:shadow-md hover:scale-[1.02] active:scale-[0.99]"
      title={`Copy ${hex}`}
    >
      <div
        className="h-[54px] w-full shrink-0 overflow-visible rounded-t-lg transition-smooth-transform"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex w-full flex-col justify-center overflow-visible rounded-b-lg bg-white px-4 py-3 text-left">
        <span className="text-xs font-semibold text-grey-900">{name}</span>
        <span className="mt-0.5 font-mono text-[11px] text-grey-600 transition-all duration-smooth ease-smooth">
          {copied ? 'Copied!' : hex}
        </span>
      </div>
    </button>
  )
}

const PRIMARY_600 = '#277AFF'

export function ColorPalette() {
  return (
    <div className="flex min-w-0 w-full flex-col gap-10 overflow-visible">
      <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground">
        Colors
      </h2>

      {/* Main colors: White, Black, Primary 600 */}
      <Card className="min-w-0 w-full overflow-visible rounded-[4px] border-0 bg-transparent shadow-none">
        <CardContent className="min-w-0 w-full overflow-visible p-0">
          <div className="mb-4 flex items-center gap-2 overflow-visible">
            <h3 className="text-base font-semibold text-foreground">
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
          className="min-w-0 w-full overflow-visible rounded-[4px] border-0 bg-transparent shadow-none"
        >
          <CardContent className={`min-w-0 w-full overflow-visible ${scale.name === 'Grey' || scale.name === 'Connectivity' || scale.name === 'Primary' ? 'p-0' : 'p-6'}`}>
            <div className="mb-4 flex flex-col gap-1 overflow-visible">
              <div className="flex items-center gap-2 overflow-visible">
                <h3 className="text-base font-semibold text-foreground">
                  {scale.name}
                </h3>
              </div>
              {scale.description && (
                <p className="pl-4 text-sm text-muted-foreground">
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
