/** Top-level header links (always visible on desktop). */
export const MAIN_NAV_LINKS = [
  { id: 'logos', path: '/logos', label: 'Logos' },
  { id: 'illustrations', path: '/illustrations', label: 'Illustrations' },
  { id: 'media', path: '/media', label: 'Media' },
  { id: 'slides', path: '/slides', label: 'Slides' },
] as const

/**
 * Flag inlined a build time: se true nasconde la sezione Slides dal nav e dal
 * footer e fa servire 404 sulla route. Usato per i deploy production dove
 * Slides e' ancora work in progress.
 */
export const SLIDES_HIDDEN = process.env.NEXT_PUBLIC_HIDE_SLIDES === 'true'

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
  { id: 'backgrounds', path: '/materials/backgrounds', label: 'Backgrounds' },
] as const

/** Footer quick links: same order as primary IA, rispetta i feature flag. */
export const FOOTER_SECTION_LINKS = [
  ...VISIBLE_MAIN_NAV_LINKS,
  ...GUIDELINES_DROPDOWN_LINKS,
  ...MATERIALS_DROPDOWN_LINKS,
]
