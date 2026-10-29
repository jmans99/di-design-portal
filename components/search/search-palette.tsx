'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import { ArrowUpRight, Download, Search } from 'lucide-react'
import { BrandPill } from '@/components/brand/brand-tabs'
import { AssetPreview } from '@/components/search/asset-card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { searchItems, type SearchItem } from '@/lib/search'
import { ASSETS, downloadAsset } from '@/lib/search/assets'
import { hasAssetFacets, parseQuery, searchAssets } from '@/lib/search/match'
import type { Asset } from '@/lib/search/types'
import { externalLinkLabel } from '@/lib/external-tools'

const MAX_ASSETS = 8

type SearchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  /** Opens the palette with the query filled in (Dot's "See all N results"). */
  openWith: (query: string) => void
}
const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearchPalette() {
  const value = useContext(SearchContext)
  if (!value) throw new Error('useSearchPalette must be used inside <SearchProvider>.')
  return value
}

/** Holds the palette's open state and query, listens for ⌘K / Ctrl+K, and renders the palette. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false)
  const [query, setQuery] = useState('')

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next)
    if (!next) setQuery('')
  }, [])
  const openWith = useCallback((q: string) => {
    setQuery(q)
    setOpenState(true)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpenState((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo(() => ({ open, setOpen, openWith }), [open, setOpen, openWith])
  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchPalette open={open} onOpenChange={setOpen} query={query} onQueryChange={setQuery} />
    </SearchContext.Provider>
  )
}

const ITEM =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-secondary data-[selected=true]:bg-[#EEF1F4] data-[selected=true]:text-ink'
const GROUP =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-muted'

/**
 * One index and matcher with Dot (lib/search). Groups: Assets (when the query
 * has asset words), Formats, Pages. Empty query: Formats and Pages only.
 */
function SearchPalette({
  open,
  onOpenChange,
  query,
  onQueryChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  onQueryChange: (query: string) => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const items = searchItems(query)
  const formats = items.filter((r) => r.section === 'Formats')
  const pages = items.filter((r) => r.section !== 'Formats')
  const pageSections = [...new Set(pages.map((r) => r.section))]
  const assets = hasAssetFacets(parseQuery(query).facets) ? searchAssets(query, ASSETS).results.slice(0, MAX_ASSETS) : []

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }
  /** The deck builder and other external tools open in a new tab. */
  const openItem = (item: SearchItem) => {
    if (!item.external) return go(item.href)
    onOpenChange(false)
    window.open(item.href, '_blank', 'noopener,noreferrer')
  }
  const assetFor = (value: string) => assets.find((a) => `asset-${a.id}` === value)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[14%] max-w-[600px] translate-y-0 gap-0 overflow-hidden rounded-[14px] border-line-card p-0 shadow-[0_16px_40px_rgba(26,42,60,.16)] [&>button]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search assets, formats and pages. Enter opens the result; Command or Control and Enter downloads an asset.
        </DialogDescription>
        {/* Filtering is done by lib/search, the same index and matcher as Dot's box. */}
        <CommandPrimitive
          shouldFilter={false}
          loop
          value={selected}
          onValueChange={setSelected}
          onKeyDown={(e) => {
            const asset = assetFor(selected)
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && asset) {
              e.preventDefault()
              downloadAsset(asset)
            }
          }}
          className="flex flex-col text-ink"
        >
          <div className="flex items-center gap-2.5 border-b border-line-divider px-4">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
            <CommandPrimitive.Input
              value={query}
              onValueChange={onQueryChange}
              placeholder="Search assets, formats and pages"
              className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-muted"
            />
          </div>
          <CommandPrimitive.List className="max-h-[420px] overflow-y-auto p-1.5">
            <CommandPrimitive.Empty className="px-3 py-6 text-center text-sm text-ink-muted">No matches yet.</CommandPrimitive.Empty>
            {assets.length > 0 && (
              <CommandPrimitive.Group heading="Assets" className={GROUP}>
                {assets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} onOpen={() => go(asset.page)} />
                ))}
              </CommandPrimitive.Group>
            )}
            {formats.length > 0 && (
              <CommandPrimitive.Group heading="Formats" className={GROUP}>
                {formats.map((item) => (
                  <LinkRow key={item.id} item={item} onSelect={() => openItem(item)} />
                ))}
              </CommandPrimitive.Group>
            )}
            {pageSections.map((section) => (
              <CommandPrimitive.Group key={section} heading={`Pages · ${section}`} className={GROUP}>
                {pages
                  .filter((r) => r.section === section)
                  .map((item) => (
                    <LinkRow key={item.id} item={item} onSelect={() => go(item.href)} />
                  ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
          {assets.length > 0 && (
            <p className="border-t border-line-divider px-4 py-2 text-[11px] text-ink-muted">
              Enter opens the asset&apos;s page · ⌘ Enter downloads it
            </p>
          )}
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}

function LinkRow({ item, onSelect }: { item: SearchItem; onSelect: () => void }) {
  const Icon = item.icon
  return (
    <CommandPrimitive.Item
      value={item.id}
      onSelect={onSelect}
      aria-label={item.external ? externalLinkLabel(item.title) : undefined}
      className={`${ITEM} h-9`}
    >
      <Icon className="h-4 w-4 shrink-0" style={item.color ? { color: item.color } : undefined} strokeWidth={1.75} aria-hidden />
      {item.title}
      {item.external && <ArrowUpRight className="ml-auto !h-3.5 !w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />}
    </CommandPrimitive.Item>
  )
}

/** 32px thumbnail, title, brand pill; Enter opens the page, the download button (or ⌘ Enter) gets the first file. */
function AssetRow({ asset, onOpen }: { asset: Asset; onOpen: () => void }) {
  const first = asset.formats[0]
  return (
    <CommandPrimitive.Item value={`asset-${asset.id}`} onSelect={onOpen} className={`${ITEM} h-11`}>
      <AssetPreview asset={asset} className="h-8 w-8 shrink-0 rounded-md" padding="p-1" />
      <span className="min-w-0 flex-1 truncate">{asset.title}</span>
      <BrandPill brand={asset.brand} />
      {first && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Download ${asset.title} as ${first.ext.toUpperCase()}`}
          title={`Download ${first.ext.toUpperCase()}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            downloadAsset(asset)
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-primary-700"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      )}
    </CommandPrimitive.Item>
  )
}
