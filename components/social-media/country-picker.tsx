'use client'

import { SearchableSelect } from '@/components/ui/searchable-select'
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'

interface CountryPickerProps {
  value: GigaCountry
  onChange: (next: GigaCountry) => void
}

/** Country dropdown for the social post: searchable by name or code, with the country code on each row. */
export function CountryPicker({ value, onChange }: CountryPickerProps) {
  return (
    <SearchableSelect
      value={value.code}
      onValueChange={(code) => {
        const next = GIGA_COUNTRIES.find((c) => c.code === code)
        if (next) onChange(next)
      }}
      options={GIGA_COUNTRIES.map((c) => ({ value: c.code, label: c.name, code: c.code }))}
      label="Country"
      placeholder="Choose a country"
      searchPlaceholder="Search country..."
      emptyText="No country found."
    />
  )
}

/** Converte un codice ISO alpha-2 nella sequenza di Regional Indicator emoji (es. "br" -> 🇧🇷). */
export function alpha2ToFlagEmoji(alpha2: string): string {
  const upper = alpha2.toUpperCase()
  if (upper.length !== 2) return ''
  return String.fromCodePoint(127397 + upper.charCodeAt(0), 127397 + upper.charCodeAt(1))
}
