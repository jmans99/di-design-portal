'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const HEADING_SAMPLES = [
  { size: 'text-5xl', label: 'text-5xl / 48px', lineHeight: '56px' },
  { size: 'text-4xl', label: 'text-4xl / 36px', lineHeight: '42px' },
  { size: 'text-3xl', label: 'text-3xl / 30px', lineHeight: '36px' },
  { size: 'text-2xl', label: 'text-2xl / 24px', lineHeight: '36px' },
]

const BODY_SAMPLES = [
  { size: 'text-xl', weight: 'font-normal', label: 'text-xl / 20px — Regular 400', content: 'Open Sans at 20px for large body text and introductions.' },
  { size: 'text-lg', weight: 'font-medium', label: 'text-lg / 18px — Medium 500', content: 'Open Sans at 18px for interactive elements and emphasis.' },
  { size: 'text-base', weight: 'font-normal', label: 'text-base / 16px — Regular 400', content: 'Open Sans at 16px for standard body copy and paragraphs.' },
  { size: 'text-sm', weight: 'font-semibold', label: 'text-sm / 14px — Semibold 600', content: 'Open Sans at 14px for section titles and leading headers.' },
  { size: 'text-sm', weight: 'font-normal', label: 'text-sm / 14px — Regular 400', content: 'Open Sans at 14px for secondary text and descriptions.' },
  { size: 'text-xs', weight: 'font-normal', label: 'text-xs / 12px — Regular 400', content: 'Open Sans at 12px for captions, labels, and fine print.' },
]

export function TypographySection() {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-medium text-foreground" id="typography-type">
          Typography
        </h2>
        <p className="text-base text-muted-foreground">
          Two fonts only. Manrope for headings, Open Sans for everything else.
        </p>
      </div>

      {/* Font Cards */}
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-border bg-card shadow-stripe hover-lift">
          <div className="flex min-w-0 flex-col gap-4 p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-2xl font-medium text-foreground">
                  Manrope
                </h3>
                <p className="text-sm text-muted-foreground">
                  Headings only — weight 500
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://fonts.google.com/specimen/Manrope"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google Fonts
                </a>
              </Button>
            </div>
            <div className="min-w-0 overflow-hidden rounded-md border border-border bg-secondary/50 p-4">
              <p className="font-heading text-4xl font-medium text-foreground break-words">
                Aa Bb Cc Dd
              </p>
              <p className="font-heading text-xl font-medium text-muted-foreground break-words">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}
              </p>
              <p className="font-heading text-xl font-medium text-muted-foreground break-words">
                {'abcdefghijklmnopqrstuvwxyz'}
              </p>
              <p className="font-heading text-xl font-medium text-muted-foreground break-words">
                {'0123456789'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for text-2xl (24px) through text-9xl (128px). Always weight 500.
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card shadow-stripe hover-lift">
          <div className="flex min-w-0 flex-col gap-4 p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-2xl font-medium text-foreground">
                  Open Sans
                </h3>
                <p className="text-sm text-muted-foreground">
                  Body text — weights 400, 500, 600
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://fonts.google.com/specimen/Open+Sans"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google Fonts
                </a>
              </Button>
            </div>
            <div className="min-w-0 overflow-hidden rounded-md border border-border bg-secondary/50 p-4">
              <p className="font-sans text-4xl font-normal text-foreground break-words">
                Aa Bb Cc Dd
              </p>
              <p className="font-sans text-xl font-normal text-muted-foreground break-words">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}
              </p>
              <p className="font-sans text-xl font-medium text-muted-foreground break-words">
                {'abcdefghijklmnopqrstuvwxyz'}
              </p>
              <p className="font-sans text-xl font-semibold text-muted-foreground break-words">
                {'0123456789'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for text-xs (12px) through text-xl (20px). Weights: 400 body, 500 interactive, 600 section titles.
            </p>
          </div>
        </div>
      </div>

      {/* Heading Scale */}
      <div className="min-w-0 rounded-2xl border border-border bg-card shadow-stripe hover-lift">
        <div className="flex min-w-0 flex-col gap-6 p-6">
          <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Heading Scale — Manrope 500
          </h3>
          <div className="flex flex-col gap-6">
            {HEADING_SAMPLES.map((sample) => (
              <div
                key={sample.label}
                className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <span className="text-xs text-muted-foreground">
                  {sample.label} / {sample.lineHeight}
                </span>
                <p
                  className={`font-heading ${sample.size} font-medium text-foreground`}
                >
                  Connecting every school
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body Scale */}
      <div className="min-w-0 rounded-2xl border border-border bg-card shadow-stripe hover-lift">
        <div className="flex min-w-0 flex-col gap-6 p-6">
          <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Body Scale — Open Sans
          </h3>
          <div className="flex flex-col gap-4">
            {BODY_SAMPLES.map((sample, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="text-xs text-muted-foreground">
                  {sample.label}
                </span>
                <p
                  className={`font-sans ${sample.size} ${sample.weight} text-foreground`}
                >
                  {sample.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
