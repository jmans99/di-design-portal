'use client'

import { SearchableSelect } from '@/components/ui/searchable-select'
import { REGIONS, type GigaMapCountry, type GigaMapRegion } from '@/lib/giga-maps/config'

/**
 * Area dropdown for the map tools (Map and Abstract): one searchable list in
 * two groups, Regions (World first, as in REGIONS) then Countries, with the
 * country code on each country row.
 */
export function AreaPicker({
  scope,
  region,
  country,
  countries,
  countriesError,
  onRegion,
  onCountry,
}: {
  scope: 'country' | 'region'
  region: GigaMapRegion
  country: GigaMapCountry | null
  countries: GigaMapCountry[]
  countriesError: string | null
  onRegion: (region: GigaMapRegion) => void
  onCountry: (country: GigaMapCountry) => void
}) {
  const waiting = scope === 'country' && !country
  return (
    <SearchableSelect
      value={scope === 'region' ? `region:${region.code}` : country ? `country:${country.code}` : null}
      onValueChange={(value) => {
        const [kind, code] = value.split(':')
        if (kind === 'region') {
          const r = REGIONS.find((x) => x.code === code)
          if (r) onRegion(r)
        } else {
          const c = countries.find((x) => x.code === code)
          if (c) onCountry(c)
        }
      }}
      options={[
        ...REGIONS.map((r) => ({ value: `region:${r.code}`, label: r.name, group: 'Regions', keywords: [r.code] })),
        ...countries.map((c) => ({ value: `country:${c.code}`, label: c.name, group: 'Countries', code: c.code })),
      ]}
      groups={['Regions', 'Countries']}
      label="Area"
      placeholder="Choose a region or country"
      searchPlaceholder="Search a region or country..."
      emptyText="No region or country found."
      triggerText={waiting ? (countriesError ? 'Unavailable' : 'Loading countries…') : undefined}
      disabled={waiting}
    />
  )
}
