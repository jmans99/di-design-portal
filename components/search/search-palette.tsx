'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { searchItems, type SearchItem } from '@/lib/search'

type SearchContextValue = { open: boolean; setOpen: (open: boolean) => void }
const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearchPalette() {
  const value = useContext(SearchContext)
  if (!value) throw new Error('useSearchPalette must be used inside <SearchProvider>.')
  return value
}

/** Holds the palette's open state, listens for ⌘K / Ctrl+K, and renders the palette. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchPalette open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}

function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const results = searchItems(query)
  const sections = [...new Set(results.map((r) => r.section))]

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) setQuery('')
  }
  const go = (item: SearchItem) => {
    close(false)
    router.push(item.href)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="top-[18%] max-w-[560px] translate-y-0 gap-0 overflow-hidden rounded-[14px] border-line-card p-0 shadow-[0_16px_40px_rgba(26,42,60,.16)] [&>button]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search pages and formats</DialogDescription>
        {/* Filtering is done by lib/search, so the next step can add assets there. */}
        <CommandPrimitive shouldFilter={false} loop className="flex flex-col text-ink">
          <div className="flex items-center gap-2.5 border-b border-line-divider px-4">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages and formats"
              className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-muted"
            />
          </div>
          <CommandPrimitive.List className="max-h-[360px] overflow-y-auto p-1.5">
            <CommandPrimitive.Empty className="px-3 py-6 text-center text-sm text-ink-muted">No matches yet.</CommandPrimitive.Empty>
            {sections.map((section) => (
              <CommandPrimitive.Group
                key={section}
                heading={section}
                className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-muted"
              >
                {results
                  .filter((r) => r.section === section)
                  .map((item) => {
                    const Icon = item.icon
                    return (
                      <CommandPrimitive.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => go(item)}
                        className="flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-secondary data-[selected=true]:bg-[#EEF1F4] data-[selected=true]:text-ink"
                      >
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={item.color ? { color: item.color } : undefined}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        {item.title}
                      </CommandPrimitive.Item>
                    )
                  })}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
