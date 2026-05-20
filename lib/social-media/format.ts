const SUFFIXES = ['th', 'st', 'nd', 'rd'] as const

/**
 * Ordinale inglese: 1 -> "1st", 2 -> "2nd", 11 -> "11th", 21 -> "21st", 52 -> "52nd".
 * Solo en-US, non i18n: la creativita' Giga e' sempre in inglese.
 */
export function formatOrdinal(n: number): string {
  const abs = Math.abs(Math.trunc(n))
  const mod100 = abs % 100
  const mod10 = abs % 10
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : SUFFIXES[mod10] ?? 'th'
  return `${n}${suffix}`
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "May 2026" — usa il fuso orario locale dell'utente. */
export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** Slug minimale per filename: "The Gambia" -> "the-gambia". */
export function slugifyCountry(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Filename canonico per il PNG esportato. */
export function buildExportFilename(countryName: string, date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `giga-${slugifyCountry(countryName)}-${yyyy}-${mm}.png`
}
