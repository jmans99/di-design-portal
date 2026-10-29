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
}

export type NavGroup = {
  id: string
  label: string
  icon: LucideIcon
  /** Open when the page loads. */
  defaultOpen: boolean
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

/** Side panel groups, in display order (docs/design/dot-home.md, section 1). */
export const SIDEBAR_GROUPS: NavGroup[] = [
  { id: 'create', label: 'Create', icon: PenLine, defaultOpen: true, items: CREATE_ITEMS },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: Library,
    defaultOpen: false,
    items: [
      { id: 'audiences', path: '/knowledge/audiences', label: 'Audiences', icon: Users },
      { id: 'facilities', path: '/knowledge/facilities', label: 'Facilities', icon: School },
      { id: 'systems', path: '/knowledge/systems', label: 'Systems', icon: Network },
      { id: 'offerings', path: '/knowledge/offerings', label: 'Offerings', icon: Building2 },
      { id: 'kpis', path: '/knowledge/kpis', label: 'KPIs', icon: ChartColumn, soon: true },
      { id: 'case-studies', path: '/knowledge/case-studies', label: 'Case studies', icon: Waypoints, soon: true },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: FolderOpen,
    defaultOpen: true,
    items: [
      { id: 'logos', path: '/logos', label: 'Logos', icon: Shapes },
      { id: 'illustrations', path: '/illustrations', label: 'Illustrations', icon: ImageIcon },
      { id: 'image-galleries', path: '/media', label: 'Image galleries', icon: Images },
      { id: 'photo-awards', path: '/media/photo-awards', label: 'Photo awards', icon: Trophy },
    ],
  },
  {
    id: 'brand',
    label: 'Brand',
    icon: Palette,
    defaultOpen: false,
    items: [
      { id: 'colors', path: '/colors', label: 'Colors', icon: Palette },
      { id: 'typography', path: '/typography', label: 'Typography', icon: Type },
      { id: 'brand-guidelines', path: '/guidelines/brand', label: 'Brand guidelines', icon: BookOpen },
      { id: 'video-guidelines', path: '/guidelines/video', label: 'Video guidelines', icon: Video },
    ],
  },
]

/** AI skills: a single row after the groups, no children. */
export const AI_SKILLS_ITEM: NavItem = { id: 'skills', path: '/materials/skills', label: 'AI skills', icon: Sparkles }

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
