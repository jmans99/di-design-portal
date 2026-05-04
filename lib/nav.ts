/** Top-level header links (always visible on desktop). */
export const MAIN_NAV_LINKS = [
  { id: 'logos', path: '/logos', label: 'Logos' },
  { id: 'illustrations', path: '/illustrations', label: 'Illustrations' },
] as const

/** Items under the Guidelines dropdown (desktop + mobile accordion). */
export const GUIDELINES_DROPDOWN_LINKS = [
  { id: 'media', path: '/media', label: 'Media' },
  { id: 'typography', path: '/typography', label: 'Typography' },
  { id: 'video-guidelines', path: '/guidelines/video', label: 'Video' },
] as const

/** Items under the Materials dropdown. */
export const MATERIALS_DROPDOWN_LINKS = [
  { id: 'email-signature', path: '/materials/email-signature', label: 'Email signature' },
] as const

/** Footer quick links: same order as primary IA. */
export const FOOTER_SECTION_LINKS = [
  ...MAIN_NAV_LINKS,
  ...GUIDELINES_DROPDOWN_LINKS,
  ...MATERIALS_DROPDOWN_LINKS,
] as const
