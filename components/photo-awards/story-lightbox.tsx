'use client'

import { useEffect, useMemo, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Award, ChevronLeft, ChevronRight, Download, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PhotoAwardStory } from '@/lib/photo-awards'

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1st place', 2: '2nd place', 3: '3rd place' }
const CLAMP_CHARS = 520

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * The story viewer: photo on the left with prev/next and a thumbnail strip
 * when the story has several photos, the story panel on the right with
 * photographer, title, the story text, the current photo's caption and the
 * download. Modelled on a photo-community viewer, adapted to stories.
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
  const open = !!story
  const images = story?.images ?? []
  const image = images[index]
  const many = images.length > 1

  // Story text: multi-photo stories carry a project description; a single
  // photo's caption is the story itself.
  const text = story ? (story.description || story.images[0]?.caption || '') : ''
  const showCaption = many && !!image?.caption
  const long = text.length > CLAMP_CHARS

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
  }, [story?.slug])
  useEffect(() => {
    if (!many) return
    for (const i of [index + 1, index - 1]) {
      const img = images[(i + images.length) % images.length]
      if (img) new Image().src = img.src
    }
  }, [index, images, many])

  const downloadName = useMemo(() => {
    if (!story) return ''
    const nn = String(index + 1).padStart(2, '0')
    return `giga-photo-award_${story.slug}_${nn}_${slugify(story.photographer)}.jpg`
  }, [story, index])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-[#0A0A0C]/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[201] flex h-[min(92vh,920px)] w-[min(96vw,1480px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-stripe-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 lg:flex-row"
          aria-describedby={undefined}
        >
          {story && image && (
            <>
              {/* Photo */}
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
                <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center p-3 lg:p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.caption || story.title}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-stripe-md animate-in fade-in duration-300"
                  />
                  {many && (
                    <>
                      <NavButton side="left" onClick={prev} label="Previous photo">
                        <ChevronLeft className="h-5 w-5" />
                      </NavButton>
                      <NavButton side="right" onClick={next} label="Next photo">
                        <ChevronRight className="h-5 w-5" />
                      </NavButton>
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-stripe lg:bottom-7 lg:left-7">
                        {index + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>
                {many && (
                  <div className="flex min-w-0 shrink-0 gap-1.5 overflow-x-auto border-t border-border bg-card px-3 py-2.5">
                    {images.map((img, i) => (
                      <button
                        key={img.src}
                        type="button"
                        onClick={() => onIndexChange(i)}
                        aria-label={`Photo ${i + 1}`}
                        aria-current={i === index}
                        className={cn(
                          'relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          i === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : 'opacity-70 hover:opacity-100',
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
              <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card lg:w-[380px] lg:border-l lg:border-t-0">
                <div className="flex items-start justify-between gap-3 px-6 pt-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{story.photographer}</p>
                    {story.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {story.location}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {story.rank && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary-300 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                        <Award className="h-3 w-3" aria-hidden />
                        {RANK_LABEL[story.rank]}
                      </span>
                    )}
                    <DialogPrimitive.Close
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4">
                  <DialogPrimitive.Title className="font-heading text-xl font-medium leading-snug tracking-[-0.02em] text-foreground">
                    {story.title}
                  </DialogPrimitive.Title>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {long && !expanded ? `${text.slice(0, CLAMP_CHARS).trimEnd()}…` : text}
                  </p>
                  {long && (
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => !e)}
                      className="mt-1.5 text-xs font-semibold text-primary transition-smooth hover:text-primary-700"
                    >
                      {expanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {showCaption && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Photo {index + 1} of {images.length}
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{image.caption}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border px-6 py-4">
                  <Button asChild className="w-full">
                    <a href={image.src} download={downloadName}>
                      <Download />
                      Download photo
                    </a>
                  </Button>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    JPEG, {image.width} × {image.height}. Credit: {story.photographer} / Giga Photo Award. For UNICEF
                    advocacy use; contact UNICEF for any other use.
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
        'absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-stripe-md transition-smooth hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]',
        side === 'left' ? 'left-3 lg:left-6' : 'right-3 lg:right-6',
      )}
    >
      {children}
    </button>
  )
}
