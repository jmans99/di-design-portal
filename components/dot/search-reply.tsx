'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { DotMessage, ReplyBar, UserMessage } from '@/components/dot/conversation'
import { useDot } from '@/components/dot/use-dot'
import { AssetCard } from '@/components/search/asset-card'
import { useSearchPalette } from '@/components/search/search-palette'
import { searchHref, type SearchState } from '@/lib/dot/conversation'
import { getFormat } from '@/lib/dot/formats'
import { matchIntent } from '@/lib/dot/intent'
import { ASSETS } from '@/lib/search/assets'
import { searchAssets } from '@/lib/search/match'
import { FACET_LABELS, type Facet } from '@/lib/search/synonyms'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

const MAX_RESULTS = 6
const FACET_ORDER: Facet[] = ['brand', 'type', 'colour', 'layout', 'format']
const ASSET_PAGES = [
  { label: 'Logos', href: '/logos' },
  { label: 'Illustrations', href: '/illustrations' },
  { label: 'Image galleries', href: '/media' },
  { label: 'Photo awards', href: '/media/photo-awards' },
]

/**
 * Dot's reply to an asset request (docs/design/brand-and-search.md, section 6):
 * the understood facets as removable chips, up to six result cards with real
 * downloads, and "See all" in ⌘K. Searches are not added to Recent.
 */
export function SearchReply({ state }: { state: SearchState }) {
  const { start, send, push } = useDot()
  // "Use DI knowledge" in the reply bar (on by default); it only goes into the brief of what starts next.
  const [useKnowledge, setUseKnowledge] = useState(true)
  const { openWith } = useSearchPalette()
  const { facets, results } = searchAssets(state.query, ASSETS, state.without)
  const intent = matchIntent(state.query)
  const offerBackground = intent.kind === 'search' && intent.offerBackground
  const chips = FACET_ORDER.filter((f) => facets[f])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line-divider bg-background/90 px-4 backdrop-blur md:px-6">
        <SidePanelToggle />
        <span aria-hidden className="h-4 w-px bg-line-divider" />
        <h1 className="truncate text-sm font-semibold text-ink">Search</h1>
        <Link href="/" className="focus-ring ml-auto rounded text-sm font-semibold text-link hover:text-link-hover">
          Start over
        </Link>
      </header>

      <div className={cn('mx-auto flex w-full max-w-[calc(760px+4rem)] flex-1 flex-col px-4 sm:px-8', styles.container)}>
        <ol className="flex flex-1 flex-col gap-6 py-8" aria-label="Conversation with Dot">
          <UserMessage>{state.query}</UserMessage>
          {results.length > 0 ? (
            <DotMessage text={`Here's what I found for “${state.query}”.`}>
              {chips.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Understood filters">
                  {chips.map((facet) => {
                    const label = FACET_LABELS[facet][facets[facet]!] ?? facets[facet]
                    return (
                      <button
                        key={facet}
                        type="button"
                        onClick={() => push(searchHref({ query: state.query, without: [...state.without, facet] }))}
                        aria-label={`Remove ${label}`}
                        className="focus-ring inline-flex h-7 items-center gap-1 rounded-full bg-subtle pl-3 pr-2 text-xs font-semibold text-ink hover:bg-selected"
                      >
                        {label}
                        <X className="h-3.5 w-3.5 text-ink-muted" strokeWidth={2} aria-hidden />
                      </button>
                    )
                  })}
                </div>
              )}
              <div className={styles.results}>
                {results.slice(0, MAX_RESULTS).map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {results.length > MAX_RESULTS && (
                  <button
                    type="button"
                    onClick={() => openWith(state.query)}
                    className="focus-ring rounded text-sm font-semibold text-link hover:text-link-hover"
                  >
                    See all {results.length} results
                  </button>
                )}
                {offerBackground && <BackgroundOffer onClick={() => start({ format: 'background', useKnowledge })} />}
              </div>
            </DotMessage>
          ) : (
            <DotMessage text="I couldn't find that. Try 'DI logo' or browse Brand assets.">
              <div className="flex flex-wrap gap-2">
                {ASSET_PAGES.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="focus-ring inline-flex h-8 items-center rounded-full border border-line-card bg-card px-3 text-[13px] text-ink-secondary hover:bg-hover-soft"
                  >
                    {page.label}
                  </Link>
                ))}
                {offerBackground && <BackgroundOffer onClick={() => start({ format: 'background', useKnowledge })} />}
              </div>
            </DotMessage>
          )}
        </ol>
        <ReplyBar showBrief={false} onSend={(text) => send(text, useKnowledge)} useKnowledge={useKnowledge} onUseKnowledgeChange={setUseKnowledge} />
      </div>
    </div>
  )
}

function BackgroundOffer({ onClick }: { onClick: () => void }) {
  const format = getFormat('background')
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex h-8 items-center gap-2 rounded-full border border-line-card bg-card pl-1.5 pr-3 text-[13px] font-semibold text-ink hover:bg-hover-soft"
    >
      <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: format.color }}>
        <format.icon className="h-3 w-3" strokeWidth={2} />
      </span>
      Or make a virtual background
    </button>
  )
}
