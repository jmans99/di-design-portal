'use client'

import { useRouter } from 'next/navigation'
import { briefHref, type OutputType } from '@/lib/brief'
import { SKIP_AUDIENCE, conversationHref, type ConversationState } from '@/lib/dot/conversation'
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

  const start = (state: ConversationState & { format: OutputType }) => {
    const format = getFormat(state.format)
    if (!format.href) {
      router.push(conversationHref(state))
      return
    }
    const audienceGroupId = state.audience && state.audience !== SKIP_AUDIENCE ? state.audience : undefined
    const href = briefHref({ outputType: format.type, audienceGroupId, useKnowledge: state.useKnowledge })!
    addRecent({ label: recentLabel(state), href, color: format.color })
    router.push(href)
  }

  /** Typed text from Dot's box: a matched format starts; anything else opens "couldn't match". */
  const send = (text: string, useKnowledge: boolean) => {
    const q = text.trim()
    if (!q) return
    const intent = matchIntent(q)
    if (intent.kind === 'format') start({ format: intent.outputType, templateId: intent.templateId, q, useKnowledge })
    else router.push(conversationHref({ q, useKnowledge }))
  }

  return { start, send, push: router.push, replace: router.replace }
}
