import type { PhotoAwardStory } from '@/lib/photo-awards'

const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '1st place', 2: '2nd place', 3: '3rd place' }

/** The award as the badge words it: "1st place", "Students’ choice", "3rd place · Students’ choice". */
export function placeLabel(story: Pick<PhotoAwardStory, 'rank' | 'studentsChoice'>): string {
  return [story.rank ? RANK_LABEL[story.rank] : null, story.studentsChoice ? 'Students’ choice' : null]
    .filter(Boolean)
    .join(' · ')
}
