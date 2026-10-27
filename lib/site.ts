/**
 * Two sites, one codebase. NEXT_PUBLIC_SITE ("giga" | "di") picks the site at
 * build time. Everything that differs between the two sites lives in this
 * file: name, metadata, logos, theme colour, analytics and enabled pages.
 * See README.md, "Two sites".
 */

export type SiteId = 'giga' | 'di'

/** Every page route in the app (API routes are not listed: they stay on both sites). */
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
  metadata: { title: string; description: string }
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
  metadata: {
    title: 'Giga Brand Asset Generator',
    description:
      'Generate brand-compliant visual assets for Giga partners. Logos, colors, and typography — all in one operational tool.',
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
  metadata: {
    title: 'Digital Inclusion Brand Asset Generator',
    description:
      'Generate brand-compliant visual assets for Digital Inclusion partners. Logos, colors, and typography — all in one operational tool.',
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

/** True when the current site serves this page route. */
export function isRouteEnabled(path: string): boolean {
  return (getSite().routes as readonly string[]).includes(path)
}
