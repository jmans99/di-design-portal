'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Download } from 'lucide-react'
import { CHIP, DotMessage, OpenBuilderButton, ReplyBar, UserMessage } from '@/components/dot/conversation'
import { PitchSlideView, SlideDialog, SnapshotCard, StatusPill, slideName } from '@/components/dot/country-pitch-parts'
import { Chips, DemoTopBar, PRIMARY_BUTTON, ProgressList, ReviewRows, SKIP_CHIP, TEXT_BUTTON, reducedMotion, useReducedMotion, type ReviewRow } from '@/components/dot/demo-parts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import pitchJson from '@/data/demo/country-pitch.json'
import {
  DEFAULT_GOAL,
  GOALS,
  LENGTHS,
  SKIP,
  autoplayPause,
  autoplaySlideIndexes,
  demoPickChanges,
  buildPitchSlides,
  clearPitchFrom,
  countryPitchHref,
  currentPitchStep,
  footnoteNumbers,
  gapLabel,
  isBuildReply,
  isYesReply,
  latestRecord,
  notYetPicked,
  notYetWarning,
  parseCountryPitch,
  preselectOfferings,
  readOpening,
  statusOf,
  type CountryPitchData,
  type CountryPitchState,
  type Fact,
  type PitchCatalog,
  type PitchKey,
  type PitchOffering,
  type PitchSlide,
  type PitchStep,
  type PitchView,
} from '@/lib/dot/country-pitch-demo'
import { goalFromReply, isContinueReply, isGenerateReply, matchLength } from '@/lib/dot/deck-demo'
import { getFormat } from '@/lib/dot/formats'
import { showIllustrativeNote } from '@/lib/dot/settings'
import { EXTERNAL_TOOLS } from '@/lib/external-tools'
import { AUDIENCES, getAudience, getAudienceGroup, needsForAudience, offeringsByCategory, offeringsForAudience } from '@/lib/knowledge'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

/**
 * The Country pitch demo, for testing and for recording the Cable to Child
 * demo video (docs/design/dot-home.md, "Country pitch demo (testing)";
 * showCountryPitchDemo in lib/dot/settings.ts). A country engagement lead sees
 * what DI knows about a country, builds a pitch from it, then commits what
 * she learned. Every fact has a source, evidence keeps its exact wording,
 * gaps are flagged and not filled, and people commit, Dot only suggests.
 * Nothing real is made or saved, nothing goes in Recent, and no AI or API is
 * called. Every answer is in the URL (lib/dot/country-pitch-demo.ts).
 */

const DATA = pitchJson as CountryPitchData
const COUNTRY = DATA.country.name

const ALL_OFFERINGS = offeringsByCategory().flatMap(({ offerings }) => offerings)
const ALL_IDS = ALL_OFFERINGS.map((o) => o.id)

const CATALOG: PitchCatalog = {
  country: DATA.country,
  audiences: AUDIENCES.map((a) => ({ id: a.id, name: a.name })),
  offeringIds: ALL_IDS,
}

/** Every fact a chip or a footnote can point to, by id. */
const FACTS = new Map<string, Pick<Fact, 'id' | 'excerpt' | 'source'> & { label: string }>(
  [...DATA.connectivity, DATA.offeringStatusSource, ...DATA.records.map((r) => ({ ...r, label: r.title }))].map((f) => [f.id, f]),
)

const CASE_STUDY = latestRecord(DATA.records, 'case-study')
const ENGAGEMENT = latestRecord(DATA.records, 'engagement')

const PROGRESS = [
  `Reading what DI knows about ${COUNTRY}`,
  'Checking which offerings are available',
  "Applying Comms' narrative and key terms",
  'Laying out slides with approved assets',
]

const NO_MATCH = "I didn't catch that. Pick one above, or try other words."
const NO_OPENING = `I couldn't pick out a country and an audience in that. This demo has sample data for ${COUNTRY}. Try: "${DATA.opening}"`

const QUESTIONS: Partial<Record<PitchStep, string>> = {
  opening: "Tell me who you're meeting and where. I'll pull together what DI knows.",
  confirm: 'Got it. I picked out the country and the audience.',
  snapshot: `Here's what DI knows about ${COUNTRY}.`,
  goal: 'What should the pitch do?',
  offerings: 'Which offerings should it cover?',
  length: 'How long should it be?',
  review: "Here's your brief. Ready when you are.",
}

/** ?demo=country-pitch → the demo's answers and view; null for any other URL. */
export const countryPitchFromParams = (params: URLSearchParams) => parseCountryPitch(params, CATALOG)

const STEP_INDEX = (step: PitchStep) =>
  ['opening', 'confirm', 'snapshot', 'goal', 'offerings', 'length', 'review', 'result'].indexOf(
    step === 'case-study' || step === 'submitted' || step === 'not-now' ? 'result' : step,
  )

const countLabel = (n: number) => (n === 1 ? '1 offering' : `${n} offerings`)

function IllustrativeNote() {
  if (!showIllustrativeNote) return null
  return <p className="mt-2 text-xs text-ink-muted">Illustrative data</p>
}

export function CountryPitchDemo({ state, view }: { state: CountryPitchState; view: PitchView }) {
  const router = useRouter()
  const deck = getFormat('deck')
  const step = currentPitchStep(state)
  const at = STEP_INDEX(step)
  const reduced = useReducedMotion()

  const audience = state.audience ? getAudience(state.audience) : undefined
  const group = audience ? getAudienceGroup(audience.audienceGroupId) : undefined
  const audienceOfferingIds = useMemo(() => (state.audience ? offeringsForAudience(state.audience).map((o) => o.id) : []), [state.audience])

  const [notes, setNotes] = useState<{ text: string; reply: string }[]>([])
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState<string[]>(() => state.offerings ?? preselectOfferings(audienceOfferingIds, DATA))
  const [openFact, setOpenFact] = useState<string | null>(null)
  const [openSlide, setOpenSlide] = useState<number | null>(null)
  // The slides show at once, except right after "Generate pitch" (the progress list plays first).
  const [finished, setFinished] = useState(step === 'result' ? 0 : PROGRESS.length)
  const slidesReady = finished >= PROGRESS.length
  // Autoplay "presses" a control for a beat before it acts, so the video shows what was picked.
  const [flash, setFlash] = useState<string | null>(null)
  const [caseDraft, setCaseDraft] = useState(DATA.caseStudyDraft)
  // The latest picks and draft, for autoplay's timers (they were set up when the step opened).
  const latest = useRef({ picked, caseDraft })
  useEffect(() => {
    latest.current = { picked, caseDraft }
  })
  const current = useRef<HTMLDivElement>(null)
  const slidesRef = useRef<HTMLDivElement>(null)
  const commitRef = useRef<HTMLDivElement>(null)

  const go = (patch: Partial<CountryPitchState>) => router.push(countryPitchHref({ ...state, ...patch }, view), { scroll: false })
  const change = (key: PitchKey) => router.push(countryPitchHref(clearPitchFrom(state, key), view), { scroll: false })

  const slides = useMemo(() => (state.generated ? slidesFor(state) : []), [state])
  const footnotes = useMemo(() => footnoteNumbers(slides), [slides])

  // "Generating": the progress list ticks through, then the slides. No waiting with reduced motion.
  useEffect(() => {
    if (step !== 'result') return
    const each = reduced ? 0 : Math.round(700 / view.speed)
    const timers = PROGRESS.map((_, i) => setTimeout(() => setFinished(i + 1), each * (i + 1)))
    return () => timers.forEach(clearTimeout)
  }, [step, reduced, view.speed])

  // Each step remounts this component (keyed on the URL): bring the newest message to the top of the view,
  // and (not in autoplay, where a focus ring would show in the video) move focus to its first control.
  useEffect(() => {
    if (step === 'opening') return
    const target = step === 'result' ? null : current.current?.closest('li')
    if (target) scrollToTop(target)
    if (!view.autoplay) {
      const root = current.current?.parentElement
      ;(root?.querySelector<HTMLElement>('[data-autofocus]') ?? root?.querySelector<HTMLElement>('button, input'))?.focus({ preventScroll: true })
    }
  }, [step, view.autoplay])

  useEffect(() => {
    if (step === 'result' && slidesReady && slidesRef.current) scrollToTop(slidesRef.current.closest('li') ?? slidesRef.current)
  }, [step, slidesReady])

  // The clean recording frame also hides the floating Giga notice (app/globals.css, html[data-clean-frame]).
  useEffect(() => {
    if (!view.clean) return
    document.documentElement.dataset.cleanFrame = ''
    return () => {
      delete document.documentElement.dataset.cleanFrame
    }
  }, [view.clean])

  // ---- Answers ----

  const sendOpening = (text: string) => {
    const found = readOpening(text, CATALOG)
    if (found.country && found.audience) {
      setDraft('')
      return go({ q: text.trim().slice(0, 160), country: found.country, audience: found.audience })
    }
    setNotes((n) => [...n, { text, reply: NO_OPENING }])
  }
  const confirm = () => go({ confirmed: true })
  const build = () => go({ pitch: true })
  const continueOfferings = (ids = picked) => ids.length > 0 && go({ offerings: ALL_IDS.filter((id) => ids.includes(id)) })
  const generate = () => go({ generated: true })
  const submitCase = (draftNow = caseDraft) => draftNow.title.trim() && go({ caseTitle: draftNow.title.trim().slice(0, 100) })

  const reply = (text: string) => {
    const q = text.trim()
    if (!q) return
    const noMatch = () => setNotes((n) => [...n, { text: q, reply: NO_MATCH }])
    switch (step) {
      case 'opening':
        return sendOpening(q)
      case 'confirm':
        return isYesReply(q) ? confirm() : noMatch()
      case 'snapshot':
        return isBuildReply(q) ? build() : noMatch()
      case 'goal': {
        const goal = goalFromReply(q)
        return goal ? go({ goal }) : noMatch()
      }
      case 'offerings':
        return isContinueReply(q) && picked.length ? continueOfferings() : noMatch()
      case 'length':
        return go({ length: matchLength(q) ?? 'standard' })
      case 'review':
        return isGenerateReply(q) ? generate() : noMatch()
      default:
        return noMatch()
    }
  }

  // ---- Recording mode: &autoplay=1 plays the flow by itself ----

  useEffect(() => {
    if (!view.autoplay) return
    if (step === 'result' && !slidesReady) return
    const pause = (kind: 'step' | 'hold' | 'beat') => autoplayPause(kind, view.speed, reduced)
    const timers: ReturnType<typeof setTimeout>[] = []
    let t = 0
    const then = (ms: number, fn: () => void) => {
      t += ms
      timers.push(setTimeout(fn, t))
    }
    const press = (key: string, fn: () => void) => {
      then(0, () => setFlash(key))
      then(pause('beat'), () => {
        setFlash(null)
        fn()
      })
    }

    switch (step) {
      case 'opening': {
        const text = DATA.opening
        then(pause('step'), () => {})
        if (reduced) then(0, () => setDraft(text))
        else for (let i = 1; i <= text.length; i++) then(Math.round(38 / view.speed), () => setDraft(text.slice(0, i)))
        then(pause('beat'), () => sendOpening(text))
        break
      }
      case 'confirm':
        then(pause('step'), () => {})
        press('confirm', confirm)
        break
      case 'snapshot': {
        const first = DATA.connectivity[0]?.id
        then(pause('hold'), () => first && setOpenFact(first))
        then(pause('hold'), () => setOpenFact(null))
        // On a short screen the gap row sits under the reply bar: bring it up before moving on.
        then(pause('beat'), () => reveal(document.querySelector('[data-gap]')))
        then(pause('hold'), () => reveal(document.querySelector('[data-build]')))
        then(pause('beat'), () => {})
        press('build', build)
        break
      }
      case 'goal':
        then(pause('step'), () => {})
        press(`goal:${DEFAULT_GOAL}`, () => go({ goal: DEFAULT_GOAL }))
        break
      case 'offerings': {
        // Tick one "not yet" offering to show the warning, then untick it.
        const notYet = audienceOfferingIds.find((id) => statusOf(DATA, id) === 'not-yet')
        if (notYet) {
          then(pause('step'), () => setPicked((p) => [...p, notYet]))
          then(pause('beat'), () => reveal(document.querySelector('[role="alert"]')))
          then(pause('hold'), () => setPicked((p) => p.filter((id) => id !== notYet)))
        }
        // Then narrow the pick to the demo set (data.demoOfferingIds), one chip at a time so the video shows it.
        const { untick, tick } = demoPickChanges(picked, DATA.demoOfferingIds)
        const each = reduced ? 0 : Math.round(260 / view.speed)
        then(pause('beat'), () => {})
        for (const id of untick) then(each, () => setPicked((p) => p.filter((x) => x !== id)))
        for (const id of tick) then(each, () => setPicked((p) => [...p, id]))
        then(pause('step'), () => {})
        press('continue', () => continueOfferings(latest.current.picked))
        break
      }
      case 'length':
        then(pause('step'), () => {})
        press('length:short', () => go({ length: 'short' }))
        break
      case 'review':
        then(pause('hold'), () => {})
        press('generate', generate)
        break
      case 'result':
        // "Why it matters" (footnotes) then "Proof" (the gap), large, 2.5 s each.
        for (const index of autoplaySlideIndexes(slides)) then(pause('hold'), () => setOpenSlide(index))
        then(pause('hold'), () => setOpenSlide(null))
        then(pause('step'), () => commitRef.current && scrollToTop(commitRef.current.closest('li') ?? commitRef.current))
        then(pause('step'), () => {})
        press('commit:case-study', () => go({ commit: 'case-study' }))
        break
      case 'case-study':
        then(pause('hold'), () => {})
        press('submit', () => submitCase(latest.current.caseDraft))
        break
    }
    return () => timers.forEach(clearTimeout)
    // Runs once per step (the component remounts on each step); the handlers read this step's state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, slidesReady, view.autoplay])

  // ---- Controls for the current step ----

  const flashed = (key: string) => flash === key && 'bg-primary-hover scale-[0.98]'
  const pressedChip = (prefix: string) => (flash?.startsWith(prefix) ? flash.slice(prefix.length) : undefined)

  const stepControls = () => {
    switch (step) {
      case 'opening':
        return (
          <div>
            <p className="text-[13px] text-ink-muted">For example:</p>
            <button type="button" onClick={() => sendOpening(DATA.opening)} className={cn(CHIP, 'mt-2 h-auto min-h-8 py-1.5 text-left')}>
              {DATA.opening}
            </button>
          </div>
        )
      case 'confirm':
        return (
          <div>
            <div className="flex flex-wrap gap-2" aria-label="Picked out">
              <PickedChip label="Country" value={COUNTRY} />
              <PickedChip label="Audience" value={audience?.name ?? ''} detail={group?.name} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="button" data-autofocus onClick={confirm} className={cn(PRIMARY_BUTTON, flashed('confirm'))}>
                Looks right
              </button>
              <button type="button" onClick={() => change('country')} className={TEXT_BUTTON}>
                Change
              </button>
            </div>
          </div>
        )
      case 'snapshot':
        return (
          <div>
            <Snapshot state={state} openFact={openFact} onOpenFact={setOpenFact} quiet={view.autoplay} />
            <div className="mt-4">
              <button type="button" data-autofocus data-build="" onClick={build} className={cn(PRIMARY_BUTTON, flashed('build'))}>
                Build the pitch
              </button>
            </div>
          </div>
        )
      case 'goal':
        return (
          <Chips
            label="Goal"
            options={GOALS.map((g) => ({ value: g, label: g }))}
            pressed={pressedChip('goal:') ?? DEFAULT_GOAL}
            onPick={(goal) => go({ goal })}
            onSkip={() => go({ goal: SKIP })}
          />
        )
      case 'offerings':
        return (
          <OfferingsPicker
            audienceName={audience?.name ?? 'audience'}
            audienceIds={audienceOfferingIds}
            picked={picked}
            onChange={setPicked}
            onContinue={() => continueOfferings()}
            continueClass={flashed('continue') || undefined}
          />
        )
      case 'length':
        return (
          <Chips
            label="Length"
            options={LENGTHS.map((l) => ({ value: l.id, label: l.label }))}
            pressed={pressedChip('length:')}
            onPick={(length) => go({ length: length as CountryPitchState['length'] })}
          />
        )
      case 'review':
        return <Review state={state} onChange={change} onGenerate={generate} generateClass={flashed('generate') || undefined} />
      default:
        return null
    }
  }

  const asked: PitchStep[] = ['goal', 'offerings', 'length']
  const answer = (key: PitchStep) => {
    if (key === 'goal') return state.goal === SKIP ? 'Skip' : state.goal
    if (key === 'offerings') return countLabel(state.offerings?.length ?? 0)
    if (key === 'length') return LENGTHS.find((l) => l.id === state.length)?.label
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DemoTopBar title="Country pitch" startOverHref={countryPitchHref({}, view)} showPill={!view.clean} showToggle={!view.clean} />

      <div className={cn('mx-auto flex w-full max-w-[calc(760px+4rem)] flex-1 flex-col px-4 sm:px-8', styles.container)}>
        <ol className={cn('flex flex-1 flex-col gap-6 py-8', at >= 7 && 'pb-16')} aria-label="Conversation with Dot">
          <DotMessage text={QUESTIONS.opening!}>
            {step === 'opening' && (
              <>
                <div ref={current} />
                {stepControls()}
              </>
            )}
          </DotMessage>

          {at >= 1 && <UserMessage format={deck}>{state.q ?? DATA.opening}</UserMessage>}
          {at >= 1 && (
            <DotMessage text={QUESTIONS.confirm!}>
              {step === 'confirm' ? (
                <>
                  <div ref={current} />
                  {stepControls()}
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <PickedChip label="Country" value={COUNTRY} />
                  <PickedChip label="Audience" value={audience?.name ?? ''} detail={group?.name} />
                </div>
              )}
            </DotMessage>
          )}
          {at >= 2 && <UserMessage format={deck}>Looks right</UserMessage>}

          {at >= 2 && (
            <DotMessage text={QUESTIONS.snapshot!}>
              {step === 'snapshot' ? (
                <>
                  <div ref={current} />
                  {stepControls()}
                </>
              ) : (
                <Snapshot state={state} openFact={openFact} onOpenFact={setOpenFact} />
              )}
            </DotMessage>
          )}
          {at >= 3 && <UserMessage format={deck}>Build the pitch</UserMessage>}

          {asked.map((key, i) => {
            if (at < 3 + i) return null
            return (
              <Fragment key={key}>
                <DotMessage text={QUESTIONS[key]!}>
                  {step === key && (
                    <>
                      <div ref={current} />
                      {stepControls()}
                    </>
                  )}
                </DotMessage>
                {at > 3 + i && <UserMessage format={deck}>{answer(key)}</UserMessage>}
              </Fragment>
            )
          })}

          {at >= 6 && (
            <DotMessage text={QUESTIONS.review!}>
              {step === 'review' && (
                <>
                  <div ref={current} />
                  {stepControls()}
                </>
              )}
            </DotMessage>
          )}

          {at >= 7 && (
            <>
              <UserMessage format={deck}>Generate pitch</UserMessage>
              {!slidesReady ? (
                <DotMessage text={`On it. Building your pitch from what DI knows about ${COUNTRY}.`} animated>
                  <ProgressList labels={PROGRESS} finished={finished} />
                </DotMessage>
              ) : (
                <DotMessage text="Here's your pitch. Every figure links to its source.">
                  <div ref={slidesRef} className="scroll-mt-32">
                    <SlidesResult slides={slides} footnotes={footnotes} openSlide={openSlide} onOpenSlide={setOpenSlide} startOverHref={countryPitchHref({}, view)} />
                  </div>
                </DotMessage>
              )}
            </>
          )}

          {at >= 7 && slidesReady && (
            <DotMessage text="Did you learn anything in this engagement worth sharing?">
              <div ref={step === 'result' ? commitRef : undefined}>
                {step === 'result' && <div ref={current} />}
                {step === 'result' && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Share what you learned">
                    <button type="button" aria-pressed={flash === 'commit:case-study' || undefined} onClick={() => go({ commit: 'case-study' })} className={CHIP}>
                      Add a case study
                    </button>
                    <button type="button" onClick={() => go({ commit: 'not-now' })} className={SKIP_CHIP}>
                      Not now
                    </button>
                  </div>
                )}
              </div>
            </DotMessage>
          )}

          {(step === 'case-study' || step === 'submitted') && (
            <>
              <UserMessage format={deck}>Add a case study</UserMessage>
              <DotMessage text="Add what you learned. A reviewer checks it before it joins the knowledge base.">
                {step === 'case-study' ? (
                  <>
                    <div ref={current} />
                    <CaseStudyForm value={caseDraft} onChange={setCaseDraft} onSubmit={() => submitCase()} submitClass={flashed('submit') || undefined} />
                  </>
                ) : (
                  <p className="text-[13px] text-ink-muted">{state.caseTitle}</p>
                )}
              </DotMessage>
            </>
          )}

          {step === 'submitted' && (
            <>
              <UserMessage format={deck}>Submit for review</UserMessage>
              <DotMessage text="Thanks. It's with a reviewer now.">
                <div ref={current} />
                <Submitted title={state.caseTitle ?? ''} clean={view.clean} />
              </DotMessage>
            </>
          )}

          {step === 'not-now' && (
            <>
              <UserMessage format={deck}>Not now</UserMessage>
              <DotMessage text="No problem. Good luck with the meeting.">
                <div ref={current} />
              </DotMessage>
            </>
          )}

          {notes.map((note, i) => (
            <Fragment key={i}>
              <UserMessage>{note.text}</UserMessage>
              <DotMessage text={note.reply} />
            </Fragment>
          ))}
        </ol>

        {/* Dot's newest reply, read out once (the messages themselves are not a live region, so the snapshot isn't read twice). */}
        <p aria-live="polite" className="sr-only">
          {notes.length ? notes[notes.length - 1].reply : liveText(step, slidesReady)}
        </p>

        {at < 7 && (
          <ReplyBar
            format={deck}
            onSend={reply}
            chips={briefChips(state)}
            value={draft}
            onValueChange={setDraft}
            placeholder={step === 'opening' ? "Who are you meeting, and where?" : undefined}
          />
        )}
      </div>

      <SlideDialog
        slides={slides}
        index={openSlide}
        onIndexChange={setOpenSlide}
        notes={footnotes}
        country={DATA.country}
        sources={FACTS}
        quiet={view.autoplay}
      />
    </div>
  )
}

/** Scrolls just enough that an element clears the sticky reply bar (about 170px tall). */
function reveal(el: Element | null) {
  if (!el) return
  const limit = window.innerHeight - 170
  const { bottom } = el.getBoundingClientRect()
  if (bottom > limit) window.scrollBy({ top: bottom - limit, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** What Dot just said, for the live region. */
function liveText(step: PitchStep, slidesReady: boolean): string {
  if (step === 'result') return slidesReady ? "Here's your pitch. Every figure links to its source." : 'Building your pitch.'
  if (step === 'case-study') return 'Add what you learned. A reviewer checks it before it joins the knowledge base.'
  if (step === 'submitted') return "Thanks. It's with a reviewer now. Status: waiting for review."
  if (step === 'not-now') return 'No problem. Good luck with the meeting.'
  return QUESTIONS[step] ?? ''
}

/** Scrolls so an element sits just under the top bar (with room for the message above it). */
function scrollToTop(el: Element) {
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** The Brief chips in the reply bar. */
function briefChips(state: CountryPitchState): { label: string; value: string | null }[] {
  const audience = state.audience ? getAudience(state.audience)?.name : undefined
  return [
    { label: 'Country', value: state.country ? COUNTRY : null },
    { label: 'Audience', value: audience ?? null },
    { label: 'Goal', value: state.goal === SKIP ? 'Skipped' : (state.goal ?? null) },
    { label: 'Offerings', value: state.offerings?.length ? countLabel(state.offerings.length) : null },
    { label: 'Length', value: LENGTHS.find((l) => l.id === state.length)?.label.split(',')[0] ?? null },
  ]
}

/** A picked-out value, shown as a filled chip (the Brief chip look, a little larger). */
function PickedChip({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-subtle px-3 text-[13px] text-ink">
      <Check className="h-3.5 w-3.5 text-link" strokeWidth={2.5} aria-hidden />
      <span className="text-ink-muted">{label}:</span>
      <span className="font-semibold">{value}</span>
      {detail && <span className="text-ink-muted">· {detail}</span>}
    </span>
  )
}

/** The snapshot card for the picked audience, from the demo data and the knowledge data. */
function Snapshot({
  state,
  openFact,
  onOpenFact,
  quiet,
}: {
  state: CountryPitchState
  openFact: string | null
  onOpenFact: (id: string | null) => void
  quiet?: boolean
}) {
  const audience = state.audience ? getAudience(state.audience) : undefined
  const group = audience ? getAudienceGroup(audience.audienceGroupId) : undefined
  const needs = audience ? needsForAudience(audience.id).flatMap((g) => g.needs) : []
  return (
    <div>
      <SnapshotCard
        country={DATA.country}
        audience={{ name: audience?.name ?? '', groupName: group?.name }}
        figures={DATA.connectivity}
        statusFact={DATA.offeringStatusSource}
        offerings={ALL_OFFERINGS.map((o) => ({ ...o, status: statusOf(DATA, o.id) }))}
        caseStudy={CASE_STUDY}
        needs={needs.map((n) => ({ name: n.name, statement: n.statement }))}
        gaps={DATA.gaps}
        openFact={openFact}
        onOpenFact={onOpenFact}
        quiet={quiet}
      />
      <IllustrativeNote />
    </div>
  )
}

/**
 * The offerings step: the audience's offerings (or all 18) as checkable chips
 * with their status in the country, under their categories. "Not yet"
 * offerings start unticked, and ticking one shows a warning under it.
 */
function OfferingsPicker({
  audienceName,
  audienceIds,
  picked,
  onChange,
  onContinue,
  continueClass,
}: {
  audienceName: string
  audienceIds: string[]
  picked: string[]
  onChange: (ids: string[]) => void
  onContinue: () => void
  continueClass?: string
}) {
  const [showAll, setShowAll] = useState(audienceIds.length === 0)
  const shown = new Set(showAll ? ALL_IDS : [...audienceIds, ...picked])
  const toggle = (id: string) => onChange(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id])
  const warned = new Set(notYetPicked(picked, DATA))
  return (
    <div>
      <p className="mb-4 text-[13px] text-ink-secondary">
        I&apos;ve ticked the ones that serve the {audienceName} and are available or in pilot in {COUNTRY}.
      </p>
      <div className="flex flex-col gap-4">
        {offeringsByCategory().map(({ category, offerings }) => {
          const list = offerings.filter((o) => shown.has(o.id))
          if (!list.length) return null
          const warnings = list.filter((o) => warned.has(o.id))
          return (
            <div key={category.id}>
              <p aria-hidden className="mb-2 text-xs text-ink-muted">
                {category.name}
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={category.name}>
                {list.map((o) => {
                  const on = picked.includes(o.id)
                  const status = statusOf(DATA, o.id)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(o.id)}
                      className={cn(CHIP, 'inline-flex h-auto min-h-8 items-center gap-2 py-1 pl-2.5 pr-1.5')}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                          on ? 'border-primary bg-primary text-primary-foreground' : 'border-line-dashed bg-card',
                        )}
                      >
                        {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {o.name}
                      <StatusPill status={status} country={COUNTRY} />
                    </button>
                  )
                })}
              </div>
              {warnings.map((o) => (
                <p key={o.id} role="alert" className="mt-2 flex items-start gap-2 rounded-lg border border-line-dashed bg-subtle px-3 py-2 text-[13px] text-ink">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={2} aria-hidden />
                  <span>
                    <span className="font-semibold">{o.name}.</span> {notYetWarning(COUNTRY)}
                  </span>
                </p>
              ))}
            </div>
          )
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="button" data-autofocus onClick={onContinue} disabled={picked.length === 0} className={cn(PRIMARY_BUTTON, continueClass)}>
          Continue
        </button>
        {!showAll && audienceIds.length < ALL_IDS.length && (
          <button type="button" onClick={() => setShowAll(true)} className={TEXT_BUTTON}>
            Show all {ALL_IDS.length}
          </button>
        )}
        <span aria-live="polite" className="text-[13px] text-ink-muted">
          {picked.length === 0 ? 'Pick at least one offering.' : `${countLabel(picked.length)} picked`}
        </span>
      </div>
    </div>
  )
}

/** The brief: one row per answer, each with Change, then Generate pitch. */
function Review({
  state,
  onChange,
  onGenerate,
  generateClass,
}: {
  state: CountryPitchState
  onChange: (key: PitchKey) => void
  onGenerate: () => void
  generateClass?: string
}) {
  const audience = state.audience ? getAudience(state.audience) : undefined
  const notYet = notYetPicked(state.offerings ?? [], DATA).length
  const rows: ReviewRow<PitchKey>[] = [
    { key: 'country', label: 'Country', value: COUNTRY },
    { key: 'audience', label: 'Audience', value: audience?.name ?? '' },
    { key: 'goal', label: 'Goal', value: state.goal === SKIP ? 'Skipped' : state.goal },
    {
      key: 'offerings',
      label: 'Offerings',
      value: (
        <>
          {countLabel(state.offerings?.length ?? 0)}
          {notYet > 0 && <span className="text-ink-muted"> · {notYet} not yet in {COUNTRY}</span>}
        </>
      ),
    },
    { key: 'length', label: 'Length', value: LENGTHS.find((l) => l.id === state.length)?.label ?? '' },
  ]
  return (
    <div>
      <ReviewRows rows={rows} onChange={onChange} />
      <button type="button" data-autofocus onClick={onGenerate} className={cn(PRIMARY_BUTTON, 'mt-4', generateClass)}>
        Generate pitch
      </button>
    </div>
  )
}

/** The slides for the answers, from the demo data, the knowledge data and fixed rules (lib/dot/country-pitch-demo.ts). */
function slidesFor(state: CountryPitchState): PitchSlide[] {
  const audience = state.audience ? getAudience(state.audience) : undefined
  const ids = state.offerings ?? []
  const toPitch = (o: (typeof ALL_OFFERINGS)[number]): PitchOffering => ({
    id: o.id,
    name: o.name,
    shortName: o.shortName,
    description: o.description,
    status: statusOf(DATA, o.id),
    note: DATA.offerings[o.id]?.note ?? '',
  })
  return buildPitchSlides({
    country: COUNTRY,
    audienceName: audience?.name ?? 'audience',
    pitchTitle: DATA.pitchTitle,
    goal: state.goal ?? SKIP,
    needs: audience ? needsForAudience(audience.id).flatMap((g) => g.needs.map((n) => ({ name: n.name, statement: n.statement }))) : [],
    figures: DATA.connectivity,
    statusFact: DATA.offeringStatusSource,
    categories: offeringsByCategory()
      .map(({ category, offerings }) => ({ name: category.name, offerings: offerings.filter((o) => ids.includes(o.id)).map(toPitch) }))
      .filter((c) => c.offerings.length > 0),
    caseStudy: CASE_STUDY,
    engagement: ENGAGEMENT,
    gaps: DATA.gaps,
    length: state.length ?? 'standard',
  })
}

/** The slide grid, the Sources strip, the trust chips and the buttons. */
function SlidesResult({
  slides,
  footnotes,
  openSlide,
  onOpenSlide,
  startOverHref,
}: {
  slides: PitchSlide[]
  footnotes: Map<string, number>
  openSlide: number | null
  onOpenSlide: (index: number) => void
  startOverHref: string
}) {
  return (
    <div>
      <ol aria-label="Pitch slides" className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onOpenSlide(i)}
              aria-label={`Slide ${i + 1}: ${slideName(slide)}. Open it large`}
              aria-haspopup="dialog"
              className={cn(
                'focus-ring block w-full overflow-hidden rounded-xl border border-line-card text-left shadow-[0_1px_2px_rgba(26,42,60,0.06)] transition-shadow hover:shadow-tile',
                openSlide === i && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
              )}
            >
              <span aria-hidden className="pointer-events-none block">
                <PitchSlideView slide={slide} number={i + 1} notes={footnotes} country={DATA.country} />
              </span>
            </button>
            <p aria-hidden className="mt-1.5 truncate text-xs text-ink-muted">
              {i + 1}. {slideName(slide)}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl border border-line-card bg-card px-4 py-3">
        <h3 className="text-xs text-ink-muted">Sources</h3>
        <ol className="mt-1.5 flex flex-col gap-1">
          {[...footnotes.entries()].map(([id, n]) => {
            const fact = FACTS.get(id)
            if (!fact) return null
            return (
              <li key={id} className="flex gap-2 text-xs text-ink-secondary">
                <span className="w-4 shrink-0 font-semibold text-link">{n}</span>
                <span className="min-w-0">
                  <span className="text-ink">{fact.source.title}</span> · {fact.label} · Committed by {fact.source.committedBy} · Validated by{' '}
                  {fact.source.validatedBy}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
      <IllustrativeNote />

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Checks">
        <TrustChip>Every figure is cited</TrustChip>
        <TrustChip>Tone and key terms from Comms applied</TrustChip>
        <TrustChip gap>{gapLabel(DATA.gaps.length)}</TrustChip>
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <OpenBuilderButton href={EXTERNAL_TOOLS.deck} type="deck" />
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* The button is disabled, so the tooltip sits on a focusable wrapper. */}
              <span tabIndex={0} className="focus-ring inline-flex rounded-full" aria-label="Download (demo), not available: demo only">
                <button
                  type="button"
                  disabled
                  tabIndex={-1}
                  aria-hidden
                  className="pointer-events-none inline-flex h-10 items-center gap-2 rounded-full border border-line-card bg-card px-5 text-sm font-semibold text-ink-muted opacity-70"
                >
                  <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Download (demo)
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent className="border-line-card text-xs">Demo only</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Link href={startOverHref} className={TEXT_BUTTON}>
          Start over
        </Link>
      </div>
    </div>
  )
}

function TrustChip({ children, gap = false }: { children: React.ReactNode; gap?: boolean }) {
  return (
    <li
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs',
        gap ? 'border border-dashed border-line-dashed text-ink-secondary' : 'bg-chosen text-link',
      )}
    >
      {gap ? <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
      {children}
    </li>
  )
}

const FIELD =
  'w-full rounded-lg border border-line-card bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30'

/** A small case study form, prefilled with demo text. Nothing is saved. */
function CaseStudyForm({
  value,
  onChange,
  onSubmit,
  submitClass,
}: {
  value: { title: string; body: string }
  onChange: (value: { title: string; body: string }) => void
  onSubmit: () => void
  submitClass?: string
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="rounded-2xl border border-line-card bg-card p-4"
    >
      <label htmlFor="case-title" className="block text-xs text-ink-muted">
        Title
      </label>
      <input id="case-title" value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} className={cn(FIELD, 'mt-1 h-10')} />
      <label htmlFor="case-body" className="mt-3 block text-xs text-ink-muted">
        What happened
      </label>
      <textarea
        id="case-body"
        rows={3}
        value={value.body}
        onChange={(e) => onChange({ ...value, body: e.target.value })}
        className={cn(FIELD, 'mt-1 resize-y leading-relaxed')}
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" data-autofocus disabled={!value.title.trim()} className={cn(PRIMARY_BUTTON, submitClass)}>
          Submit for review
        </button>
        <span className="text-xs text-ink-muted">A Country Engagement reviewer checks it first.</span>
      </div>
    </form>
  )
}

/** The confirmation: waiting for review. Nothing was saved. */
function Submitted({ title, clean }: { title: string; clean: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-card bg-card">
      <div className="border-b border-line-divider px-4 py-3">
        <p className="text-xs text-ink-muted">Case study</p>
        <p className="mt-0.5 font-heading text-[15px] font-semibold text-ink">{title}</p>
      </div>
      <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 px-4 py-3 text-sm">
        <dt className="text-xs leading-5 text-ink-muted">Status</dt>
        <dd>
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-subtle px-2.5 text-xs font-semibold text-ink-secondary">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
            Waiting for review
          </span>
        </dd>
        <dt className="text-xs leading-5 text-ink-muted">Reviewer</dt>
        <dd className="text-ink">Country Engagement reviewer</dd>
        <dt className="text-xs leading-5 text-ink-muted">Country</dt>
        <dd className="text-ink">{COUNTRY}</dd>
      </dl>
      <p className="border-t border-line-divider px-4 py-3 text-[13px] text-ink-secondary">
        Your pitch deck is not added to the knowledge base. Only reviewed sources are.
      </p>
      {!clean && <p className="px-4 pb-3 text-xs text-ink-muted">This is a demo. Nothing was saved.</p>}
    </div>
  )
}
