'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
  ILLUSTRATIONS,
  ILLUSTRATION_CATEGORY_LABELS,
} from '@/lib/illustration-registry'
import type {
  IllustrationAsset,
  IllustrationCategory,
} from '@/lib/illustration-registry'

/** cmdk scores against the item's `value`, so label + category + synonyms all
 *  go in there — that's what makes "antenna" find "Antena". */
function searchValue(asset: IllustrationAsset): string {
  return [
    asset.label,
    ILLUSTRATION_CATEGORY_LABELS[asset.category],
    ...(asset.keywords ?? []),
  ].join(' ')
}

/** cmdk's built-in scorer keeps anything with a non-zero fuzzy score, so "glo"
 *  would still list 38 of the 44 items. Require every typed term to actually
 *  appear, and float label matches above synonym-only ones. */
function filterIllustration(value: string, search: string): number {
  const haystack = value.toLowerCase()
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.every((term) => haystack.includes(term))) return 0
  return haystack.startsWith(terms[0]) ? 1 : 0.5
}

interface IllustrationPickerProps {
  value: string
  onChange: (id: string) => void
}

export function IllustrationPicker({ value, onChange }: IllustrationPickerProps) {
  const [open, setOpen] = useState(false)

  const grouped = useMemo(
    () =>
      (Object.keys(ILLUSTRATION_CATEGORY_LABELS) as IllustrationCategory[])
        .map((cat) => ({
          category: cat,
          label: ILLUSTRATION_CATEGORY_LABELS[cat],
          items: ILLUSTRATIONS.filter((a) => a.category === cat),
        }))
        .filter((g) => g.items.length > 0),
    []
  )

  const selected = ILLUSTRATIONS.find((a) => a.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Choose an illustration"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className={cn('truncate', selected ? 'text-foreground' : 'text-muted-foreground')}>
            {selected?.label ?? 'Choose an illustration'}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command filter={filterIllustration}>
          <CommandInput placeholder="Search illustrations..." />
          <CommandList>
            <CommandEmpty>No illustration found.</CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group.category} heading={group.label}>
                {group.items.map((asset) => (
                  <CommandItem
                    key={asset.id}
                    value={searchValue(asset)}
                    onSelect={() => {
                      onChange(asset.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex-1 truncate">{asset.label}</span>
                    {/* Contract / Connection / People exist in more than one
                        category — the tag keeps filtered results readable. */}
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {group.label}
                    </span>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4 shrink-0',
                        value === asset.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
