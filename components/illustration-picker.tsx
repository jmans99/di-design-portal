'use client'

import { SearchableSelect } from '@/components/ui/searchable-select'
import { ILLUSTRATION_CATEGORY_LABELS } from '@/lib/illustration-registry'
import type { IllustrationAsset, IllustrationCategory } from '@/lib/illustration-registry'

interface IllustrationPickerProps {
  value: string
  onChange: (id: string) => void
  /** The illustrations the brand filter allows, in registry order. */
  items: IllustrationAsset[]
}

const GROUPS = (Object.keys(ILLUSTRATION_CATEGORY_LABELS) as IllustrationCategory[]).map((c) => ILLUSTRATION_CATEGORY_LABELS[c])

/**
 * Illustration dropdown: searchable, grouped by category. Synonyms are search
 * words, so "antenna" finds "Antena". The category tag on each row keeps
 * filtered results readable (Contract, Connection, People exist in more than
 * one category).
 */
export function IllustrationPicker({ value, onChange, items }: IllustrationPickerProps) {
  return (
    <SearchableSelect
      value={value}
      onValueChange={onChange}
      options={items.map((asset) => ({
        value: asset.id,
        label: asset.label,
        group: ILLUSTRATION_CATEGORY_LABELS[asset.category],
        tag: ILLUSTRATION_CATEGORY_LABELS[asset.category],
        keywords: asset.keywords,
      }))}
      groups={GROUPS}
      label="Illustration"
      placeholder="Choose an illustration"
      searchPlaceholder="Search illustrations..."
      emptyText="No illustration found."
    />
  )
}
