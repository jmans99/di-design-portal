/**
 * Search index for the ⌘K palette: every side panel page and every format,
 * matched by title. The next step adds assets to the same index.
 */

import type { LucideIcon } from 'lucide-react'
import type { OutputType } from '@/lib/brief'
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
  /** The format a Formats row starts. */
  outputType?: OutputType
  /** Other names that find the item, e.g. its old name ("Brand guidelines" for DI guidelines). */
  keywords?: string[]
  /** Its group's names ("Brand assets", and the old "Assets"), searched last. */
  groupKeywords?: string[]
}

export const SEARCH_INDEX: SearchItem[] = [
  ...FORMATS.map((f) => ({ id: `format-${f.type}`, title: f.action, section: 'Formats', href: formatStartPath(f), icon: f.icon, color: f.color, external: !!f.external, outputType: f.type })),
  ...SIDEBAR_GROUPS.filter((g) => g.id !== 'create').flatMap((g) =>
    g.items
      .filter((i) => !i.soon)
      .map((i) => ({
        id: `page-${i.id}`,
        title: i.label,
        section: g.label,
        href: i.path,
        icon: i.icon,
        keywords: i.aliases,
        groupKeywords: [g.label, ...(g.aliases ?? [])],
      })),
  ),
  { id: `page-${AI_SKILLS_ITEM.id}`, title: AI_SKILLS_ITEM.label, section: 'AI skills', href: AI_SKILLS_ITEM.path, icon: AI_SKILLS_ITEM.icon },
]

/**
 * Items that have every word of the query, case-insensitive: titles that start
 * with the query first, then other title matches, then matches on the item's
 * other names, then on its group's names. An empty query returns the whole index.
 */
export function searchItems(query: string, items: SearchItem[] = SEARCH_INDEX): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return items
  const q = words.join(' ')
  const rank = (item: SearchItem) => {
    const title = item.title.toLowerCase()
    if (title.startsWith(q)) return 0
    if (words.every((w) => title.includes(w))) return 1
    const has = (names: string[]) => {
      const text = [title, ...names].join(' ').toLowerCase()
      return words.every((w) => text.includes(w))
    }
    if (has(item.keywords ?? [])) return 2
    return has([...(item.keywords ?? []), ...(item.groupKeywords ?? [])]) ? 3 : -1
  }
  return items
    .map((item) => ({ item, rank: rank(item) }))
    .filter((r) => r.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((r) => r.item)
}
