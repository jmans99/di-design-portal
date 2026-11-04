'use client'

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { AudienceChips, CHIP, DotMessage, OpenBuilderButton, ReplyBar, TemplateBento, UserMessage } from '@/components/dot/conversation'
import { ComingSoonPill } from '@/components/dot/format-tiles'
import { getFormat } from '@/lib/dot/formats'
import { isSkip, matchAudienceGroup } from '@/lib/dot/intent'
import {
  GOALS,
  LENGTHS,
  SKIP,
  askedKeys,
  buildOutline,
  clearFrom,
  currentStep,
  deckDemoHref,
  goalFromReply,
  isAllReply,
  isContinueReply,
  isGenerateReply,
  matchLabel,
  matchLength,
  matchOfferingIds,
  matchTemplateReply,
  offeringCount,
  offeringsAnswer,
  parseDeckDemo,
  regionFromReply,
  selectedOfferingIds,
  type AnswerKey,
  type DeckCatalog,
  type DeckDemoState,
  type Slide,
} from '@/lib/dot/deck-demo'
import { DECK_TEMPLATES, getDeckTemplate } from '@/lib/dot/templates'
import { EXTERNAL_TOOLS } from '@/lib/external-tools'
import {
  AUDIENCES,
  AUDIENCE_GROUPS,
  getAudience,
  getAudienceGroup,
  needsForAudience,
  offeringsByCategory,
  offeringsForAudience,
} from '@/lib/knowledge'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

/**
 * The deck demo, for testing only (docs/design/dot-home.md, "Deck demo
 * (testing)"; showDeckDemo in lib/dot/settings.ts). Dot asks a few questions
 * one at a time and then shows a made-up deck outline. Nothing real is made,
 * nothing goes in Recent, and no AI or API is called. Every answer is in the
 * URL (lib/dot/deck-demo.ts).
 */

const NO_MATCH = "I didn't catch that. Pick one above, or try other words."

const QUESTIONS: Record<AnswerKey | 'review', string> = {
  template: 'Nice, a deck. Want to start from one of ours, or from scratch?',
  audience: 'Who is it for?',
  who: 'Anyone in particular?',
  goal: 'What should the deck do?',
  offerings: 'Which offerings should it cover?',
  length: 'How long should it be?',
  region: 'Is it for a specific country or region?',
  review: "Here's your brief. Ready when you are.",
}

const PROGRESS = ['Reading DI knowledge', 'Picking offerings for your audience', 'Writing the story', 'Laying out slides']

const ALL_OFFERINGS = offeringsByCategory().flatMap(({ offerings }) => offerings)
const ALL_IDS = ALL_OFFERINGS.map((o) => o.id)

const CATALOG: DeckCatalog = {
  audienceGroupIds: AUDIENCE_GROUPS.map((g) => g.id),
  audiences: AUDIENCES.map((a) => ({ id: a.id, groupId: a.audienceGroupId as string })),
  offeringIds: ALL_IDS,
}

const PRIMARY_BUTTON =
  'focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover'
const TEXT_BUTTON = 'focus-ring rounded text-[13px] font-semibold text-link hover:text-link-hover'
const SKIP_CHIP = cn(CHIP, 'border-dashed border-line-dashed')

/** ?demo=deck → the demo's answers so far; null for any other URL. */
export const deckDemoFromParams = (params: URLSearchParams) => parseDeckDemo(params, CATALOG)

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** prefers-reduced-motion as React state (false on the server, so the first render matches). */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)')
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    reducedMotion,
    () => false,
  )
}

const countLabel = (n: number) => (n === 1 ? '1 offering' : `${n} offerings`)

/** The answer as the user's message: what they picked, "Skip" when they skipped. */
function answerText(key: AnswerKey, state: DeckDemoState): string {
  const value = state[key]
  if (value === SKIP) return 'Skip'
  switch (key) {
    case 'template':
      return getDeckTemplate(state.template)?.name ?? ''
    case 'audience':
      return getAudienceGroup(state.audience ?? null)?.name ?? ''
    case 'who':
      return getAudience(state.who ?? '')?.name ?? ''
    case 'offerings':
      return state.offerings === 'all' ? `All ${ALL_IDS.length} offerings` : countLabel(offeringCount(state.offerings, ALL_IDS.length))
    case 'length':
      return LENGTHS.find((l) => l.id === state.length)?.label ?? ''
    default:
      return String(value ?? '')
  }
}

/** The Brief chips in the reply bar: what is chosen so far. */
function briefChips(state: DeckDemoState): { label: string; value: string | null }[] {
  const who = state.who && state.who !== SKIP ? getAudience(state.who)?.name : undefined
  const audience = state.audience === SKIP ? 'Skipped' : (who ?? getAudienceGroup(state.audience ?? null)?.name ?? null)
  const all = `All ${ALL_IDS.length}`
  const offerings = state.template === 'master-deck' || state.offerings === 'all' ? all : state.offerings ? countLabel(state.offerings.length) : null
  return [
    { label: 'Template', value: getDeckTemplate(state.template)?.name ?? null },
    { label: 'Audience', value: audience },
    { label: 'Goal', value: state.goal === SKIP ? 'Skipped' : (state.goal ?? null) },
    { label: 'Offerings', value: offerings },
    { label: 'Length', value: LENGTHS.find((l) => l.id === state.length)?.label.split(',')[0] ?? null },
  ]
}

export function DeckDemo({ state }: { state: DeckDemoState }) {
  const router = useRouter()
  const deck = getFormat('deck')
  const step = currentStep(state, CATALOG)
  const [notes, setNotes] = useState<string[]>([])
  // Offerings checked in the offerings step: those that serve the specific audience, or none.
  const [picked, setPicked] = useState<string[]>(() =>
    state.who && state.who !== SKIP ? offeringsForAudience(state.who).map((o) => o.id) : [],
  )
  const controls = useRef<HTMLDivElement>(null)

  const go = (patch: Partial<DeckDemoState>) => router.push(deckDemoHref({ ...state, ...patch }))
  const change = (key: AnswerKey) => router.push(deckDemoHref(clearFrom(state, key)))

  // Each step remounts this component (keyed on the URL): bring the newest message into view and
  // move focus to its first control, so the keyboard can carry on from there.
  useEffect(() => {
    if (step !== 'template' && step !== 'result') window.scrollTo({ top: document.body.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' })
    const root = controls.current
    ;(root?.querySelector<HTMLElement>('[data-autofocus]') ?? root?.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true })
  }, [step])

  const reply = (text: string) => {
    const q = text.trim()
    if (!q) return
    const noMatch = () => setNotes((n) => [...n, q])
    switch (step) {
      case 'template': {
        const template = matchTemplateReply(q, DECK_TEMPLATES)
        return template ? go({ template }) : noMatch()
      }
      case 'audience': {
        if (isSkip(q)) return go({ audience: SKIP })
        const group = matchAudienceGroup(q, AUDIENCE_GROUPS)
        return group ? go({ audience: group.id }) : noMatch()
      }
      case 'who': {
        if (isSkip(q)) return go({ who: SKIP })
        const options = AUDIENCES.filter((a) => a.audienceGroupId === state.audience).map((a) => ({ id: a.id, label: a.name }))
        const audience = matchLabel(q, options)
        return audience ? go({ who: audience.id }) : noMatch()
      }
      case 'goal': {
        const goal = goalFromReply(q)
        return goal ? go({ goal }) : noMatch()
      }
      case 'offerings': {
        const named = matchOfferingIds(q, ALL_OFFERINGS)
        if (named.length) return go({ offerings: offeringsAnswer(named, ALL_IDS) })
        if (isAllReply(q)) return go({ offerings: 'all' })
        if (isContinueReply(q)) return go({ offerings: offeringsAnswer(picked, ALL_IDS) })
        return noMatch()
      }
      case 'length':
        // Standard is the default for anything that is not a length.
        return go({ length: matchLength(q) ?? 'standard' })
      case 'region': {
        const region = regionFromReply(q)
        return region ? go({ region }) : noMatch()
      }
      case 'review':
        return isGenerateReply(q) ? go({ generated: true }) : noMatch()
      default:
        return noMatch()
    }
  }

  const stepControls = () => {
    switch (step) {
      case 'template':
        return <TemplateBento onPick={(template) => go({ template })} />
      case 'audience':
        return <AudienceChips onPick={(audience) => go({ audience })} />
      case 'who':
        return (
          <Chips
            label="Specific audience"
            options={AUDIENCES.filter((a) => a.audienceGroupId === state.audience).map((a) => ({ value: a.id, label: a.name }))}
            onPick={(who) => go({ who })}
            onSkip={() => go({ who: SKIP })}
          />
        )
      case 'goal':
        return <Chips label="Goal" options={GOALS.map((g) => ({ value: g, label: g }))} onPick={(goal) => go({ goal })} onSkip={() => go({ goal: SKIP })} />
      case 'offerings':
        return (
          <OfferingsPicker
            picked={picked}
            onChange={setPicked}
            onContinue={() => go({ offerings: offeringsAnswer(picked, ALL_IDS) })}
          />
        )
      case 'length':
        return <Chips label="Length" options={LENGTHS.map((l) => ({ value: l.id, label: l.label }))} onPick={(length) => go({ length: length as DeckDemoState['length'] })} />
      case 'region':
        return (
          <div>
            <Chips label="Country or region" options={[]} onSkip={() => go({ region: SKIP })} />
            <p className="mt-3 text-[13px] text-ink-muted">Type a country or region in the reply box, or skip.</p>
          </div>
        )
      case 'review':
        return <ReviewCard state={state} onChange={change} onGenerate={() => go({ generated: true })} />
      default:
        return null
    }
  }

  const asked = askedKeys(state, CATALOG)
  const reviewing = step === 'review' || step === 'result'

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line-divider bg-background/90 px-4 backdrop-blur md:px-6">
        <SidePanelToggle />
        <span aria-hidden className="h-4 w-px bg-line-divider" />
        <h1 className="truncate text-sm font-semibold text-ink">{deck.title}</h1>
        <span className="shrink-0">
          <ComingSoonPill>Demo</ComingSoonPill>
        </span>
        <Link href="/" className="focus-ring ml-auto shrink-0 rounded text-sm font-semibold text-link hover:text-link-hover">
          Start over
        </Link>
      </header>

      <div className={cn('mx-auto flex w-full max-w-[calc(760px+4rem)] flex-1 flex-col px-4 sm:px-8', styles.container)}>
        <ol className={cn('flex flex-1 flex-col gap-6 py-8', step === 'result' && 'pb-12')} aria-label="Conversation with Dot">
          <UserMessage format={deck}>{deck.action}</UserMessage>

          {asked.map((key) => {
            const answered = !!state[key]
            if (!answered && step !== key) return null
            return (
              <Fragment key={key}>
                <DotMessage text={QUESTIONS[key]}>{step === key && <div ref={controls}>{stepControls()}</div>}</DotMessage>
                {answered && <UserMessage format={deck}>{answerText(key, state)}</UserMessage>}
              </Fragment>
            )
          })}

          {reviewing && (
            <DotMessage text={QUESTIONS.review}>{step === 'review' && <div ref={controls}>{stepControls()}</div>}</DotMessage>
          )}

          {step === 'result' && (
            <>
              <UserMessage format={deck}>Generate deck</UserMessage>
              <Generate state={state} />
            </>
          )}

          {notes.map((note, i) => (
            <Fragment key={i}>
              <UserMessage>{note}</UserMessage>
              <DotMessage text={NO_MATCH} />
            </Fragment>
          ))}
        </ol>

        {step !== 'result' && (
          <ReplyBar format={deck} onSend={reply} chips={briefChips(state)} placeholder={step === 'region' ? 'Type a country or region, or skip' : undefined} />
        )}
      </div>
    </div>
  )
}

/** Answer chips under a question, plus a dashed Skip when the question can be skipped. */
function Chips({
  label,
  options,
  onPick,
  onSkip,
}: {
  label: string
  options: { value: string; label: string }[]
  onPick?: (value: string) => void
  onSkip?: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onPick?.(o.value)} className={CHIP}>
          {o.label}
        </button>
      ))}
      {onSkip && (
        <button type="button" onClick={onSkip} className={SKIP_CHIP}>
          Skip
        </button>
      )}
    </div>
  )
}

/** The 18 offerings as checkable chips under their 6 categories, with Select all, Clear and Continue. */
function OfferingsPicker({ picked, onChange, onContinue }: { picked: string[]; onChange: (ids: string[]) => void; onContinue: () => void }) {
  const toggle = (id: string) => onChange(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id])
  return (
    <div>
      <div className="flex flex-col gap-4">
        {offeringsByCategory().map(({ category, offerings }) => (
          <div key={category.id}>
            <p aria-hidden className="mb-2 text-xs text-ink-muted">
              {category.name}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={category.name}>
              {offerings.map((o) => {
                const on = picked.includes(o.id)
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(o.id)}
                    className={cn(CHIP, 'inline-flex items-center gap-1.5')}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
                    {o.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="button" onClick={onContinue} className={PRIMARY_BUTTON}>
          Continue
        </button>
        <button type="button" onClick={() => onChange(ALL_IDS)} className={TEXT_BUTTON}>
          Select all
        </button>
        <button type="button" onClick={() => onChange([])} className={TEXT_BUTTON}>
          Clear
        </button>
        <span aria-live="polite" className="text-[13px] text-ink-muted">
          {picked.length === 0 ? `None picked. I'll use all ${ALL_IDS.length}.` : `${picked.length} of ${ALL_IDS.length} picked`}
        </span>
      </div>
    </div>
  )
}

/** The brief so far: one row per answer, each with a Change link, then Generate deck. */
function ReviewCard({ state, onChange, onGenerate }: { state: DeckDemoState; onChange: (key: AnswerKey) => void; onGenerate: () => void }) {
  const audience = [getAudienceGroup(state.audience ?? null)?.name, state.who && state.who !== SKIP ? getAudience(state.who)?.name : undefined]
    .filter(Boolean)
    .join(' · ')
  const shown = (value: string | undefined, text: string) => (value === SKIP ? 'Skipped' : text)
  const master = state.template === 'master-deck'
  // The Master deck always has all 18 offerings, so that row has nothing to change.
  const rows: { key: AnswerKey; label: string; value: string; fixed?: boolean }[] = [
    { key: 'template', label: 'Template', value: getDeckTemplate(state.template)?.name ?? '' },
    { key: 'audience', label: 'Audience', value: shown(state.audience, audience) },
    { key: 'goal', label: 'Goal', value: shown(state.goal, state.goal ?? '') },
    {
      key: 'offerings',
      label: 'Offerings',
      value: master || state.offerings === 'all' ? `All ${ALL_IDS.length}` : countLabel(offeringCount(state.offerings, ALL_IDS.length)),
      fixed: master,
    },
    { key: 'length', label: 'Length', value: LENGTHS.find((l) => l.id === state.length)?.label ?? '' },
    { key: 'region', label: 'Country or region', value: shown(state.region, state.region ?? '') },
  ]
  return (
    <div>
      <dl className="overflow-hidden rounded-2xl border border-line-card bg-card">
        {rows.map((row) => (
          <div key={row.key} className="flex items-baseline gap-3 border-b border-line-divider px-4 py-2.5 last:border-b-0">
            <dt className="w-[88px] shrink-0 text-xs text-ink-muted sm:w-[132px]">{row.label}</dt>
            <dd className="min-w-0 flex-1 break-words text-sm text-ink">{row.value}</dd>
            {row.fixed ? (
              <span aria-hidden className="w-[52px] shrink-0" />
            ) : (
              <button type="button" onClick={() => onChange(row.key)} aria-label={`Change ${row.label.toLowerCase()}`} className={cn(TEXT_BUTTON, 'shrink-0')}>
                Change
              </button>
            )}
          </div>
        ))}
      </dl>
      <button type="button" data-autofocus onClick={onGenerate} className={cn(PRIMARY_BUTTON, 'mt-4')}>
        Generate deck
      </button>
    </div>
  )
}

/**
 * "Generating": a short progress list that ticks through in about 3 seconds,
 * then the made-up outline. With reduced motion the result shows straight away.
 * Nothing is made, nothing is saved, and nothing is called.
 */
function Generate({ state }: { state: DeckDemoState }) {
  const reduced = useReducedMotion()
  const [timedOut, setTimedOut] = useState(false)
  // How many steps of the list are finished.
  const [finished, setFinished] = useState(0)
  const preview = useRef<HTMLDivElement>(null)
  // With reduced motion there is no waiting: the result shows straight away.
  const done = reduced || timedOut

  useEffect(() => {
    if (reduced) return
    const timers = PROGRESS.map((_, i) => setTimeout(() => setFinished(i + 1), 700 * (i + 1)))
    timers.push(setTimeout(() => setTimedOut(true), 700 * PROGRESS.length + 300))
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  useEffect(() => {
    if (done) preview.current?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [done])

  if (!done) {
    return (
      <DotMessage text="On it. Putting your deck together." animated>
        <ul aria-live="polite" aria-label="Progress" className="flex flex-col gap-2">
          {PROGRESS.map((label, i) =>
            i > finished ? null : (
              <li key={label} className="flex items-center gap-2 text-sm text-ink-secondary">
                {i < finished ? (
                  <Check className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} aria-hidden />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 text-ink-muted motion-safe:animate-spin" strokeWidth={2} aria-hidden />
                )}
                {label}
                <span className="sr-only">{i < finished ? ' (done)' : ''}</span>
              </li>
            ),
          )}
        </ul>
      </DotMessage>
    )
  }

  return (
    <DotMessage text="Here's a preview of how your deck could look.">
      <div ref={preview} className="scroll-mt-32">
        <ol aria-label="Deck outline preview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outlineFor(state).map((slide, i) => (
            <SlideCard key={i} slide={slide} number={i + 1} />
          ))}
        </ol>
        <p className="mt-4 text-[13px] text-ink-muted">This is a demo. No deck was made. Real decks are made in the deck builder.</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <OpenBuilderButton href={EXTERNAL_TOOLS.deck} type="deck" />
          <Link href="/" className={TEXT_BUTTON}>
            Start over
          </Link>
        </div>
      </div>
    </DotMessage>
  )
}

/** The outline for the answers, from the knowledge data and fixed rules (lib/dot/deck-demo.ts). */
function outlineFor(state: DeckDemoState): Slide[] {
  const ids = selectedOfferingIds(state.offerings, ALL_IDS)
  const who = state.who && state.who !== SKIP ? getAudience(state.who) : undefined
  const group = state.audience && state.audience !== SKIP ? getAudienceGroup(state.audience) : undefined
  return buildOutline({
    goal: state.goal === SKIP ? undefined : state.goal,
    audienceName: who?.name ?? group?.name,
    region: state.region === SKIP ? undefined : state.region,
    needNames: who ? needsForAudience(who.id).flatMap((g) => g.needs.map((n) => n.name)) : [],
    categories: offeringsByCategory()
      .map(({ category, offerings }) => ({ name: category.name, offerings: offerings.filter((o) => ids.includes(o.id)) }))
      .filter((c) => c.offerings.length > 0),
    length: state.length ?? 'standard',
  })
}

/** A 16:9 slide thumbnail: a number, a title and a few lines. */
function SlideCard({ slide, number }: { slide: Slide; number: number }) {
  return (
    <li className="relative flex aspect-video flex-col overflow-hidden rounded-2xl border border-line-card bg-card px-3.5 pb-3 pt-3.5">
      <span className="sr-only">Slide {number}: </span>
      <h3 className={cn('line-clamp-2 pr-5 font-heading font-semibold leading-snug text-ink', number === 1 ? 'text-[15px]' : 'text-[13px]')}>{slide.title}</h3>
      <ul className="mt-1.5 flex flex-col gap-0.5 overflow-hidden text-[11px] leading-snug text-ink-secondary">
        {slide.lines.slice(0, 3).map((line, i) => (
          <li key={i} className="line-clamp-2">
            {line}
          </li>
        ))}
      </ul>
      <span aria-hidden className="absolute right-3 top-3 text-[11px] text-ink-muted">
        {number}
      </span>
    </li>
  )
}
