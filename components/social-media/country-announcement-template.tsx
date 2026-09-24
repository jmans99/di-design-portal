'use client'

import { forwardRef } from 'react'
import { CountrySilhouette } from './country-silhouette'
import { GigaLogoWhite } from './giga-logo-white'
import { TEMPLATE_HEIGHT, TEMPLATE_WIDTH } from '@/lib/social-media/export'

export interface CountryAnnouncementTemplateProps {
  /** ISO 3166-1 alpha-2 (lowercase). Drive silhouette. */
  alpha2: string
  /** Display name del paese (es. "The Gambia"). */
  countryName: string
  /** Flag emoji (es. "🇬🇲"). */
  flagEmoji: string
  /** Tagline in alto a sinistra (es. "Digital Inclusion is growing"). */
  tagline: string
  /** Data formattata in alto a destra (es. "May 2026"). */
  date: string
  /** Sottotitolo sotto l'headline (es. "as our 51st engaged country"). */
  subtitle: string
}

// Font headline adattivo: i paesi con nomi lunghi (American Samoa, Bosnia and
// Herzegovina, Saint Vincent and the Grenadines, ...) altrimenti finiscono per
// wrap-pare a 3+ righe e collidere con la silhouette.
function getHeadlineFont(countryName: string) {
  const len = countryName.length
  if (len <= 10) return { size: 120, lineHeight: 128, tracking: -2.4 }
  if (len <= 16) return { size: 96, lineHeight: 104, tracking: -2.0 }
  if (len <= 24) return { size: 80, lineHeight: 88, tracking: -1.6 }
  return { size: 64, lineHeight: 72, tracking: -1.2 }
}

/**
 * Renderer puro del post 1080x1350.
 * - Top row: tagline + date (y=39)
 * - Headline zone: y=220 .. ~620 (testo sopra)
 * - Silhouette zone: y=620 .. y=1200 (mappa sotto, mai sovrapposta al testo)
 * - Footer: y=1222 .. y=1311
 */
export const CountryAnnouncementTemplate = forwardRef<
  HTMLDivElement,
  CountryAnnouncementTemplateProps
>(function CountryAnnouncementTemplate(
  { alpha2, countryName, flagEmoji, tagline, date, subtitle },
  ref
) {
  const headlineFont = getHeadlineFont(countryName)

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: TEMPLATE_WIDTH,
        height: TEMPLATE_HEIGHT,
        backgroundColor: '#277AFF',
        overflow: 'hidden',
        color: 'white',
        fontFamily: '"Open Sans", system-ui, sans-serif',
      }}
    >
      {/* Silhouette zone: occupa la fascia centro-bassa, sotto il sottotitolo e
          sopra il footer. Aspect ratio scelto come compromesso tra paesi larghi
          (Indonesia 3:1) e paesi alti (Cile 1:4). */}
      <div
        style={{
          position: 'absolute',
          width: 1040,
          height: 740,
          left: '50%',
          top: 470,
          transform: 'translateX(-50%)',
        }}
      >
        <CountrySilhouette alpha2={alpha2} />
      </div>

      {/* Top row: tagline | date */}
      <div
        style={{
          position: 'absolute',
          top: 39,
          left: '4.07%',
          right: '4.07%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: '"Open Sans", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '48px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          {tagline}
        </span>
        <span
          style={{
            fontFamily: '"Open Sans", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '48px',
            color: 'white',
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {date}
        </span>
      </div>

      {/* Headline block: flag + country name (2 righe) + subtitle */}
      <div
        style={{
          position: 'absolute',
          left: 43,
          width: 997,
          top: 140,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: '"Manrope", system-ui, sans-serif',
            fontWeight: 400,
            fontSize: headlineFont.size,
            lineHeight: `${headlineFont.lineHeight}px`,
            letterSpacing: `${headlineFont.tracking}px`,
            color: 'white',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {flagEmoji}
        </span>
        <div
          style={{
            flex: '1 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            minWidth: 0,
            color: 'white',
          }}
        >
          <h1
            style={{
              fontFamily: '"Manrope", system-ui, sans-serif',
              fontWeight: 400,
              fontSize: headlineFont.size,
              lineHeight: `${headlineFont.lineHeight}px`,
              letterSpacing: `${headlineFont.tracking}px`,
              margin: 0,
              color: 'white',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {countryName}
            <br />
            joins Digital Inclusion
          </h1>
          <p
            style={{
              fontFamily: '"Open Sans", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 32,
              lineHeight: '48px',
              margin: 0,
              color: 'white',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Footer: giga.global | logo Giga */}
      <div
        style={{
          position: 'absolute',
          top: 1222,
          left: 40,
          width: 1000,
          height: 89,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: '"Open Sans", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '40px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          giga.global
        </span>
        <GigaLogoWhite height={89} />
      </div>
    </div>
  )
})
