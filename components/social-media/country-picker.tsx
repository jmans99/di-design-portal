'use client'

import { useState } from 'react'
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
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'

interface CountryPickerProps {
  value: GigaCountry
  onChange: (next: GigaCountry) => void
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {value.code}
            </span>
            <span className="truncate text-foreground">{value.name}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {GIGA_COUNTRIES.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.code}`}
                  onSelect={() => {
                    onChange(c)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2 inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.code}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value.code === c.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Converte un codice ISO alpha-2 nella sequenza di Regional Indicator emoji (es. "br" -> 🇧🇷). */
export function alpha2ToFlagEmoji(alpha2: string): string {
  const upper = alpha2.toUpperCase()
  if (upper.length !== 2) return ''
  return String.fromCodePoint(127397 + upper.charCodeAt(0), 127397 + upper.charCodeAt(1))
}
