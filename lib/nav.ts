import { isRouteEnabled } from '@/lib/site'

export type NavItem = { id: string; path: string; label: string }
export type NavGroup = { id: string; label: string; items: NavItem[] }

/**
 * Hardcoded: Slides e' WIP, resta nascosto da nav, footer e 404 sulla route.
 * Per riabilitarlo cambia questa costante a `false` (l'env var precedente
 * NEXT_PUBLIC_HIDE_SLIDES era impostata a 'false' su Vercel e teneva visibile
 * la sezione anche dopo i tentativi di nasconderla via flag).
 */
export const SLIDES_HIDDEN = true

/**
 * Every menu group and item, for both sites. Items whose page is not enabled
 * for the current site (lib/site.ts) are dropped; see NAV_GROUPS.
 */
const ALL_NAV_GROUPS: NavGroup[] = [
  {
    id: 'brand',
    label: 'Brand',
    items: [
      { id: 'colors', path: '/colors', label: 'Colors' },
      { id: 'typography', path: '/typography', label: 'Typography' },
      { id: 'video-guidelines', path: '/guidelines/video', label: 'Video' },
      { id: 'brand-guidelines', path: '/guidelines/brand', label: 'Brand guidelines' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    items: [
      { id: 'logos', path: '/logos', label: 'Logos' },
      { id: 'illustrations', path: '/illustrations', label: 'Illustrations' },
      { id: 'image-galleries', path: '/media', label: 'Image galleries' },
      { id: 'photo-awards', path: '/media/photo-awards', label: 'Photo awards' },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    items: [
      { id: 'maps', path: '/materials/maps', label: 'Maps' },
      { id: 'social-media', path: '/materials/social-media', label: 'Social media' },
      { id: 'engagement-map', path: '/materials/engagement-map', label: 'Engagement map' },
      { id: 'email-signature', path: '/materials/email-signature', label: 'Email signature' },
      { id: 'backgrounds', path: '/materials/backgrounds', label: 'Backgrounds' },
      { id: 'slides', path: '/slides', label: 'Slides' },
    ],
  },
  {
    id: 'ai-skills',
    label: 'AI skills',
    items: [{ id: 'skills', path: '/materials/skills', label: 'AI skills' }],
  },
]

/** Slides has no page yet, so it is gated by SLIDES_HIDDEN, not by the site's routes. */
function isItemVisible(item: NavItem) {
  if (item.id === 'slides') return !SLIDES_HIDDEN
  return isRouteEnabled(item.path)
}

/**
 * Menu groups for the current site, shared by the header, mobile menu and
 * footer. A group with one item renders as a plain link; empty groups are gone.
 */
export const NAV_GROUPS: NavGroup[] = ALL_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.filter(isItemVisible),
})).filter((group) => group.items.length > 0)

/** Footer quick links: every menu item, in menu order. */
export const FOOTER_SECTION_LINKS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)
