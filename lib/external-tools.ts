/**
 * Tools that live outside the portal, and the switches for features waiting
 * on them (docs/design/dot-home.md, "External tools"). Everything that links
 * to the deck builder reads from here, so integrating it later is one change.
 */

import type { OutputType } from './brief'

/** The deck builder (decks and two-pagers), built outside this portal. */
export const EXTERNAL_TOOLS = {
  deck: 'https://un-deck-builder.vercel.app/',
  twoPager: 'https://un-deck-builder.vercel.app/',
} as const

/**
 * The in-portal deck flow (template bento, audience step, "coming soon" reply).
 * Kept, but off: while false, decks and two-pagers open the external builder.
 */
export const inPortalDeckFlow = false

/** The DI Master deck. While false, its home tile and Dot's reply say "Coming soon". */
export const masterDeckAvailable = false

/** The external builder for a format, or null when the format is made in the portal. */
export function externalToolFor(type: OutputType): string | null {
  if (inPortalDeckFlow) return null
  if (type === 'deck') return EXTERNAL_TOOLS.deck
  if (type === 'two-pager') return EXTERNAL_TOOLS.twoPager
  return null
}

/** Accessible name for a link that opens the deck builder in a new tab: "Create a deck (opens the deck builder in a new tab)". */
export const externalLinkLabel = (label: string) => `${label} (opens the deck builder in a new tab)`
