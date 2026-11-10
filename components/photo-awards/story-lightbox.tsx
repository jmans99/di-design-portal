'use client'

import { useEffect, useMemo, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PhotoAwardStory } from '@/lib/photo-awards'
import { PILL, PILL_ACCENT, placeLabel } from '@/components/photo-awards/labels'

const CLAMP_CHARS = 420

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * The story viewer: photo on the left with prev/next and a thumbnail strip
 * when the story has several photos, the story panel on the right with the
 * award pills, title, photographer, the current photo's caption, the project
 * text and the download. Styled on the Dot home tokens (docs/design/dot-home.md):
 * ink text, line borders, pills, 14 to 22px radii, sentence case.
 */
export function StoryLightbox({
  story,
  index,
  onIndexChange,
  onClose,
}: {
  story: PhotoAwardStory | null
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  // Keep the last story mounted while the dialog animates out: `story` goes
  // null the moment the user closes, and an empty shell shrinking away is
  // exactly the flicker this avoids.
  const [displayed, setDisplayed] = useState<PhotoAwardStory | null>(story)
  useEffect(() => {
    if (story) setDisplayed(story)
  }, [story])
  const open = !!story
  const images = useMemo(() => displayed?.images ?? [], [displayed])
  const image = images[index]
  const many = images.length > 1

  // Story text: a multi-photo story shows its project description when it
  // has one, and otherwise only the caption of the photo on screen; a single
  // photo's caption is the story itself.
  const text = displayed ? (displayed.description || (many ? '' : displayed.images[0]?.caption) || '') : ''
  const place = displayed ? placeLabel(displayed) : ''
  const showCaption = many && !!image?.caption
  // Only a story with photo captions clamps its text; a single photo has the whole panel.
  const long = many && text.length > CLAMP_CHARS

  const prev = () => many && onIndexChange((index - 1 + images.length) % images.length)
  const next = () => many && onIndexChange((index + 1) % images.length)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length])

  // Reset the "read more" state per story and preload the neighbours.
  useEffect(() => {
    setExpanded(false)
  }, [displayed?.slug])
  useEffect(() => {
    if (!many) return
    for (const i of [index + 1, index - 1]) {
      const img = images[(i + images.length) % images.length]
      if (img) new Image().src = img.src
    }
  }, [index, images, many])

  const downloadName = useMemo(() => {
    if (!displayed) return ''
    const nn = String(index + 1).padStart(2, '0')
    return `giga-photo-award_${displayed.slug}_${nn}_${slugify(displayed.photographer)}.jpg`
  }, [displayed, index])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[201] flex h-[min(92vh,920px)] w-[min(96vw,1480px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-line-card bg-card shadow-menu focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2 data-[state=open]:duration-200 data-[state=closed]:duration-150 lg:flex-row"
          aria-describedby={undefined}
          // Focus the viewer itself, not its first button: arrows and Escape
          // work straight away and no control opens with a focus ring on it.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
        >
          {displayed && image && (
            <>
              {/* Photo */}
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-subtle">
                <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center p-3 lg:p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.caption || displayed.title}
                    className="max-h-full max-w-full rounded-[14px] object-contain animate-in fade-in duration-300"
                  />
                  {many && (
                    <>
                      <NavButton side="left" onClick={prev} label="Previous photo">
                        <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </NavButton>
                      <NavButton side="right" onClick={next} label="Next photo">
                        <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </NavButton>
                    </>
                  )}
                </div>
                {many && (
                  <div className="flex min-w-0 shrink-0 gap-2 overflow-x-auto border-t border-line-divider bg-card px-4 py-3">
                    {images.map((img, i) => (
                      <button
                        key={img.src}
                        type="button"
                        onClick={() => onIndexChange(i)}
                        aria-label={`Photo ${i + 1}`}
                        aria-current={i === index}
                        className={cn(
                          'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                          i === index ? 'ring-2 ring-ring ring-offset-2 ring-offset-card' : 'opacity-60 hover:opacity-100',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.thumb} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Story panel */}
              <aside className="flex max-h-[46%] w-full shrink-0 flex-col border-t border-line-divider bg-card lg:max-h-none lg:w-[400px] lg:border-l lg:border-t-0">
                <div className="flex items-start justify-between gap-3 px-6 pt-5">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 pt-1">
                    {place && <span className={PILL_ACCENT}>{place}</span>}
                    <span className={PILL}>{displayed.year}</span>
                    <span className={PILL}>{displayed.category}</span>
                  </div>
                  <DialogPrimitive.Close
                    className="focus-ring -mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-hover-soft hover:text-ink"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </DialogPrimitive.Close>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-3">
                  <DialogPrimitive.Title className="font-heading text-xl font-semibold leading-[1.25] tracking-[-0.02em] text-ink">
                    {displayed.title}
                  </DialogPrimitive.Title>
                  <p className="mt-1.5 text-[13px] text-ink-secondary">
                    {displayed.photographer}
                    {displayed.country ? ` · ${displayed.country}` : ''}
                  </p>

                  {/* The photo on screen comes first: it is what changes as you browse. */}
                  {showCaption && (
                    <div className="mt-4 rounded-[14px] bg-subtle px-4 py-3.5">
                      {image.title && (
                        <p className="mb-1 font-heading text-sm font-semibold text-ink">{image.title}</p>
                      )}
                      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{image.caption}</p>
                      <p className="mt-2 text-xs text-ink-muted">
                        Photo {index + 1} of {images.length}
                      </p>
                    </div>
                  )}

                  {text && (
                    <div className="mt-5">
                      {many && <h3 className="mb-1.5 font-heading text-[13px] font-semibold text-ink">About the project</h3>}
                      <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
                        {long && !expanded ? `${text.slice(0, CLAMP_CHARS).trimEnd()}…` : text}
                      </p>
                      {long && (
                        <button
                          type="button"
                          onClick={() => setExpanded((e) => !e)}
                          className="focus-ring mt-1.5 rounded text-[13px] font-semibold text-link transition-colors hover:text-link-hover"
                        >
                          {expanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-line-divider px-6 py-4">
                  <Button asChild className="w-full">
                    <a href={image.src} download={downloadName}>
                      <Download />
                      Download photo
                    </a>
                  </Button>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-ink-muted">
                    JPEG, {image.width} × {image.height}. Credit: {displayed.credit}. For UNICEF advocacy use; contact
                    UNICEF for any other use.
                  </p>
                </div>
              </aside>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function NavButton({
  side,
  onClick,
  label,
  children,
}: {
  side: 'left' | 'right'
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'focus-ring absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line-card bg-card text-ink shadow-tile transition-[background-color,transform] hover:bg-hover-soft active:scale-[0.96]',
        side === 'left' ? 'left-3 lg:left-6' : 'right-3 lg:right-6',
      )}
    >
      {children}
    </button>
  )
}
