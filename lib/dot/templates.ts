import type { DeckTemplateId } from '@/lib/dot/intent'

export type DeckTemplate = { id: DeckTemplateId; name: string; description: string }

/** Deck templates shown in Dot's deck step (docs/design/dot-home.md, 3b). */
export const DECK_TEMPLATES: DeckTemplate[] = [
  { id: 'from-scratch', name: 'From scratch', description: 'Start blank. Dot asks a few questions and builds it.' },
  { id: 'master-deck', name: 'Master deck', description: 'All 18 offerings. Dot tailors it to the audience you pick.' },
  { id: 'partnership-deck', name: 'Partnership deck', description: 'For funders and partners' },
  { id: 'government-briefing', name: 'Government briefing', description: 'Short, for ministries' },
]

export const getDeckTemplate = (id: string | undefined) => DECK_TEMPLATES.find((t) => t.id === id)
