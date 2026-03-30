'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, ImageIcon, Mail } from 'lucide-react'
import { VIDEO_GUIDELINES_ASSETS as ASSETS } from '@/lib/video-guidelines-assets'

const VIDEO_COLORS = [
  { name: 'Giga blue', hex: '#277aff' },
  { name: 'White', hex: '#eeeeee' },
  { name: 'Black', hex: '#161616' },
] as const

type LogoFormatLink =
  | { label: string; urlKey: keyof typeof import('@/lib/video-guidelines-assets').VIDEO_GUIDELINES_ASSETS }
  | { label: string; internal: true; variant: string }

const LOGO_FORMATS: {
  format: string
  note: string
  canvas: string
  logoSize: string
  margins: string
  imageSrc: string
  imageAspect: string
  links: LogoFormatLink[]
}[] = [
  {
    format: 'Horizontal 16:9',
    note: 'Giga + UNICEF + ITU',
    canvas: '1920px × 1080px',
    logoSize: '450px × 94px',
    margins: '40px on all edges',
    imageSrc: '/images/video-guidelines/subtitles-safe-area-16-9.png',
    imageAspect: 'aspect-video',
    links: [
      { label: 'Logo original Horizontal', internal: true, variant: 'White' },
    ],
  },
  {
    format: 'Vertical 9:16',
    note: 'Giga only',
    canvas: '1080px × 1920px',
    logoSize: '150px × 175px',
    margins: 'Top: 220px, Bottom: 320px, Left: 60px, Right: 120px',
    imageSrc: '/images/video-guidelines/lower-thirds-safe-area-9-16.png',
    imageAspect: 'aspect-[9/16]',
    links: [{ label: 'Logo original Square & Vertical', internal: true, variant: 'White' }],
  },
  {
    format: 'Square 1:1',
    note: 'Giga only',
    canvas: '1080px × 1080px',
    logoSize: '120px × 140px',
    margins: '40px on all edges',
    imageSrc: '/images/video-guidelines/explainers-safe-area-square.png',
    imageAspect: 'aspect-square',
    links: [{ label: 'Logo original Square & Vertical', internal: true, variant: 'White' }],
  },
]

function VideoColorSwatch({ name, hex }: { name: string; hex: string }) {
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
      className="flex w-full min-w-0 flex-col rounded-lg border border-border overflow-hidden transition-smooth-transform hover:shadow-md hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title={`Copy ${hex}`}
    >
      <div className="h-12 w-full min-w-[100px]" style={{ backgroundColor: hex }} aria-hidden />
      <div className="bg-background px-3 py-2 text-left">
        <span className="text-xs font-semibold text-foreground">{name}</span>
        <span className="block font-mono text-[11px] text-muted-foreground">
          {copied ? 'Copied!' : hex}
        </span>
      </div>
    </button>
  )
}

/** Replace with e.g. <img src="/images/video-guidelines/..." alt="..." /> when assets are ready. */
function ImagePlaceholder({
  label,
  aspectRatio = 'aspect-video',
}: {
  label: string
  aspectRatio?: 'aspect-video' | 'aspect-square' | 'aspect-[9/16]'
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-muted border border-border ${aspectRatio} w-full min-h-[140px]`}
      aria-label={`Placeholder: ${label}`}
    >
      <ImageIcon className="h-10 w-10 text-muted-foreground" aria-hidden />
      <span className="text-sm text-muted-foreground text-center px-4">
        {label}
      </span>
    </div>
  )
}

interface VideoBrandGuidelinesSectionProps {
  /** When provided, logo links in "Logo positioning" go to the Logos page with this variant selected (e.g. "White"). */
  onNavigateToLogosWithVariant?: (variant: string) => void
}

export function VideoBrandGuidelinesSection({
  onNavigateToLogosWithVariant,
}: VideoBrandGuidelinesSectionProps = {}) {
  return (
    <div className="flex min-w-0 flex-col gap-12">
      {/* Intro */}
      <section className="space-y-4">
        <p className="text-base text-foreground leading-relaxed">
          In this section you will find all the branding guidelines and assets to use when
          creating video content for Giga. It includes which fonts to use, how and where to
          position the logos, how to apply lower thirds to identify speakers, and how to add
          on-screen text for video explainers and subtitles. You will also find all the necessary
          media assets, including After Effects templates, which you can download and customize.
          By correctly applying the assets outlined here, the validation process is more likely
          to proceed smoothly, quickly, and efficiently.
        </p>
        <Button variant="outline" size="sm" className="rounded-[6px] font-medium" asChild>
          <a
            href={ASSETS.brandGuidelinesUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Giga Brand Guidelines
          </a>
        </Button>
      </section>

      {/* Font */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">Font</h3>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <Card className="min-w-0 rounded-lg border transition-smooth">
            <CardContent className="flex min-w-0 flex-col gap-2 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-medium text-foreground">Manrope</p>
                  <p className="text-sm text-muted-foreground">Used for headings.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-[6px] shrink-0" asChild>
                  <a href={ASSETS.manropeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 rounded-lg border transition-smooth">
            <CardContent className="flex min-w-0 flex-col gap-2 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-medium text-foreground">Open Sans</p>
                  <p className="text-sm text-muted-foreground">
                    Use in all Giga multimedia assets: captions, subtitles, and lower thirds.
                    Avoid bold weight; use semibold for body text when highlighting, and medium
                    for titles.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-[6px] shrink-0" asChild>
                  <a href={ASSETS.openSansUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {VIDEO_COLORS.map((c) => (
            <VideoColorSwatch key={c.name} name={c.name} hex={c.hex} />
          ))}
        </div>
      </section>

      {/* Logo positioning */}
      <section className="space-y-6">
        <div>
          <h3 className="font-heading text-2xl font-medium text-foreground">
            Giga logo positioning on videos
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your format and use the reference image plus specs below. Download the templates or original files as needed.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {LOGO_FORMATS.map((item) => (
            <article
              key={item.format}
              className="flex min-h-[380px] flex-col rounded-lg border border-border bg-card overflow-hidden transition-smooth hover:shadow-md"
            >
              <div className="flex h-[400px] shrink-0 items-center justify-center overflow-hidden bg-muted/50">
                <img
                  src={item.imageSrc}
                  alt={`Logo positioning – ${item.format}`}
                  className="max-h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h4 className="font-heading text-lg font-medium text-foreground">
                    {item.format}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <dl className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Canvas</dt>
                    <dd className="font-mono text-foreground">{item.canvas}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Logo size</dt>
                    <dd className="font-mono text-foreground">{item.logoSize}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Margins</dt>
                    <dd className="text-foreground">{item.margins}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {item.links.map((link) =>
                    'internal' in link && link.internal && onNavigateToLogosWithVariant ? (
                      <Button
                        key={link.label}
                        variant="outline"
                        size="sm"
                        className="rounded-[6px] text-xs"
                        onClick={() => onNavigateToLogosWithVariant(link.variant)}
                      >
                        {link.label}
                      </Button>
                    ) : (
                      <Button
                        key={link.label}
                        variant="outline"
                        size="sm"
                        className="rounded-[6px] text-xs"
                        asChild
                      >
                        <a
                          href={'urlKey' in link ? ASSETS[link.urlKey] : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1.5 h-3 w-3" />
                          {link.label}
                        </a>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">Alternative:</strong> Use horizontal logos (Giga + UNICEF + ITU) at top right for horizontal, and Giga only for square and vertical. Apply 75% opacity.
        </p>
      </section>

      {/* Subtitles */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">Subtitles</h3>
        <p className="text-base text-muted-foreground">
          White Open Sans Medium on grey background with reasonable opacity applied.
        </p>
        <img
          src="/images/video-guidelines/subtitles-example.png"
          alt="Subtitles example – white text on semi-transparent dark background"
          className="w-full max-w-2xl rounded-lg border border-border object-contain"
        />
      </section>

      {/* Lower thirds */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          Lower thirds (template)
        </h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Line 1: Name and last name</li>
          <li>Line 2: Official job title</li>
          <li>Line 3: Organization / country (when applicable)</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
            <a href={ASSETS.lowerThirdsAeUrl} target="_blank" rel="noopener noreferrer">
              After Effects Template
            </a>
          </Button>
          <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
            <a href={ASSETS.lowerThirdsAlphaUrl} target="_blank" rel="noopener noreferrer">
              Alpha files (blue bar)
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Available in Horizontal 16:9, Square 1:1 and Vertical 9:16. If you don’t use After
          Effects, use the Alpha versions and apply content with fade-in text as an alternative.
        </p>
        <img
          src="/images/video-guidelines/lower-thirds-example.png"
          alt="Lower thirds example – name, job title and organisation on blue bar"
          className="w-full max-w-2xl rounded-lg border border-border object-contain"
        />
      </section>

      {/* Explainers */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          Explainers: text on screen
        </h3>
        <p className="text-base text-muted-foreground">
          White Open Sans Medium on blue background with key words in bold: up to 3 lines of
          text (15 words max).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
            <a
              href={ASSETS.explainersHorizontalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              16:9 Horizontal
            </a>
          </Button>
          <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
            <a href={ASSETS.explainersSquareUrl} target="_blank" rel="noopener noreferrer">
              1:1 Square
            </a>
          </Button>
          <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
            <a href={ASSETS.explainersVerticalUrl} target="_blank" rel="noopener noreferrer">
              9:16 Vertical
            </a>
          </Button>
        </div>
        <img
          src="/images/video-guidelines/explainers-example.png"
          alt="Explainers: text on screen – white text on blue with key words emphasised"
          className="w-full max-w-2xl rounded-lg border border-border object-contain"
        />
      </section>

      {/* Video signature / end slate */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          Video signature / end slate
        </h3>
        <p className="text-base text-muted-foreground">
          Apply Giga’s stingers. Black background (preferred), white and blue versions available.
        </p>
        <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
          <a href={ASSETS.stingersUrl} target="_blank" rel="noopener noreferrer">
            Stingers (all versions)
          </a>
        </Button>
        <img
          src="/images/video-guidelines/video-signature-example.png"
          alt="Video signature – Giga, UNICEF and ITU logos on black (preferred version)"
          className="w-full max-w-2xl rounded-lg border border-border object-contain"
        />
      </section>

      {/* Location pin */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          Location pin template
        </h3>
        <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
          <a href={ASSETS.locationPinUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Download template
          </a>
        </Button>
        <img
          src="/images/video-guidelines/location-pin-example.png"
          alt="Location pin template – pin icon with location text (e.g. Geneva, Switzerland)"
          className="w-full max-w-2xl rounded-lg border border-border object-contain"
        />
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          Giga Multimedia focal point
        </h3>
        <p className="text-base text-muted-foreground">
          If you have any questions, please contact:
        </p>
        <Button variant="outline" size="sm" className="rounded-[6px]" asChild>
          <a href="mailto:rduarte@unicef.org">
            <Mail className="mr-2 h-3.5 w-3.5" />
            Rafael Duarte — rduarte@unicef.org
          </a>
        </Button>
      </section>
    </div>
  )
}
