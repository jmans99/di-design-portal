/**
 * Portal-wide settings: name, metadata, logo and theme colour. There is one
 * portal (DI look, DI and Giga material), so this is a single config.
 */

export type SiteLogo = {
  src: string
  /** White version for the dark theme (an existing file; the original is never edited). */
  darkSrc: string
  alt: string
  /** Height class; the logos have different aspect ratios. */
  className: string
}

export type SiteConfig = {
  /** Portal name, e.g. "Digital Inclusion brand portal". */
  name: string
  /** Organisation name used in copy about the portal itself. */
  orgName: string
  metadata: { title: string; description: string }
  headerLogo: SiteLogo
  /** Browser UI colour (viewport themeColor). */
  themeColor: string
}

export const SITE: SiteConfig = {
  name: 'Digital Inclusion brand portal',
  orgName: 'Digital Inclusion',
  metadata: {
    title: 'Digital Inclusion Brand Asset Generator',
    description:
      'Generate brand-compliant visual assets for Digital Inclusion partners. Logos, colors, and typography — all in one operational tool.',
  },
  headerLogo: {
    src: '/logos/unicef-digital-inclusion-blue.svg',
    darkSrc: '/logos/unicef-digital-inclusion-white.svg',
    alt: 'UNICEF Digital Inclusion', className: 'h-7' },
  themeColor: '#00AEEF',
}
