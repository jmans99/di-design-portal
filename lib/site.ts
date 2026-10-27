/**
 * Two sites, one codebase. NEXT_PUBLIC_SITE ("giga" | "di") picks the site at
 * build time. Everything that differs between the two sites lives in this
 * file: name, metadata, logos, theme colour, analytics and enabled pages.
 * See README.md, "Two sites".
 */

export type SiteId = 'giga' | 'di'

/**
 * Every page route in the app (API routes are not listed: they stay on both
 * sites). Dynamic segments are written as "[id]".
 */
export const PAGE_ROUTES = [
  '/',
  '/logos',
  '/colors',
  '/typography',
  '/illustrations',
  '/media',
  '/media/photo-awards',
  '/materials/maps',
  '/materials/maps/abstract',
  '/materials/social-media',
  '/materials/engagement-map',
  '/materials/email-signature',
  '/materials/backgrounds',
  '/materials/skills',
  '/guidelines/video',
  '/guidelines/brand',
  '/knowledge/audiences',
  '/knowledge/audiences/[id]',
  '/knowledge/offerings',
  '/knowledge/offerings/[id]',
] as const

export type PageRoute = (typeof PAGE_ROUTES)[number]

export type SiteLogo = {
  src: string
  alt: string
  /** Height class; the logos have different aspect ratios. */
  className: string
}

export type SiteConfig = {
  id: SiteId
  /** Portal name, e.g. "Giga brand portal". */
  name: string
  /** Organisation name used in copy about the portal itself. */
  orgName: string
  /**
   * "marketing": top header, marketing home and footer (Giga).
   * "app": side panel app shell with a "Beta" top bar (DI).
   */
  shell: 'marketing' | 'app'
  metadata: { title: string; description: string }
  /** Home page copy that names features, so each site only mentions what it has. */
  home: {
    heroSubtitle: string
    /** Labels of the four floating chips in the showcase, in display order. */
    showcaseChips: [string, string, string, string]
  }
  headerLogo: SiteLogo
  footerLogo: SiteLogo
  /** Browser UI colour (viewport themeColor). */
  themeColor: string
  /** Hotjar site ID; null = no Hotjar script. */
  hotjarId: number | null
  /** Pages this site serves. Anything else in PAGE_ROUTES returns 404. */
  routes: readonly PageRoute[]
}

const giga: SiteConfig = {
  id: 'giga',
  name: 'Giga brand portal',
  orgName: 'Giga',
  shell: 'marketing',
  metadata: {
    title: 'Giga Brand Asset Generator',
    description:
      'Generate brand-compliant visual assets for Giga partners. Logos, colors, and typography — all in one operational tool.',
  },
  home: {
    heroSubtitle:
      'Logos, colors, typography, illustrations, maps, and templates the Giga team builds with. Correct by default, ready in a click.',
    showcaseChips: ['Logo copied', 'Announcement ready', 'Map exported as PNG', 'On-brand colors'],
  },
  headerLogo: { src: '/logos/giga-main-horizontal.svg', alt: 'Giga', className: 'h-11' },
  footerLogo: { src: '/logos/giga-unicef-itu-horizontal.svg', alt: 'Giga, UNICEF and ITU', className: 'h-7' },
  themeColor: '#277AFF',
  hotjarId: 6778103,
  routes: [
    '/',
    '/logos',
    '/colors',
    '/typography',
    '/illustrations',
    '/media',
    '/media/photo-awards',
    '/materials/maps',
    '/materials/social-media',
    '/materials/engagement-map',
    '/guidelines/video',
  ],
}

const di: SiteConfig = {
  id: 'di',
  name: 'Digital Inclusion brand portal',
  orgName: 'Digital Inclusion',
  shell: 'app',
  metadata: {
    title: 'Digital Inclusion Brand Asset Generator',
    description:
      'Generate brand-compliant visual assets for Digital Inclusion partners. Logos, colors, and typography — all in one operational tool.',
  },
  home: {
    heroSubtitle:
      'Logos, colors, typography, illustrations, templates, and the AI skills the Digital Inclusion team builds with. Correct by default, ready in a click.',
    showcaseChips: ['Logo copied', 'Signature ready', 'Map exported as PNG', 'On-brand colors'],
  },
  headerLogo: { src: '/logos/unicef-digital-inclusion-blue.svg', alt: 'UNICEF Digital Inclusion', className: 'h-7' },
  footerLogo: { src: '/logos/unicef-digital-inclusion-black.svg', alt: 'UNICEF Digital Inclusion', className: 'h-5' },
  themeColor: '#00AEEF',
  hotjarId: null,
  routes: [
    '/',
    '/logos',
    '/colors',
    '/typography',
    '/illustrations',
    '/media',
    '/media/photo-awards',
    '/materials/maps',
    '/materials/maps/abstract',
    '/materials/social-media',
    '/materials/engagement-map',
    '/materials/email-signature',
    '/materials/backgrounds',
    '/materials/skills',
    '/guidelines/brand',
    '/knowledge/audiences',
    '/knowledge/audiences/[id]',
    '/knowledge/offerings',
    '/knowledge/offerings/[id]',
  ],
}

export const SITES: Record<SiteId, SiteConfig> = { giga, di }

/** The current site, from NEXT_PUBLIC_SITE. Missing or unknown values fall back to giga. */
export function getSite(): SiteConfig {
  const value = process.env.NEXT_PUBLIC_SITE
  if (value === 'giga' || value === 'di') return SITES[value]
  if (value && process.env.NODE_ENV === 'development') {
    console.warn(`[site] Unknown NEXT_PUBLIC_SITE "${value}", falling back to "giga".`)
  }
  return giga
}

/** The PAGE_ROUTES entry a path belongs to ("/knowledge/offerings/mapping" → "/knowledge/offerings/[id]"), if any. */
export function matchPageRoute(path: string): PageRoute | undefined {
  const exact = PAGE_ROUTES.find((route) => route === path)
  if (exact) return exact
  return PAGE_ROUTES.find((route) => {
    if (!route.includes('[')) return false
    const pattern = new RegExp(`^${route.replace(/\[[^/\]]+\]/g, '[^/]+')}$`)
    return pattern.test(path)
  })
}

/** True when the current site serves this page path. */
export function isRouteEnabled(path: string): boolean {
  const route = matchPageRoute(path)
  return route !== undefined && getSite().routes.includes(route)
}
