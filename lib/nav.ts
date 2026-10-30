import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  ChartColumn,
  FolderOpen,
  ImageIcon,
  Images,
  Library,
  Network,
  Palette,
  PenLine,
  School,
  Shapes,
  Sparkles,
  Trophy,
  Type,
  Users,
  Video,
  Waypoints,
} from 'lucide-react'
import { FORMATS, formatStartPath } from '@/lib/dot/formats'

export type NavItem = {
  id: string
  path: string
  label: string
  icon: LucideIcon
  /** Planned page with no route yet: listed as disabled with "Soon". */
  soon?: boolean
  /** Small tag next to a working link, e.g. "Soon" for a format whose tool is not built (Dot keeps the brief). */
  tag?: string
  /** Opens an external tool in a new tab (lib/external-tools.ts). */
  external?: boolean
  /** Search words besides the label, e.g. an old name ("Brand guidelines"). */
  aliases?: string[]
}

export type NavGroup = {
  id: string
  label: string
  icon: LucideIcon
  /** Search words besides the label, e.g. an old name ("Assets"). */
  aliases?: string[]
  items: NavItem[]
}

/** Create: every format Dot can start, in the side panel order. */
const CREATE_ITEMS: NavItem[] = FORMATS.map((format) => ({
  id: format.type,
  path: formatStartPath(format),
  label: format.label,
  icon: format.icon,
  tag: format.href || format.external ? undefined : 'Soon',
  external: !!format.external,
}))

/**
 * Side panel groups, in display order (docs/design/dot-home.md, section 1).
 * Every group starts closed; the one holding the current page opens itself.
 */
export const SIDEBAR_GROUPS: NavGroup[] = [
  { id: 'create', label: 'Create', icon: PenLine, items: CREATE_ITEMS },
  {
    id: 'assets',
    label: 'Brand assets',
    aliases: ['assets'],
    icon: FolderOpen,
    items: [
      { id: 'logos', path: '/logos', label: 'Logos', icon: Shapes },
      { id: 'illustrations', path: '/illustrations', label: 'Illustrations', icon: ImageIcon },
      { id: 'image-galleries', path: '/media', label: 'Image galleries', icon: Images },
      { id: 'photo-awards', path: '/media/photo-awards', label: 'Photo awards', icon: Trophy },
    ],
  },
  {
    id: 'brand',
    label: 'Brand guidelines',
    aliases: ['brand'],
    icon: Palette,
    items: [
      { id: 'colors', path: '/colors', label: 'Colors', icon: Palette },
      { id: 'typography', path: '/typography', label: 'Typography', icon: Type },
      { id: 'brand-guidelines', path: '/guidelines/brand', label: 'DI guidelines', icon: BookOpen, aliases: ['brand guidelines'] },
      { id: 'video-guidelines', path: '/guidelines/video', label: 'Video guidelines', icon: Video },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: Library,
    items: [
      { id: 'audiences', path: '/knowledge/audiences', label: 'Audiences', icon: Users },
      { id: 'facilities', path: '/knowledge/facilities', label: 'Facilities', icon: School },
      { id: 'systems', path: '/knowledge/systems', label: 'Systems', icon: Network },
      { id: 'offerings', path: '/knowledge/offerings', label: 'Offerings', icon: Building2 },
      { id: 'kpis', path: '/knowledge/kpis', label: 'KPIs', icon: ChartColumn, soon: true },
      { id: 'case-studies', path: '/knowledge/case-studies', label: 'Case studies', icon: Waypoints, soon: true },
    ],
  },
]

/** AI skills: a single row, no children. */
export const AI_SKILLS_ITEM: NavItem = { id: 'skills', path: '/materials/skills', label: 'AI skills', icon: Sparkles }

export type SidebarEntry = { group: NavGroup } | { link: NavItem }

/**
 * The side panel menu under New chat, top to bottom: Create, Brand assets,
 * Brand guidelines, AI skills, then Knowledge (Recent follows, if any).
 */
export const SIDEBAR_MENU: SidebarEntry[] = [
  ...SIDEBAR_GROUPS.filter((g) => g.id !== 'knowledge').map((group) => ({ group })),
  { link: AI_SKILLS_ITEM },
  ...SIDEBAR_GROUPS.filter((g) => g.id === 'knowledge').map((group) => ({ group })),
]

/** Every link in the side panel (planned "Soon" pages left out). */
export const SIDEBAR_LINKS: NavItem[] = [...SIDEBAR_GROUPS.flatMap((g) => g.items), AI_SKILLS_ITEM].filter((i) => !i.soon)

/**
 * The side panel item for a URL: on the home page, the format in `?new=`;
 * elsewhere the item with the longest matching path, so /media/photo-awards
 * picks Photo awards, not Image galleries. Undefined = nothing (New chat on /).
 */
export function activeNavItem(pathname: string, newParam: string | null): NavItem | undefined {
  if (pathname === '/') return newParam ? SIDEBAR_LINKS.find((i) => i.path === `/?new=${newParam}`) : undefined
  return SIDEBAR_LINKS.filter((i) => !i.path.includes('?') && (pathname === i.path || pathname.startsWith(i.path + '/'))).sort(
    (a, b) => b.path.length - a.path.length,
  )[0]
}
