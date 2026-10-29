'use client'

import { useId, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUp, Plus } from 'lucide-react'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { DotOrb } from '@/components/dot/dot-orb'
import { MoreMenu, RecommendedPill } from '@/components/dot/format-tiles'
import { MasterDeckArt, SlidesArt, SocialPostArt, TwoPagerArt } from '@/components/dot/dot-art'
import { Conversation } from '@/components/dot/conversation'
import { useDot } from '@/components/dot/use-dot'
import { Switch } from '@/components/ui/switch'
import { conversationFromParams } from '@/lib/dot/conversation'
import type { OutputType } from '@/lib/brief'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

const TILE = 'focus-ring relative overflow-hidden rounded-2xl border text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(26,42,60,.08)]'
const TILE_TITLE = 'font-heading text-[15px] font-semibold leading-snug text-ink'
const TILE_SUB = 'mt-0.5 text-xs text-ink-secondary'

/** Home page: Dot's box with format tiles, or the conversation once something is picked (state in the URL). */
export function DotHome() {
  const state = conversationFromParams(useSearchParams())
  // Keyed on the URL so a new step starts with fresh local state.
  if (state) return <Conversation key={JSON.stringify(state)} state={state} />
  return <EmptyHome />
}

export function EmptyHome() {
  const [useKnowledge, setUseKnowledge] = useState(true)
  const { start, send } = useDot()
  const startFormat = (format: OutputType, templateId?: 'master-deck') => start({ format, templateId, useKnowledge })

  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="absolute left-4 top-3">
        <SidePanelToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-8 pb-[120px] pt-10">
        <div className={cn('w-full max-w-[760px]', styles.container)}>
          <div className="mb-6 flex items-center justify-center gap-3.5">
            <DotOrb size={40} />
            {/* There is no login yet; a user name replaces "there" later. */}
            <h1 className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">Hi there, what do you need today?</h1>
          </div>
          <DotBox
            useKnowledge={useKnowledge}
            onUseKnowledgeChange={setUseKnowledge}
            onSend={(text) => send(text, useKnowledge)}
            placeholder="Describe what you want to make or find"
            label="Ask Dot"
          />
          <FormatBento onStart={startFormat} />
        </div>
      </main>
    </div>
  )
}

/** Dot's box: a growing textarea, the "Use DI knowledge" switch and the send button. */
export function DotBox({
  onSend,
  placeholder,
  label,
  useKnowledge,
  onUseKnowledgeChange,
  className,
}: {
  onSend: (text: string) => void
  placeholder: string
  label: string
  /** Leave out to hide the switch (the reply bar). */
  useKnowledge?: boolean
  onUseKnowledgeChange?: (value: boolean) => void
  className?: string
}) {
  const id = useId()
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0

  // 2 rows, growing to about 6 rows (15px × 1.5 line height, plus padding).
  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 6 * 22.5 + 24)}px`
  }
  const submit = () => {
    if (!canSend) return
    onSend(text)
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  return (
    <form
      // Without the page's script, the box still works: it submits to /?q=… and Dot reads it from the URL.
      action="/"
      method="get"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={cn('rounded-[22px] border border-line-card bg-white shadow-[0_10px_32px_rgba(26,42,60,.07)]', className)}
    >
      <label className="sr-only" htmlFor={`${id}-input`}>
        {label}
      </label>
      <textarea
        id={`${id}-input`}
        ref={ref}
        name="q"
        rows={2}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value)
          grow(e.target)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        className="block w-full resize-none rounded-t-[22px] border-0 bg-transparent px-[22px] pb-1 pt-5 font-sans text-[15px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-700"
      />
      <div className="flex items-center justify-end gap-4 px-3 pb-3 pt-1">
        {useKnowledge !== undefined && onUseKnowledgeChange && (
          <div className="flex items-center gap-2">
            <Switch
              id={`${id}-knowledge`}
              checked={useKnowledge}
              onCheckedChange={onUseKnowledgeChange}
              className="focus-ring h-5 w-9 data-[state=checked]:bg-primary-700 data-[state=unchecked]:bg-line-dashed [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
            />
            <label htmlFor={`${id}-knowledge`} className="cursor-pointer text-[13px] text-ink-secondary">
              Use DI knowledge
            </label>
          </div>
        )}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send to Dot"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-line-dashed"
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </form>
  )
}

/** Format tiles under Dot's box (docs/design/dot-home.md, 2c). */
function FormatBento({ onStart }: { onStart: (format: OutputType, templateId?: 'master-deck') => void }) {
  return (
    <div className={cn('mt-4', styles.bento)}>
      <button
        type="button"
        onClick={() => onStart('deck')}
        className={cn(TILE, styles.deck, 'flex items-center justify-between gap-3 border-line-card bg-[#F3F8FB] px-5')}
      >
        <span>
          <span className={cn(TILE_TITLE, 'block')}>Create a deck</span>
          <span className={cn(TILE_SUB, 'block')}>From a template or from scratch</span>
        </span>
        <SlidesArt />
      </button>
      <button
        type="button"
        onClick={() => onStart('social-post')}
        className={cn(TILE, styles.social, 'flex flex-col justify-end border-transparent bg-[#FDEEF2] p-4')}
      >
        <span className="absolute right-3 top-3">
          <SocialPostArt />
        </span>
        <span className={cn(TILE_TITLE, 'pr-10')}>Make a social post</span>
      </button>
      <button
        type="button"
        onClick={() => onStart('two-pager')}
        className={cn(TILE, styles.twoPager, 'flex flex-col justify-end border-transparent bg-[#EEF0FF] p-4')}
      >
        <span className="absolute right-3 top-3">
          <TwoPagerArt />
        </span>
        <span className={cn(TILE_TITLE, 'pr-10')}>Write a two-pager</span>
      </button>
      <MoreMenu onStart={onStart}>
        <button
          type="button"
          className={cn(
            TILE,
            styles.more,
            'flex flex-col items-center justify-center gap-2 border-dashed border-line-dashed bg-white hover:translate-y-0 data-[state=open]:bg-[#F7F9FA]',
          )}
        >
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F2F4F6] text-ink-secondary">
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="text-xs text-ink-secondary">More</span>
        </button>
      </MoreMenu>
      <button
        type="button"
        onClick={() => onStart('deck', 'master-deck')}
        className={cn(TILE, styles.master, 'flex items-center justify-between gap-4 border-[#DAF1FF] bg-[#EEF9FF] px-5')}
      >
        <span className="min-w-0">
          <RecommendedPill />
          <span className="mt-1.5 block font-heading text-[17px] font-semibold text-ink">DI Master deck</span>
          <span className={cn(TILE_SUB, 'block')}>All 18 offerings. Dot tailors it to your audience.</span>
        </span>
        <span className={styles.masterArt}>
          <MasterDeckArt />
        </span>
      </button>
    </div>
  )
}
