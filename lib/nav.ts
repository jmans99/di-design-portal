/** Top-level header links (always visible on desktop). */
export const MAIN_NAV_LINKS = [
  { id: 'logos', path: '/logos', label: 'Logos' },
  { id: 'illustrations', path: '/illustrations', label: 'Illustrations' },
  { id: 'media', path: '/media', label: 'Media' },
  { id: 'slides', path: '/slides', label: 'Slides' },
] as const

/**
 * Hardcoded: Slides e' WIP, resta nascosto da nav, footer e 404 sulla route.
 * Per riabilitarlo cambia questa costante a `false` (l'env var precedente
 * NEXT_PUBLIC_HIDE_SLIDES era impostata a 'false' su Vercel e teneva visibile
 * la sezione anche dopo i tentativi di nasconderla via flag).
 */
export const SLIDES_HIDDEN = true

/** Main nav links filtrati in base ai feature flag attivi. */
export const VISIBLE_MAIN_NAV_LINKS = MAIN_NAV_LINKS.filter(
  (l) => !(SLIDES_HIDDEN && l.id === 'slides')
)

/** Items under the Guidelines dropdown (desktop + mobile accordion). */
export const GUIDELINES_DROPDOWN_LINKS = [
  { id: 'colors', path: '/colors', label: 'Colors' },
  { id: 'typography', path: '/typography', label: 'Typography' },
  { id: 'video-guidelines', path: '/guidelines/video', label: 'Video' },
] as const

/** Items under the Materials dropdown. */
export const MATERIALS_DROPDOWN_LINKS = [
  { id: 'email-signature', path: '/materials/email-signature', label: 'Email signature' },
  { id: 'maps', path: '/materials/maps', label: 'Maps' },
  { id: 'social-media', path: '/materials/social-media', label: 'Social media' },
  { id: 'backgrounds', path: '/materials/backgrounds', label: 'Backgrounds' },
  { id: 'skills', path: '/materials/skills', label: 'AI Skills' },
] as const

/** Footer quick links: same order as primary IA, rispetta i feature flag. */
export const FOOTER_SECTION_LINKS = [
  ...VISIBLE_MAIN_NAV_LINKS,
  ...GUIDELINES_DROPDOWN_LINKS,
  ...MATERIALS_DROPDOWN_LINKS,
]
