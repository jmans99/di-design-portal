/**
 * Table-based HTML email signature (Outlook-friendly structure).
 * Brand spec: "WIP - Digital Inclusion email signature.pdf".
 * Accent uses Digital Inclusion cyan (#00AEEF, R0 G174 B239).
 * Font is Noto Sans (UNICEF official) with Arial/Helvetica fallback for Outlook.
 * Extended layout always renders the DI Division + Giga/UNICEF/ITU stacked lockup.
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

export type SignatureLocation = 'geneva' | 'barcelona'

export type SignatureLayout = 'short' | 'extended'

export const LOCATION_ADDRESSES: Record<SignatureLocation, string> = {
  geneva: 'Campus Biotech, Chemin des Mines 9 – 1202 Geneva, Switzerland',
  barcelona: 'Ca l’Alier, Carrer de Pere IV, 362, Sant Martí – 08019, Barcelona, Spain',
}

/** Fixed text appended after the user-typed role (PDF: "Role Title | Digital Inclusion and Giga"). */
export const ROLE_TEAM_SUFFIX = ' | Digital Inclusion and Giga'

/** Org line varies by version. */
export const ORG_LINE_EXTENDED = 'Digital Impact Division'
export const ORG_LINE_SHORT = 'UNICEF Digital Impact Division'

/** Digital Inclusion cyan (R0 G174 B239) — name, rules, section headings, links. */
const ACCENT_DI = '#00AEEF'

/** Noto Sans is the official UNICEF font; Outlook will fall back to Arial. */
const FONT_STACK = "'Noto Sans', Arial, Helvetica, sans-serif"

const LINK_DIGITAL_IMPACT = 'https://www.unicef.org/digitalimpact/'
const LINK_GIGA = 'https://www.giga.global/'
const LINK_LI_DI = 'https://www.linkedin.com/showcase/unicef-technology/'
const LINK_LI_GIGA = 'https://www.linkedin.com/showcase/gigaglobal/'
const LINK_X_GIGA = 'https://x.com/Gigaglobal?lang=en'
const LINK_IG_GIGA = 'https://www.instagram.com/giga_global/'
const LINK_YT_GIGA = 'https://www.youtube.com/@GigaGlobal/videos'

const GREY = '#555555'

/** Extended block layout. DI lockup is ~60% of the Giga+UNICEF+ITU width, matching the brand reference. */
const EXTENDED_SIGNATURE_TABLE_PX = 560
const EXTENDED_LOGO_CELL_PX = 160
const DI_LOGO_WIDTH_PX = 100
const GIGA_LOGO_WIDTH_PX = 160

export interface SignatureBuildOptions {
  name: string
  jobTitle: string
  location: SignatureLocation
  layout: SignatureLayout
  /** Absolute base URL for `<img src>` (use {@link resolveEmailSignatureAssetBaseUrl} from the app). */
  assetBaseUrl: string
  /**
   * Optional PNG data URIs for the two stacked logos. When provided, used instead of
   * remote SVG URLs — required for Outlook Web, which strips remote/SVG `<img>` on paste.
   */
  diLogoDataUrl?: string
  gigaLogoDataUrl?: string
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
  const { name, jobTitle, location, layout, assetBaseUrl } = opts

  const ACC = ACCENT_DI
  const address = LOCATION_ADDRESSES[location]
  const orgLine = layout === 'extended' ? ORG_LINE_EXTENDED : ORG_LINE_SHORT
  const roleLine = `${jobTitle.trim() || 'Role title'}${ROLE_TEAM_SUFFIX}`

  const topBlock = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;font-family:${FONT_STACK};">
  <tr>
    <td style="padding:0 0 4px 0;">
      <span style="font-size:15px;font-weight:bold;color:${ACC};font-family:${FONT_STACK};">${esc(name)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 2px 0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;font-family:${FONT_STACK};">${esc(roleLine)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 2px 0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;font-family:${FONT_STACK};">${orgLine}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <span style="font-size:13px;color:${GREY};line-height:1.45;font-family:${FONT_STACK};">${esc(address)}</span>
    </td>
  </tr>
</table>`

  if (layout === 'short') {
    return topBlock.trim()
  }

  const learnBlock = `
<span style="font-size:12px;font-weight:bold;color:${ACC};display:block;margin:0;padding:0;line-height:14px;mso-line-height-rule:exactly;font-family:${FONT_STACK};">Learn more:</span>
<span style="font-size:12px;color:${GREY};line-height:18px;mso-line-height-rule:exactly;display:block;margin:2px 0 0 0;padding:0;font-family:${FONT_STACK};">
  Digital Impact: <a href="${LINK_LI_DI}" style="color:${ACC};text-decoration:underline;">LinkedIn</a><br/>
  Giga: <a href="${LINK_LI_GIGA}" style="color:${ACC};text-decoration:underline;">LinkedIn</a>, <a href="${LINK_X_GIGA}" style="color:${ACC};text-decoration:underline;">X</a>, <a href="${LINK_IG_GIGA}" style="color:${ACC};text-decoration:underline;">Instagram</a>, <a href="${LINK_YT_GIGA}" style="color:${ACC};text-decoration:underline;">YouTube</a><br/>
  <a href="${LINK_DIGITAL_IMPACT}" style="color:${ACC};text-decoration:underline;">www.unicef.org/digitalimpact</a><br/>
  <a href="${LINK_GIGA}" style="color:${ACC};text-decoration:underline;">www.giga.global</a>
</span>`

  const taglineBlock = `
<span style="font-size:12px;font-weight:bold;color:${ACC};font-family:${FONT_STACK};"><br/><br/>for every child, digital inclusion</span>`

  const diLogoSrc =
    opts.diLogoDataUrl ?? absUrl(assetBaseUrl, '/logos/unicef-digital-impact-division-black.svg')
  const gigaLogoSrc =
    opts.gigaLogoDataUrl ?? absUrl(assetBaseUrl, '/logos/giga-unicef-itu-horizontal.svg')

  const bottomBlock = `
<table role="presentation" width="${EXTENDED_SIGNATURE_TABLE_PX}" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;margin-top:14px;width:${EXTENDED_SIGNATURE_TABLE_PX}px;max-width:${EXTENDED_SIGNATURE_TABLE_PX}px;table-layout:fixed;font-family:${FONT_STACK};">
  <tr>
    <td style="padding:8px 0;border-top:1px solid ${ACC};" colspan="2"></td>
  </tr>
  <tr>
    <td valign="top" style="padding:0 24px 0 0;margin:0;vertical-align:top;font-size:12px;font-family:${FONT_STACK};">
      ${learnBlock}
      ${taglineBlock}
    </td>
    <td valign="top" align="right" width="${EXTENDED_LOGO_CELL_PX}" style="padding:0;margin:0;width:${EXTENDED_LOGO_CELL_PX}px;min-width:${EXTENDED_LOGO_CELL_PX}px;max-width:${EXTENDED_LOGO_CELL_PX}px;vertical-align:top;line-height:0;font-size:0;mso-line-height-alt:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;margin:0;padding:0;">
        <tr>
          <td align="right" style="padding:0 0 10px 0;margin:0;line-height:0;font-size:0;mso-line-height-alt:0;vertical-align:top;">
            <img src="${diLogoSrc}" alt="UNICEF Digital Impact Division" width="${DI_LOGO_WIDTH_PX}" style="display:block;margin:0;padding:0;border:0;outline:none;text-decoration:none;vertical-align:top;max-width:${DI_LOGO_WIDTH_PX}px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="right" style="padding:0;margin:0;line-height:0;font-size:0;mso-line-height-alt:0;vertical-align:top;">
            <img src="${gigaLogoSrc}" alt="Giga, UNICEF and ITU" width="${GIGA_LOGO_WIDTH_PX}" style="display:block;margin:0;padding:0;border:0;outline:none;text-decoration:none;vertical-align:top;max-width:${GIGA_LOGO_WIDTH_PX}px;height:auto;" />
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
  const displayRole = `${opts.jobTitle.trim() || 'Role title'}${ROLE_TEAM_SUFFIX}`
  const orgLine = opts.layout === 'extended' ? ORG_LINE_EXTENDED : ORG_LINE_SHORT
  const address = LOCATION_ADDRESSES[opts.location]
  const lines = [displayName, displayRole, orgLine, address]
  if (opts.layout === 'short') {
    return lines.join('\n')
  }
  lines.push(
    '',
    'Learn more:',
    `Digital Impact — LinkedIn: ${LINK_LI_DI}`,
    `Giga — LinkedIn: ${LINK_LI_GIGA}`,
    `X: ${LINK_X_GIGA}`,
    `Instagram: ${LINK_IG_GIGA}`,
    `YouTube: ${LINK_YT_GIGA}`,
    LINK_DIGITAL_IMPACT,
    LINK_GIGA,
    '',
    'for every child, digital inclusion'
  )
  return lines.join('\n')
}
