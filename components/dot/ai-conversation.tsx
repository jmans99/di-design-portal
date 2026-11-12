'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { CHIP, DotMessage, ReplyBar, UserMessage } from '@/components/dot/conversation'
import { markAiOff, useDot } from '@/components/dot/use-dot'
import type { DotAiResult, DotChatMessage, DotLink } from '@/lib/dot/ai'
import { searchHref, type AskState } from '@/lib/dot/conversation'
import { matchIntent, matchTemplate } from '@/lib/dot/intent'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

type Turn = DotChatMessage & { links?: DotLink[] }

const FAILED = "Sorry, I couldn't answer that just now. Please try again."

/** Asks /api/dot. null = the AI is not available (no key, network or model error). */
async function askDot(messages: DotChatMessage[], signal: AbortSignal): Promise<DotAiResult | null> {
  try {
    const res = await fetch('/api/dot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    })
    // 503 = this deployment has no key: stop asking for the rest of the visit.
    if (res.status === 503) markAiOff()
    return res.ok ? ((await res.json()) as DotAiResult) : null
  } catch {
    return null
  }
}

/**
 * Dot's AI chat (docs/design/dot-ai.md), at /?ask=…. The model reads what was
 * typed and either starts a format, opens the search reply, or answers in
 * words; the chat then goes on in the reply bar. If the AI is not available
 * for the first message, the keyword matcher takes over (as before the AI).
 */
export function AiConversation({ state }: { state: AskState }) {
  const { start, sendByKeywords, push, replace } = useDot()
  const [turns, setTurns] = useState<Turn[]>([{ role: 'user', content: state.q }])
  const [pending, setPending] = useState(true)
  // "Use DI knowledge" in the reply bar: starts from the box's value; it only goes into the brief of what starts next.
  const [useKnowledge, setUseKnowledge] = useState(state.useKnowledge)
  const request = useRef<AbortController | null>(null)

  const ask = async (chat: Turn[]) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    const text = chat[chat.length - 1].content
    // The first message redirects in place, so Back does not come back here and ask again.
    const first = chat.length === 1
    const result = await askDot(
      chat.map(({ role, content }) => ({ role, content })),
      controller.signal,
    )
    if (controller.signal.aborted) return

    if (!result) {
      if (first) return sendByKeywords(text, useKnowledge, { replace: true })
      setTurns([...chat, { role: 'assistant', content: FAILED }])
    } else if (result.action === 'create') {
      const templateId = result.format === 'deck' && matchTemplate(text) === 'master-deck' ? ('master-deck' as const) : undefined
      return start({ format: result.format, templateId, q: text, useKnowledge }, { replace: first })
    } else if (result.action === 'search') {
      // Keep the person's own words when the asset search understands them; else use the model's search words.
      const query = matchIntent(text).kind === 'search' ? text : result.query
      return (first ? replace : push)(searchHref({ query, without: [] }))
    } else {
      setTurns([...chat, { role: 'assistant', content: result.reply, links: result.links }])
    }
    setPending(false)
  }

  // Ask once for the message in the URL (the component is keyed on it).
  useEffect(() => {
    void ask([{ role: 'user', content: state.q }])
    return () => request.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bring the newest message into view.
  useEffect(() => {
    if (turns.length > 1) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, [turns.length, pending])

  const reply = (text: string) => {
    const chat: Turn[] = [...turns, { role: 'user', content: text.trim() }]
    setTurns(chat)
    void ask(chat)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line-divider bg-background/90 px-4 backdrop-blur md:px-6">
        <SidePanelToggle />
        <span aria-hidden className="h-4 w-px bg-line-divider" />
        <h1 className="truncate text-sm font-semibold text-ink">New chat</h1>
        <Link href="/" className="focus-ring ml-auto rounded text-sm font-semibold text-link hover:text-link-hover">
          Start over
        </Link>
      </header>

      <div className={cn('mx-auto flex w-full max-w-[calc(760px+4rem)] flex-1 flex-col px-4 sm:px-8', styles.container)}>
        <ol className="flex flex-1 flex-col gap-6 py-8" aria-label="Conversation with Dot" aria-live="polite">
          {turns.map((turn, i) =>
            turn.role === 'user' ? (
              <UserMessage key={i}>{turn.content}</UserMessage>
            ) : (
              <DotMessage key={i} text={turn.content}>
                {turn.links && turn.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {turn.links.map((link) => (
                      <Link key={link.href} href={link.href} className={cn(CHIP, 'inline-flex items-center')}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </DotMessage>
            ),
          )}
          {pending && <DotMessage text="Thinking…" animated />}
        </ol>
        <ReplyBar showBrief={false} onSend={reply} disabled={pending} useKnowledge={useKnowledge} onUseKnowledgeChange={setUseKnowledge} />
      </div>
    </div>
  )
}
