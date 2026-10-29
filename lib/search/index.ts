/**
 * Search index for the ⌘K palette: every side panel page and every format,
 * matched by title. The next step adds assets to the same index.
 */

import type { LucideIcon } from 'lucide-react'
import { FORMATS, formatStartPath } from '@/lib/dot/formats'
import { AI_SKILLS_ITEM, SIDEBAR_GROUPS } from '@/lib/nav'

export type SearchItem = {
  id: string
  title: string
  /** Section heading in the results: "Formats", "Knowledge"… */
  section: string
  href: string
  icon: LucideIcon
  /** Icon colour for formats. */
  color?: string
  /** Opens an external tool in a new tab (the deck builder). */
  external?: boolean
}

export const SEARCH_INDEX: SearchItem[] = [
  ...FORMATS.map((f) => ({ id: `format-${f.type}`, title: f.action, section: 'Formats', href: formatStartPath(f), icon: f.icon, color: f.color, external: !!f.external })),
  ...SIDEBAR_GROUPS.filter((g) => g.id !== 'create').flatMap((g) =>
    g.items.filter((i) => !i.soon).map((i) => ({ id: `page-${i.id}`, title: i.label, section: g.label, href: i.path, icon: i.icon })),
  ),
  { id: `page-${AI_SKILLS_ITEM.id}`, title: AI_SKILLS_ITEM.label, section: 'AI skills', href: AI_SKILLS_ITEM.path, icon: AI_SKILLS_ITEM.icon },
]

/**
 * Items whose title has every word of the query (case-insensitive), titles
 * that start with the query first. An empty query returns the whole index.
 */
export function searchItems(query: string, items: SearchItem[] = SEARCH_INDEX): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return items
  const q = words.join(' ')
  return items
    .filter((item) => {
      const title = item.title.toLowerCase()
      return words.every((w) => title.includes(w))
    })
    .sort((a, b) => Number(b.title.toLowerCase().startsWith(q)) - Number(a.title.toLowerCase().startsWith(q)))
}
