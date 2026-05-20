// Override del display name del paese per le creative social.
// La sorgente in lib/giga-countries.ts e' deliberatamente "minimalista" (nome
// breve in stile ISO). Per la grafica social marketing preferisce le forme
// idiomatiche inglesi che includono l'articolo "The".

export const COUNTRY_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  gm: 'The Gambia',
  bs: 'The Bahamas',
  cd: 'DR Congo',
  do: 'The Dominican Republic',
  kp: 'North Korea',
  kr: 'South Korea',
  nl: 'The Netherlands',
  ph: 'The Philippines',
  gb: 'The United Kingdom',
  us: 'The United States',
  ae: 'The UAE',
  ci: "Côte d'Ivoire",
  tr: 'Türkiye',
}

export function getDisplayCountryName(alpha2: string, fallback: string): string {
  return COUNTRY_DISPLAY_NAME_OVERRIDES[alpha2.toLowerCase()] ?? fallback
}
