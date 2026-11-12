'use client'

import { useRouter } from 'next/navigation'
import { briefHref, type OutputType } from '@/lib/brief'
import { SKIP_AUDIENCE, askHref, conversationHref, searchHref, type ConversationState } from '@/lib/dot/conversation'
import { getFormat } from '@/lib/dot/formats'
import { matchIntent } from '@/lib/dot/intent'
import { addRecent } from '@/lib/dot/recent'
import { getDeckTemplate } from '@/lib/dot/templates'
import { getAudienceGroup } from '@/lib/knowledge'

/** "Deck · Master deck · Governments": format, then template and audience when chosen. */
export function recentLabel(state: ConversationState & { format: OutputType }) {
  const group = state.audience && state.audience !== SKIP_AUDIENCE ? getAudienceGroup(state.audience) : undefined
  return [getFormat(state.format).label, getDeckTemplate(state.templateId)?.name, group?.name].filter(Boolean).join(' · ')
}

/** Starting things from Dot: formats with a tool open it (and go in Recent); the others start a conversation. */
export function useDot() {
  const router = useRouter()

  /** `replace`: take the place of the current page in history (used when the AI chat redirects, so Back does not loop). */
  const start = (state: ConversationState & { format: OutputType }, { replace = false } = {}) => {
    const go = replace ? router.replace : router.push
    const format = getFormat(state.format)
    if (!format.href) {
      go(conversationHref(state))
      return
    }
    const audienceGroupId = state.audience && state.audience !== SKIP_AUDIENCE ? state.audience : undefined
    const href = briefHref({ outputType: format.type, audienceGroupId, useKnowledge: state.useKnowledge })!
    addRecent({ label: recentLabel(state), href, color: format.color })
    go(href)
  }

  /**
   * Typed text from Dot's box and the reply bars: it goes to Dot's AI
   * (/?ask=…, components/dot/ai-conversation.tsx), which starts a format,
   * opens the search reply or answers in words.
   */
  const send = (text: string) => {
    const q = text.trim()
    if (q) router.push(askHref(q))
  }

  /**
   * The keyword matcher, used when the AI is not available: a format starts
   * the create flow, an asset request opens the search reply (not added to
   * Recent), anything else opens "couldn't match".
   */
  const sendByKeywords = (text: string, useKnowledge: boolean, { replace = false } = {}) => {
    const q = text.trim()
    if (!q) return
    const go = replace ? router.replace : router.push
    const intent = matchIntent(q)
    if (intent.kind === 'format') start({ format: intent.outputType, templateId: intent.templateId, q, useKnowledge }, { replace })
    else if (intent.kind === 'search') go(searchHref({ query: q, without: [] }))
    else go(conversationHref({ q, useKnowledge }))
  }

  return { start, send, sendByKeywords, push: router.push, replace: router.replace }
}
