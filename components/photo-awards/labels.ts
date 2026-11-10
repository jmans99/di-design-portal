import type { PhotoAwardStory } from '@/lib/photo-awards'

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1st place', 2: '2nd place', 3: '3rd place' }

/** The award as the badge words it: "1st place", "Students’ choice", "3rd place · Students’ choice". */
export function placeLabel(story: Pick<PhotoAwardStory, 'rank' | 'studentsChoice'>): string {
  return [story.rank ? RANK_LABEL[story.rank] : null, story.studentsChoice ? 'Students’ choice' : null]
    .filter(Boolean)
    .join(' · ')
}

/** The portal's pills, as on the Dot home ("Coming soon" and "Recommended"). */
export const PILL =
  'inline-flex shrink-0 items-center rounded-full border border-line-card bg-pill px-2 py-px text-[11px] font-semibold leading-4 text-pill-muted-foreground'
export const PILL_ACCENT =
  'inline-flex shrink-0 items-center rounded-full border border-pill-accent-border bg-pill px-2 py-px text-[11px] font-semibold leading-4 text-link'
