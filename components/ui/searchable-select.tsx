'use client'

import { useId, useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

export type SearchableSelectOption = {
  value: string
  label: string
  /** Group heading the option is listed under. */
  group?: string
  /** Small text on the right of the row, e.g. the category or type ("logo", "Pillars"). */
  tag?: string
  /** Small code chip on the left of the row and in the trigger, e.g. a country code ("BR"). */
  code?: string
  /** Other words that find the option (synonyms, colours…). */
  keywords?: string[]
}

/** The text a row is searched by: label, group, tag, code and keywords. */
const searchText = (o: SearchableSelectOption) => [o.label, o.group, o.tag, o.code, ...(o.keywords ?? [])].filter(Boolean).join(' ')

/**
 * cmdk's built-in scorer keeps anything with a non-zero fuzzy score ("glo"
 * would list most items). Require every typed word to appear in the row's
 * search text, and float rows whose label starts with the first word.
 */
function filterRow(value: string, search: string): number {
  const [label, haystack = ''] = value.toLowerCase().split('\u0001')[0].split('\u0000')
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.every((term) => haystack.includes(term))) return 0
  return label.startsWith(terms[0] ?? '') ? 1 : 0.5
}

const CODE_CHIP =
  'inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'

/**
 * A dropdown with a search field at the top, a grouped list and a check mark
 * on the selected row (the Illustrations picker pattern). Used for every
 * dropdown with more than 7 options (docs/design/brand-and-search.md).
 *
 * Keyboard: on the trigger, Enter, Space or the arrow keys open the list, and
 * typing a letter opens it with that letter in the search. In the list, type
 * to filter, arrows move, Enter picks, Esc closes and returns to the trigger.
 */
export function SearchableSelect({
  value,
  onValueChange,
  options,
  groups,
  placeholder,
  searchPlaceholder,
  emptyText,
  label,
  triggerText,
  tagInTrigger = false,
  disabled,
  className,
}: {
  value: string | null
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  /** Group order; groups with no options are left out. Defaults to the order the options name them. */
  groups?: string[]
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  /** Accessible name of the trigger (and the list), e.g. "Brand". */
  label: string
  /** Replaces the selected label in the trigger, e.g. "Loading countries…". */
  triggerText?: string
  /** Show the selected option's tag in the trigger too (Logos: "logo", "product"…). */
  tagInTrigger?: boolean
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const listId = useId()
  const selected = options.find((o) => o.value === value)

  const grouped = useMemo(() => {
    const order = groups ?? [...new Set(options.map((o) => o.group ?? ''))]
    return order.map((group) => ({ group, items: options.filter((o) => (o.group ?? '') === group) })).filter((g) => g.items.length > 0)
  }, [options, groups])

  // cmdk identifies rows by value: label, then (after a separator) everything searchable, then the option value so it is unique.
  const rowValue = (o: SearchableSelectOption) => `${o.label}\u0000${searchText(o)} \u0001${o.value}`

  const setOpenAndReset = (next: boolean) => {
    setOpen(next)
    if (!next) setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpenAndReset}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-label={selected ? `${label}: ${selected.label}` : label}
          disabled={disabled}
          onKeyDown={(e) => {
            if (open) return
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault()
              setOpen(true)
            } else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
              // Type to search: open with the letter already in the field.
              e.preventDefault()
              setSearch(e.key)
              setOpen(true)
            }
          }}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.code && <span className={CODE_CHIP}>{selected.code}</span>}
            <span className={cn('truncate', selected || triggerText ? 'text-foreground' : 'text-muted-foreground')}>
              {triggerText ?? selected?.label ?? placeholder}
            </span>
            {tagInTrigger && selected?.tag && <span className="shrink-0 rounded bg-muted px-1.5 text-xs font-medium text-muted-foreground">{selected.tag}</span>}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0" align="start">
        <Command filter={filterRow} defaultValue={selected ? rowValue(selected) : undefined}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} aria-label={`Search ${label.toLowerCase()}`} />
          <CommandList id={listId}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {grouped.map(({ group, items }) => (
              <CommandGroup key={group || 'options'} heading={group || undefined}>
                {items.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={rowValue(o)}
                    onSelect={() => {
                      onValueChange(o.value)
                      setOpenAndReset(false)
                    }}
                  >
                    {o.code && <span className={cn(CODE_CHIP, 'mr-2')}>{o.code}</span>}
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.tag && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{o.tag}</span>}
                    <Check className={cn('ml-2 h-4 w-4 shrink-0', o.value === value ? 'opacity-100' : 'opacity-0')} aria-hidden />
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
