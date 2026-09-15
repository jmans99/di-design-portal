'use client'

import { useState } from 'react'
import { Images, Award } from 'lucide-react'
import { PHOTO_AWARD_INTRO, PHOTO_AWARD_STORIES, type PhotoAwardStory } from '@/lib/photo-awards'
import { StoryLightbox } from '@/components/photo-awards/story-lightbox'
import { cn } from '@/lib/utils'

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1st place', 2: '2nd place', 3: '3rd place' }

/**
 * Photo awards: one card per story, the story's first photo as cover. A
 * story with several photos says so on the card and opens as a carousel.
 */
export function PhotoAwardsGallery() {
  const [open, setOpen] = useState<{ story: PhotoAwardStory; index: number } | null>(null)
  const [title, ...introRest] = PHOTO_AWARD_INTRO.split('\n').filter(Boolean)
  const note = introRest.join(' ')

  return (
    <div className="animate-in fade-in duration-300 ease-out">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Giga Photo Award 2026</p>
        <h2 className="font-heading text-2xl font-medium tracking-[-0.02em] text-foreground">
          {title.replace(/^Giga Photo Award:\s*/i, '')}
        </h2>
        {note && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PHOTO_AWARD_STORIES.map((story) => {
          const cover = story.images[0]
          const many = story.images.length > 1
          return (
            <button
              key={story.slug}
              type="button"
              onClick={() => setOpen({ story, index: 0 })}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-stripe transition-smooth hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.thumb}
                  alt={`${story.title}, photo by ${story.photographer}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                {/* Scrim over the photo (never a flat panel) so the text reads. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0A0A0C]/85 via-[#0A0A0C]/40 to-transparent" />

                <div className="absolute left-3 top-3 flex gap-1.5">
                  {story.rank && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-stripe">
                      <Award className="h-3 w-3 text-primary" aria-hidden />
                      {RANK_LABEL[story.rank]}
                    </span>
                  )}
                </div>
                {many && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-stripe">
                    <Images className="h-3 w-3" aria-hidden />
                    {story.images.length} photos
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="font-heading text-[15px] font-medium leading-snug line-clamp-2">{story.title}</h3>
                  <p className="mt-1 text-xs text-white/80">
                    {story.photographer}
                    {story.location ? ` · ${story.location}` : ''}
                  </p>
                </div>
              </div>

              {many && (
                <div className="flex gap-1 p-1.5">
                  {story.images.slice(1, 5).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.src}
                      src={img.thumb}
                      alt=""
                      loading="lazy"
                      className={cn('h-14 min-w-0 flex-1 rounded-md object-cover')}
                    />
                  ))}
                  {story.images.length > 5 && (
                    <span className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      +{story.images.length - 5}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
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
