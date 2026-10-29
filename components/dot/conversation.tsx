'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Plus } from 'lucide-react'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { BriefingArt, PartnershipArt, SlidesArt } from '@/components/dot/dot-art'
import { RecommendedPill, SmallFormatTiles } from '@/components/dot/format-tiles'
import { DotOrb } from '@/components/dot/dot-orb'
import { FormatIcon } from '@/components/dot/format-icon'
import { recentLabel, useDot } from '@/components/dot/use-dot'
import { briefHref } from '@/lib/brief'
import { SKIP_AUDIENCE, conversationHref, type ConversationState } from '@/lib/dot/conversation'
import { getFormat, type Format } from '@/lib/dot/formats'
import { isSkip, matchAudienceGroup, matchIntent, matchTemplate, type DeckTemplateId } from '@/lib/dot/intent'
import { addRecent } from '@/lib/dot/recent'
import { DECK_TEMPLATES, getDeckTemplate } from '@/lib/dot/templates'
import { AUDIENCE_GROUPS, getAudienceGroup } from '@/lib/knowledge'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

const NO_MATCH = "I couldn't match that yet. Pick one of these to start:"
const NO_MATCH_AGAIN = "I couldn't match that yet. Pick one above, or try other words."

/**
 * Dot's scripted conversation (docs/design/dot-home.md, section 3). No AI:
 * every reply is fixed text, and each step is in the URL.
 */
export function Conversation({ state }: { state: ConversationState }) {
  const { start, push, replace } = useDot()
  const [notes, setNotes] = useState<string[]>([])

  const format = state.format ? getFormat(state.format) : undefined
  const template = getDeckTemplate(state.templateId)
  const group = state.audience && state.audience !== SKIP_AUDIENCE ? getAudienceGroup(state.audience) : undefined
  const isDeck = format?.type === 'deck'
  const askAudience = !!format && !format.href && (!isDeck || !!template)
  const complete = askAudience && !!state.audience

  const go = (patch: Partial<ConversationState>) => push(conversationHref({ ...state, ...patch }))

  // A format with a tool (e.g. a /?new=map link) opens the tool.
  useEffect(() => {
    if (format?.href) replace(briefHref({ outputType: format.type, useKnowledge: state.useKnowledge })!)
  }, [format, state.useKnowledge, replace])

  // A finished brief for a tool that is not built yet goes in Recent.
  useEffect(() => {
    if (!complete || !format) return
    addRecent({
      label: recentLabel({ ...state, format: format.type }),
      href: conversationHref({ ...state, q: undefined }),
      color: format.color,
    })
  }, [complete, format, state])

  // Each step remounts this component (keyed on the URL): bring the newest message into view.
  useEffect(() => {
    if (notes.length > 0 || state.templateId || state.audience) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [notes.length, state.templateId, state.audience])

  const reply = (text: string) => {
    const q = text.trim()
    if (isDeck && !template) {
      const templateId = matchTemplate(q)
      const audience = matchAudienceGroup(q, AUDIENCE_GROUPS)?.id
      // "Tell me who it's for…": an audience on its own starts from scratch.
      if (templateId || audience) return go({ templateId: templateId ?? 'from-scratch', audience })
    }
    if (askAudience && !state.audience) {
      if (isSkip(q)) return go({ audience: SKIP_AUDIENCE })
      const audience = matchAudienceGroup(q, AUDIENCE_GROUPS)?.id
      if (audience) return go({ audience })
    }
    const intent = matchIntent(q)
    if (intent.kind === 'format') return start({ format: intent.outputType, templateId: intent.templateId, q, useKnowledge: state.useKnowledge })
    setNotes((n) => [...n, q])
  }

  const startFormat = (type: Format['type']) => start({ format: type, useKnowledge: state.useKnowledge })

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line-divider bg-background/90 px-4 backdrop-blur md:px-6">
        <SidePanelToggle />
        <span aria-hidden className="h-4 w-px bg-line-divider" />
        <h1 className="truncate text-sm font-semibold text-ink">{format?.title ?? 'New chat'}</h1>
        <Link href="/" className="focus-ring ml-auto rounded text-sm font-semibold text-primary-700 hover:text-primary-800">
          Start over
        </Link>
      </header>

      <div className={cn('mx-auto flex w-full max-w-[calc(760px+4rem)] flex-1 flex-col px-4 sm:px-8', styles.container)}>
        <ol className="flex flex-1 flex-col gap-6 py-8" aria-label="Conversation with Dot">
          <UserMessage format={format}>{state.q ?? format?.action}</UserMessage>

          {!format && (
            <DotMessage text={NO_MATCH}>
              <SmallFormatTiles onStart={startFormat} />
            </DotMessage>
          )}

          {format?.href && <DotMessage text={`Opening the ${format.toolName}…`} />}

          {isDeck && (
            <DotMessage text="Nice, a deck. Want to start from one of ours, or from scratch?">
              <TemplateBento selected={state.templateId} onPick={(templateId) => go({ templateId, audience: undefined })} />
              <p className="mt-3 text-[13px] text-ink-muted">
                Or tell me who it&apos;s for and what it should cover, and I&apos;ll build it from what we know.
              </p>
            </DotMessage>
          )}

          {isDeck && template && <UserMessage format={format}>{template.name}</UserMessage>}

          {askAudience && (
            <DotMessage text={isDeck ? 'Who is it for?' : 'Nice, a two-pager. Who is it for?'}>
              <AudienceChips selected={state.audience} onPick={(audience) => go({ audience })} />
            </DotMessage>
          )}

          {complete && format && (
            <>
              <UserMessage format={format}>{group?.name ?? 'Skip'}</UserMessage>
              <DotMessage
                text={`The ${format.toolName} is coming soon. I've saved your brief in Recent so you can pick it up later.`}
              />
            </>
          )}

          {notes.map((note, i) => (
            <Fragment key={i}>
              <UserMessage>{note}</UserMessage>
              <DotMessage text={format ? NO_MATCH_AGAIN : NO_MATCH}>{!format && <SmallFormatTiles onStart={startFormat} />}</DotMessage>
            </Fragment>
          ))}
        </ol>

        <ReplyBar format={format} templateName={isDeck ? (template?.name ?? null) : undefined} audienceName={state.audience ? (group?.name ?? 'Skip') : null} onSend={reply} />
      </div>
    </div>
  )
}

function UserMessage({ format, children }: { format?: Format; children: React.ReactNode }) {
  return (
    <li className="flex justify-end">
      <span className="sr-only">You: </span>
      <p className="flex max-w-[85%] items-center gap-2.5 rounded-[14px] bg-[#F2F4F6] px-3.5 py-2.5 text-[15px] leading-[1.5] text-ink">
        {format && <FormatIcon format={format} size={20} />}
        <span className="min-w-0 break-words">{children}</span>
      </p>
    </li>
  )
}

function DotMessage({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <DotOrb size={28} />
      <div className="min-w-0 flex-1">
        <p className="pt-0.5 text-[15px] leading-[1.55] text-ink">
          <span className="sr-only">Dot: </span>
          {text}
        </p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </li>
  )
}

const TEMPLATE_TILE = 'focus-ring relative flex flex-col overflow-hidden rounded-[18px] border p-4 text-left transition-shadow hover:shadow-[0_6px_18px_rgba(26,42,60,.08)] aria-pressed:ring-2 aria-pressed:ring-primary-700 aria-pressed:ring-offset-2'

/** Deck templates (docs/design/dot-home.md, 3b). */
function TemplateBento({ selected, onPick }: { selected?: DeckTemplateId; onPick: (id: DeckTemplateId) => void }) {
  const t = Object.fromEntries(DECK_TEMPLATES.map((d) => [d.id, d])) as Record<DeckTemplateId, (typeof DECK_TEMPLATES)[number]>
  const pressed = (id: DeckTemplateId) => ({ 'aria-pressed': selected === id, onClick: () => onPick(id), type: 'button' as const })

  return (
    <div className={styles.templates}>
      <button {...pressed('from-scratch')} className={cn(TEMPLATE_TILE, styles.scratch, 'justify-between border-dashed border-line-dashed bg-white')}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F4F6] text-ink-secondary">
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span>
          <span className="block font-heading text-[15px] font-semibold text-ink">{t['from-scratch'].name}</span>
          <span className="mt-1 block text-xs text-ink-secondary">{t['from-scratch'].description}</span>
        </span>
      </button>

      <button {...pressed('master-deck')} className={cn(TEMPLATE_TILE, styles.masterTemplate, 'justify-between gap-4 border-line-card bg-[#F3F8FB] p-5')}>
        <span className="flex items-start justify-between gap-3">
          <RecommendedPill />
          <SlidesArt scale={1.875} />
        </span>
        <span>
          <span className="block font-heading text-xl font-semibold text-ink">{t['master-deck'].name}</span>
          <span className="mt-1 block text-[13px] text-ink-secondary">{t['master-deck'].description}</span>
        </span>
      </button>

      <button {...pressed('partnership-deck')} className={cn(TEMPLATE_TILE, styles.partnership, 'justify-end border-transparent bg-[#1A2A3C]')}>
        <span className="absolute right-4 top-4">
          <PartnershipArt />
        </span>
        <span className="block font-heading text-[15px] font-semibold text-white">{t['partnership-deck'].name}</span>
        <span className="mt-0.5 block text-xs text-[#DAF1FF]">{t['partnership-deck'].description}</span>
      </button>

      <button {...pressed('government-briefing')} className={cn(TEMPLATE_TILE, styles.government, 'justify-end border-transparent bg-[#DAF1FF]')}>
        <span className="absolute right-4 top-4">
          <BriefingArt />
        </span>
        <span className="block font-heading text-[15px] font-semibold text-ink">{t['government-briefing'].name}</span>
        <span className="mt-0.5 block text-xs text-[#0F4772]">{t['government-briefing'].description}</span>
      </button>
    </div>
  )
}

/** Audience groups from data/knowledge, plus Skip. */
function AudienceChips({ selected, onPick }: { selected?: string; onPick: (audience: string) => void }) {
  const chip =
    'focus-ring h-8 rounded-full border border-line-card bg-white px-3 text-[13px] text-ink-secondary transition-colors hover:bg-[#F7F9FA] aria-pressed:border-transparent aria-pressed:bg-[#EEF1F4] aria-pressed:font-semibold aria-pressed:text-ink'
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Audience">
      {AUDIENCE_GROUPS.map((g) => (
        <button key={g.id} type="button" aria-pressed={selected === g.id} onClick={() => onPick(g.id)} className={chip}>
          {g.name}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={selected === SKIP_AUDIENCE}
        onClick={() => onPick(SKIP_AUDIENCE)}
        className={cn(chip, 'border-dashed border-line-dashed')}
      >
        Skip
      </button>
    </div>
  )
}

/**
 * Sticky reply bar: the brief so far as chips, then the reply input.
 * `templateName`: undefined = no Template chip (not a deck); null = not chosen yet.
 */
function ReplyBar({
  format,
  templateName,
  audienceName,
  onSend,
}: {
  format?: Format
  templateName: string | null | undefined
  audienceName: string | null
  onSend: (text: string) => void
}) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0
  const color = format?.color ?? '#5C6B7A'

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-background from-70% to-transparent pb-4 pt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSend) return
          onSend(text)
          setText('')
        }}
        className="rounded-[20px] border border-line-card bg-white px-4 pb-2.5 pt-3 shadow-[0_10px_32px_rgba(26,42,60,.07)]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted">Brief</span>
          <BriefChip label="Format" value={format?.label ?? null} color={color} />
          {templateName !== undefined && <BriefChip label="Template" value={templateName} color={color} />}
          <BriefChip label="Audience" value={audienceName} color={color} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="dot-reply" className="sr-only">
            Reply to Dot
          </label>
          <input
            id="dot-reply"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reply to Dot, or pick one above"
            autoComplete="off"
            className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-1 text-[15px] text-ink outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-primary-700"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send to Dot"
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-line-dashed"
          >
            <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </form>
    </div>
  )
}

function BriefChip({ label, value, color }: { label: string; value: string | null; color: string }) {
  if (!value) {
    return <span className="inline-flex h-7 items-center rounded-full border border-dashed border-line-dashed px-2.5 text-xs text-ink-muted">{label}</span>
  }
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#F2F4F6] pl-1.5 pr-2.5 text-xs text-ink">
      <span aria-hidden className="h-4 w-4 rounded-[4px]" style={{ backgroundColor: color }} />
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  )
}
