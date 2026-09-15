'use client'

import { useState } from 'react'
import { Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { PHOTO_AWARD_STORIES, type PhotoAwardStory } from '@/lib/photo-awards'
import { StoryLightbox } from '@/components/photo-awards/story-lightbox'
import { cn } from '@/lib/utils'

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1st place', 2: '2nd place', 3: '3rd place' }

// Winners first, then the sheet's order; unranked stories close the list.
const STORIES = [...PHOTO_AWARD_STORIES].sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9))

/**
 * Photo awards grid. Each story is a photo tile with the text underneath,
 * the way listing and photo sites do it: no card chrome, the photograph is
 * the card. Multi-photo stories carry their own small carousel inside the
 * tile (arrows on hover, dots underneath the photo) so the story can be
 * browsed before it is opened; clicking the photo opens the viewer on the
 * photo currently shown.
 */
export function PhotoAwardsGallery() {
  const [open, setOpen] = useState<{ story: PhotoAwardStory; index: number } | null>(null)

  return (
    <div className="animate-in fade-in duration-300 ease-out">
      <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((story) => (
          <StoryTile key={story.slug} story={story} onOpen={(index) => setOpen({ story, index })} />
        ))}
      </div>

      <StoryLightbox
        story={open?.story ?? null}
        index={open?.index ?? 0}
        onIndexChange={(index) => setOpen((o) => (o ? { ...o, index } : o))}
        onClose={() => setOpen(null)}
      />
    </div>
  )
}

function StoryTile({ story, onOpen }: { story: PhotoAwardStory; onOpen: (index: number) => void }) {
  const [index, setIndex] = useState(0)
  const many = story.images.length > 1
  const image = story.images[index]
  const go = (delta: number) => setIndex((i) => (i + delta + story.images.length) % story.images.length)

  return (
    <article className="group flex flex-col gap-2.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.src}
          src={image.thumb}
          alt={`${story.title}, photo ${index + 1} by ${story.photographer}`}
          loading="lazy"
          className="h-full w-full object-cover animate-in fade-in duration-200"
        />
        <button
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`Open ${story.title}`}
          className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        {story.rank && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-stripe">
            <Award className="h-3 w-3 text-primary" aria-hidden />
            {RANK_LABEL[story.rank]}
          </span>
        )}

        {many && (
          <>
            <TileArrow side="left" label="Previous photo" onClick={() => go(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </TileArrow>
            <TileArrow side="right" label="Next photo" onClick={() => go(1)}>
              <ChevronRight className="h-4 w-4" />
            </TileArrow>
            <Dots count={story.images.length} index={index} />
          </>
        )}
      </div>

      <button type="button" onClick={() => onOpen(index)} className="flex flex-col items-start text-left focus-visible:outline-none">
        <h3 className="font-heading text-[15px] font-medium leading-snug text-foreground line-clamp-2">{story.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {story.photographer}
          {story.location ? ` · ${story.location}` : ''}
        </p>
        {many && <p className="mt-0.5 text-xs text-muted-foreground/80">{story.images.length} photos</p>}
      </button>
    </article>
  )
}

function TileArrow({
  side,
  label,
  onClick,
  children,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-stripe-md transition-[opacity,transform,background-color] duration-200 hover:scale-105 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        // Hidden until the tile is hovered or something inside it has focus.
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {children}
    </button>
  )
}

/** Airbnb-style dots: at most five visible, the window slides with the index. */
function Dots({ count, index }: { count: number; index: number }) {
  const max = 5
  const start = Math.min(Math.max(0, index - 2), Math.max(0, count - max))
  const visible = Array.from({ length: Math.min(max, count) }, (_, i) => start + i)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
      {visible.map((i) => {
        const edge = (i === start && start > 0) || (i === start + visible.length - 1 && start + visible.length < count)
        return (
          <span
            key={i}
            className={cn(
              'rounded-full bg-white shadow-[0_0_0_1px_rgba(10,27,63,0.15)] transition-all duration-200',
              i === index ? 'h-1.5 w-1.5 opacity-100' : edge ? 'h-1 w-1 opacity-60' : 'h-1.5 w-1.5 opacity-60',
            )}
          />
        )
      })}
    </div>
  )
}
