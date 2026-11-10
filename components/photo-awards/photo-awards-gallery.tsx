'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PHOTO_AWARD_CATEGORIES, PHOTO_AWARD_STORIES, type PhotoAwardStory } from '@/lib/photo-awards'
import { StoryLightbox } from '@/components/photo-awards/story-lightbox'
import { PILL_ACCENT, placeLabel } from '@/components/photo-awards/labels'
import { cn } from '@/lib/utils'

/** Each edition's theme, shown next to its year. */
const EDITION_THEME: Record<number, string> = {
  2025: 'The Joy of Connection',
  2026: 'The Urgency of Connectivity',
}

// Each category is one row. It has three stories, or four when a Students'
// Choice sits beside the podium, and the row takes that many columns so it
// always spans the page.
const ROW_COLUMNS: Record<number, string> = { 4: 'lg:grid-cols-4' }

// One section per edition, newest first. Inside it one group per category,
// podium order; a prize outside the podium (Students' Choice) closes its group.
const EDITIONS = [...new Set(PHOTO_AWARD_STORIES.map((s) => s.year))]
  .sort((a, b) => b - a)
  .map((year) => ({
    year,
    groups: PHOTO_AWARD_CATEGORIES.map((category) => ({
      category,
      stories: PHOTO_AWARD_STORIES.filter((s) => s.year === year && s.category === category).sort(
        (a, b) => (a.rank ?? 9) - (b.rank ?? 9),
      ),
    })).filter((g) => g.stories.length > 0),
  }))

/**
 * Photo awards, one section per edition and one row per category. Each
 * story is a tile in the Dot home style (docs/design/dot-home.md): 16px radius,
 * hairline border, the photograph on top and the text underneath. Multi-photo
 * stories carry their own small carousel inside the tile (arrows on hover,
 * dots on the photo) so the story can be browsed before it is opened; clicking
 * the tile opens the viewer on the photo currently shown.
 */
export function PhotoAwardsGallery() {
  const [open, setOpen] = useState<{ story: PhotoAwardStory; index: number } | null>(null)

  return (
    <div className="flex flex-col gap-14 animate-in fade-in duration-300 ease-out">
      {EDITIONS.map(({ year, groups }) => (
        <section key={year} aria-labelledby={`photo-awards-${year}`} className="flex flex-col gap-8">
          <h2
            id={`photo-awards-${year}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-divider pb-3 font-heading text-xl font-semibold tracking-[-0.02em] text-ink"
          >
            {year} winners
            {EDITION_THEME[year] && (
              <span className="font-sans text-[13px] font-normal tracking-normal text-ink-secondary">
                {EDITION_THEME[year]}
              </span>
            )}
          </h2>
          {groups.map(({ category, stories }) => (
            <div key={category} className="flex min-w-0 flex-col gap-3">
              <h3 className="font-heading text-[13px] font-semibold text-ink-secondary">{category}</h3>
              <div className={cn('grid gap-3 sm:grid-cols-2', ROW_COLUMNS[stories.length] ?? 'lg:grid-cols-3')}>
                {stories.map((story) => (
                  <StoryTile key={story.slug} story={story} onOpen={(index) => setOpen({ story, index })} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

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
  const place = placeLabel(story)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[16px] border border-line-card bg-card transition-colors hover:bg-hover-soft focus-within:bg-hover-soft">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.src}
          src={image.thumb}
          alt={`${story.title}, photo ${index + 1} by ${story.photographer}`}
          loading="lazy"
          className="h-full w-full object-cover animate-in fade-in duration-200"
        />
        {place && <span className={cn(PILL_ACCENT, 'pointer-events-none absolute left-3 top-3')}>{place}</span>}

        {many && (
          <>
            <TileArrow side="left" label="Previous photo" onClick={() => go(-1)}>
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </TileArrow>
            <TileArrow side="right" label="Next photo" onClick={() => go(1)}>
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </TileArrow>
            <Dots count={story.images.length} index={index} />
          </>
        )}
      </div>

      {/* One button for the whole tile; the carousel arrows sit above it. */}
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="flex flex-col items-start px-4 pb-4 pt-3.5 text-left focus-visible:outline-none after:absolute after:inset-0 after:rounded-[16px] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
      >
        <h4 className="font-heading text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink line-clamp-2">
          {story.title}
        </h4>
        <p className="mt-1 text-xs text-ink-secondary">
          {story.photographer}
          {story.country ? ` · ${story.country}` : ''}
          {many ? ` · ${story.images.length} photos` : ''}
        </p>
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
        'focus-ring absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line-card bg-card text-ink shadow-tile transition-[opacity,background-color] duration-200 hover:bg-hover-soft focus-visible:opacity-100',
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
