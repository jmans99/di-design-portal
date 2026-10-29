import type { LucideIcon } from 'lucide-react'
import { FileText, Globe, Mail, MapIcon, Monitor, Presentation, Share2 } from 'lucide-react'
import { OUTPUT_OPTIONS, type OutputType } from '@/lib/brief'
import { externalToolFor } from '@/lib/external-tools'

/** A format Dot can start: what it is called, its colour and icon, and where it goes. */
export type Format = {
  type: OutputType
  /** "Deck", "Social post"… */
  label: string
  /** User message and tile title: "Create a deck". */
  action: string
  /** Conversation top bar: "New deck". */
  title: string
  /** Tile icon colour (docs/design/dot-home.md). */
  color: string
  icon: LucideIcon
  /** Tool page; null while the tool is not built yet (Dot keeps the brief in Recent). */
  href: string | null
  /** External builder (lib/external-tools.ts) that makes this format, opened in a new tab; null when made in the portal. */
  external: string | null
  /** Name of the tool in Dot's "coming soon" reply. */
  toolName: string
}

const DETAILS: Record<OutputType, Omit<Format, 'type' | 'label' | 'href' | 'external'>> = {
  deck: { action: 'Create a deck', title: 'New deck', color: '#01689D', icon: Presentation, toolName: 'deck builder' },
  'social-post': { action: 'Make a social post', title: 'New social post', color: '#EC6A8C', icon: Share2, toolName: 'social media tool' },
  'two-pager': { action: 'Write a two-pager', title: 'New two-pager', color: '#7E8CFF', icon: FileText, toolName: 'two-pager tool' },
  map: { action: 'Make a map', title: 'New map', color: '#00AEEF', icon: MapIcon, toolName: 'map tool' },
  'engagement-map': { action: 'Make an engagement map', title: 'New engagement map', color: '#22B99A', icon: Globe, toolName: 'engagement map tool' },
  background: { action: 'Make a virtual background', title: 'New virtual background', color: '#5C6B7A', icon: Monitor, toolName: 'backgrounds tool' },
  'email-signature': { action: 'Make an email signature', title: 'New email signature', color: '#1A2A3C', icon: Mail, toolName: 'email signature tool' },
}

export const FORMATS: Format[] = OUTPUT_OPTIONS.map((option) => ({ ...option, ...DETAILS[option.type], external: externalToolFor(option.type) }))

export const getFormat = (type: OutputType) => FORMATS.find((f) => f.type === type)!

/** Where a format starts from the side panel or search: the external builder, its tool, or the conversation on the home page. */
export const formatStartPath = (format: Format) => format.external ?? format.href ?? `/?new=${format.type}`
