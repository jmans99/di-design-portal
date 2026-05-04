/**
 * Table-based HTML email signature (Outlook-friendly structure).
 * Text accent uses Giga bicolor blue (#277AFF). Logos use kit SVG paths.
 */

/**
 * Production origin where `/logos/*` are publicly served. Exported HTML must never use
 * `http://localhost:*` or recipients’ mail clients will not load images.
 * Set `NEXT_PUBLIC_SITE_URL` on Vercel (or locally) to override.
 */
export const EMAIL_SIGNATURE_PUBLIC_ASSET_ORIGIN = 'https://gigabrand.vercel.app'

/**
 * Base URL for absolute `<img src>` in pasted/downloaded signatures.
 * Priority: `NEXT_PUBLIC_SITE_URL` → on localhost, {@link EMAIL_SIGNATURE_PUBLIC_ASSET_ORIGIN} → else current origin.
 */
export function resolveEmailSignatureAssetBaseUrl(): string {
  const raw =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : ''
  if (raw) return raw.replace(/\/$/, '')
  if (typeof window === 'undefined') return EMAIL_SIGNATURE_PUBLIC_ASSET_ORIGIN
  const h = window.location.hostname
  if (h === 'localhost' || h === '127.0.0.1') return EMAIL_SIGNATURE_PUBLIC_ASSET_ORIGIN
  return window.location.origin
}

export type SignatureLocation = 'geneva' | 'valencia' | 'barcelona'

/** Partner logo shown in extended signature (single image column — no extra wordmark beside it). */
export type SignatureLogoLockup =
  | 'giga-unicef-itu'
  | 'unicef-digital-impact-division'

export type SignatureLayout = 'short' | 'extended'

export const LOCATION_ADDRESSES: Record<SignatureLocation, string> = {
  geneva: 'Campus Biotech, Chemin des Mines 9 – 1202 Geneva, Switzerland',
  valencia: 'Giga Valencia Technology Center',
  barcelona: 'Giga Barcelona Technology Center',
}

export function resolveLogoSrc(lockup: SignatureLogoLockup): string {
  switch (lockup) {
    case 'giga-unicef-itu':
      return '/logos/giga-unicef-itu-horizontal.svg'
    case 'unicef-digital-impact-division':
      return '/logos/unicef-digital-impact-division-black.svg'
    default:
      return '/logos/giga-unicef-itu-horizontal.svg'
  }
}

export function defaultLogoWidth(lockup: SignatureLogoLockup): number {
  switch (lockup) {
    case 'unicef-digital-impact-division':
      return 126
    case 'giga-unicef-itu':
    default:
      return 220
  }
}

function logoAltText(lockup: SignatureLogoLockup): string {
  switch (lockup) {
    case 'giga-unicef-itu':
      return 'Giga, UNICEF and ITU'
    case 'unicef-digital-impact-division':
      return 'UNICEF Digital Impact Division'
    default:
      return 'Logo'
  }
}

/** Giga bicolor blue — name, rules, section headings in signature. */
const ACCENT_GIGA = '#277AFF'

const LINK_DIGITAL_IMPACT = 'https://www.unicef.org/digitalimpact/'
const LINK_GIGA = 'https://www.giga.global/'
const LINK_LI_DI = 'https://www.linkedin.com/showcase/unicef-technology/'
const LINK_LI_GIGA = 'https://www.linkedin.com/showcase/gigaglobal/'
const LINK_X_GIGA = 'https://x.com/Gigaglobal?lang=en'
const LINK_IG_GIGA = 'https://www.instagram.com/giga_global/'
const LINK_YT_GIGA = 'https://www.youtube.com/@GigaGlobal/videos'

const GREY = '#555555'
const LINK_BLUE = '#0066CC'

/** Extended block: total table width and logo column match Giga + UNICEF + ITU lockup at 220px-wide image. */
const EXTENDED_SIGNATURE_TABLE_PX = 560
const EXTENDED_LOGO_CELL_PX = 220

export interface SignatureBuildOptions {
  name: string
  jobTitle: string
  location: SignatureLocation
  logoLockup: SignatureLogoLockup
  layout: SignatureLayout
  /** Absolute base URL for `<img src>` (use {@link resolveEmailSignatureAssetBaseUrl} from the app). */
  assetBaseUrl: string
  /** Max width for logo img (px) */
  logoWidth?: number
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

/**
 * Build complete HTML fragment for pasting into Outlook / webmail.
 */
export function buildEmailSignatureHtml(opts: SignatureBuildOptions): string {
  const {
    name,
    jobTitle,
    location,
    logoLockup,
    layout,
    assetBaseUrl,
    logoWidth: logoWidthOverride,
  } = opts

  const logoWidth = logoWidthOverride ?? defaultLogoWidth(logoLockup)

  const ACC = ACCENT_GIGA
  const address = LOCATION_ADDRESSES[location]
  const logoPath = resolveLogoSrc(logoLockup)
  const logoSrc = absUrl(assetBaseUrl, logoPath)

  const jobLine = jobTitle.trim() || 'Job title'

  const topBlock = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0 0 4px 0;">
      <span style="font-size:18px;font-weight:bold;color:${ACC};">${esc(name)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 2px 0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;">${esc(jobLine)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 2px 0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;">Digital Impact Division</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;">${esc(address)}</span>
    </td>
  </tr>
</table>`

  if (layout === 'short') {
    return topBlock.trim()
  }

  const learnLinks = `
<span style="font-size:12px;font-weight:bold;color:${ACC};display:block;margin:0;padding:0;line-height:12px;mso-line-height-rule:exactly;">Learn more:</span>
<span style="font-size:12px;color:${GREY};line-height:14px;mso-line-height-rule:exactly;display:block;margin:2px 0 0 0;padding:0;">
  <a href="${LINK_DIGITAL_IMPACT}" style="color:${LINK_BLUE};text-decoration:underline;">www.unicef.org/digitalimpact</a>
  <span style="color:${GREY};"> | </span>
  <a href="${LINK_GIGA}" style="color:${LINK_BLUE};text-decoration:underline;">www.giga.global</a>
</span>`

  const socialBlock = `
<span style="font-size:12px;font-weight:bold;color:${ACC};"><br/>Follow us on social media:</span><br/>
<span style="font-size:12px;color:${GREY};line-height:1.6;">
  Digital Impact:
  <a href="${LINK_LI_DI}" style="color:${LINK_BLUE};text-decoration:underline;">LinkedIn</a><br/>
  Giga:
  <a href="${LINK_LI_GIGA}" style="color:${LINK_BLUE};text-decoration:underline;">LinkedIn</a>,
  <a href="${LINK_X_GIGA}" style="color:${LINK_BLUE};text-decoration:underline;">X</a>,
  <a href="${LINK_IG_GIGA}" style="color:${LINK_BLUE};text-decoration:underline;">Instagram</a>,
  <a href="${LINK_YT_GIGA}" style="color:${LINK_BLUE};text-decoration:underline;">YouTube</a>
</span>`

  const taglineBlock = `
<span style="font-size:12px;font-weight:bold;color:${ACC};"><br/><br/>For every child, digital inclusion</span>`

  const logoAlt = logoAltText(logoLockup)

  const bottomBlock = `
<table role="presentation" width="${EXTENDED_SIGNATURE_TABLE_PX}" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;margin-top:14px;width:${EXTENDED_SIGNATURE_TABLE_PX}px;max-width:${EXTENDED_SIGNATURE_TABLE_PX}px;table-layout:fixed;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:8px 0;border-top:1px solid ${ACC};" colspan="2"></td>
  </tr>
  <tr>
    <td valign="top" style="padding:0 24px 0 0;margin:0;vertical-align:top;font-size:12px;">
      ${learnLinks}
      ${socialBlock}
      ${taglineBlock}
    </td>
    <td valign="top" align="right" width="${EXTENDED_LOGO_CELL_PX}" style="padding:0;margin:0;width:${EXTENDED_LOGO_CELL_PX}px;min-width:${EXTENDED_LOGO_CELL_PX}px;max-width:${EXTENDED_LOGO_CELL_PX}px;vertical-align:top;line-height:0;font-size:0;mso-line-height-alt:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;margin:0;padding:0;">
        <tr>
          <td align="right" style="padding:0;margin:0;line-height:0;font-size:0;mso-line-height-alt:0;vertical-align:top;">
            <img src="${logoSrc}" alt="${esc(logoAlt)}" width="${logoWidth}" style="display:block;margin:0;padding:0;border:0;outline:none;text-decoration:none;vertical-align:top;max-width:${logoWidth}px;height:auto;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`

  return `${topBlock.trim()}\n${bottomBlock.trim()}`
}

/** Plain-text companion for clipboard `text/plain` when copying rich HTML for Outlook. */
export function buildEmailSignaturePlainText(
  opts: Pick<SignatureBuildOptions, 'name' | 'jobTitle' | 'location' | 'layout'>
): string {
  const displayName = opts.name.trim() || 'Your name'
  const displayJob = opts.jobTitle.trim() || 'Job title'
  const address = LOCATION_ADDRESSES[opts.location]
  const lines = [displayName, displayJob, 'Digital Impact Division', address]
  if (opts.layout === 'short') {
    return lines.join('\n')
  }
  lines.push(
    '',
    'Learn more:',
    LINK_DIGITAL_IMPACT,
    LINK_GIGA,
    '',
    'Follow us on social media:',
    `Digital Impact — LinkedIn: ${LINK_LI_DI}`,
    `Giga — LinkedIn: ${LINK_LI_GIGA}`,
    `X: ${LINK_X_GIGA}`,
    `Instagram: ${LINK_IG_GIGA}`,
    `YouTube: ${LINK_YT_GIGA}`,
    '',
    'For every child, digital inclusion'
  )
  return lines.join('\n')
}
