import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  ChartColumn,
  FileText,
  Globe,
  House,
  ImageIcon,
  Images,
  Mail,
  MapIcon,
  Monitor,
  Palette,
  Presentation,
  School,
  Share2,
  Shapes,
  Sparkles,
  Trophy,
  Type,
  Users,
  Video,
  Waypoints,
} from 'lucide-react'
import { isRouteEnabled } from '@/lib/site'

export type NavItem = {
  id: string
  path: string
  label: string
  /** Side panel icon (the top header shows labels only). */
  icon: LucideIcon
  /** Planned page: listed in the side panel as disabled with "Soon", never in the header or footer. */
  soon?: boolean
}
export type NavGroup = { id: string; label: string; items: NavItem[] }

/**
 * Hardcoded: Slides e' WIP, resta nascosto da nav, footer e 404 sulla route.
 * Per riabilitarlo cambia questa costante a `false` (l'env var precedente
 * NEXT_PUBLIC_HIDE_SLIDES era impostata a 'false' su Vercel e teneva visibile
 * la sezione anche dopo i tentativi di nasconderla via flag).
 */
export const SLIDES_HIDDEN = true

/**
 * Every menu group and item, for both sites and both shells. Items whose page
 * is not enabled for the current site (lib/site.ts) are dropped; see
 * NAV_GROUPS and SIDEBAR_GROUPS for the order each shell uses.
 */
const ALL_NAV_GROUPS: NavGroup[] = [
  {
    id: 'home',
    label: 'Home',
    items: [{ id: 'home', path: '/', label: 'Home', icon: House }],
  },
  {
    id: 'brand',
    label: 'Brand',
    items: [
      { id: 'colors', path: '/colors', label: 'Colors', icon: Palette },
      { id: 'typography', path: '/typography', label: 'Typography', icon: Type },
      { id: 'video-guidelines', path: '/guidelines/video', label: 'Video', icon: Video },
      { id: 'brand-guidelines', path: '/guidelines/brand', label: 'Brand guidelines', icon: BookOpen },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    items: [
      { id: 'logos', path: '/logos', label: 'Logos', icon: Shapes },
      { id: 'illustrations', path: '/illustrations', label: 'Illustrations', icon: ImageIcon },
      { id: 'image-galleries', path: '/media', label: 'Image galleries', icon: Images },
      { id: 'photo-awards', path: '/media/photo-awards', label: 'Photo awards', icon: Trophy },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    items: [
      { id: 'maps', path: '/materials/maps', label: 'Maps', icon: MapIcon },
      { id: 'social-media', path: '/materials/social-media', label: 'Social media', icon: Share2 },
      { id: 'engagement-map', path: '/materials/engagement-map', label: 'Engagement map', icon: Globe },
      { id: 'email-signature', path: '/materials/email-signature', label: 'Email signature', icon: Mail },
      { id: 'backgrounds', path: '/materials/backgrounds', label: 'Backgrounds', icon: Monitor },
      { id: 'slides', path: '/slides', label: 'Slides', icon: Presentation, soon: true },
      { id: 'two-pagers', path: '/two-pagers', label: 'Two-pagers', icon: FileText, soon: true },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    items: [
      { id: 'audiences', path: '/knowledge/audiences', label: 'Audiences', icon: Users },
      { id: 'facilities', path: '/knowledge/facilities', label: 'Facilities', icon: School },
      { id: 'offerings', path: '/knowledge/offerings', label: 'Offerings', icon: Building2 },
      { id: 'kpis', path: '/knowledge/kpis', label: 'KPIs', icon: ChartColumn, soon: true },
      { id: 'case-studies', path: '/knowledge/case-studies', label: 'Case studies', icon: Waypoints, soon: true },
    ],
  },
  {
    id: 'ai-skills',
    label: 'AI skills',
    items: [{ id: 'skills', path: '/materials/skills', label: 'AI skills', icon: Sparkles }],
  },
]

function buildGroups(order: string[], isVisible: (item: NavItem) => boolean): NavGroup[] {
  return order
    .map((id) => ALL_NAV_GROUPS.find((group) => group.id === id)!)
    .map((group) => ({ ...group, items: group.items.filter(isVisible) }))
    .filter((group) => group.items.length > 0)
}

/**
 * Top header, mobile menu and footer (marketing shell). Slides has no page
 * yet, so it is gated by SLIDES_HIDDEN; other planned items never show here.
 */
export const NAV_GROUPS: NavGroup[] = buildGroups(['brand', 'assets', 'create', 'ai-skills'], (item) => {
  if (item.id === 'slides') return !SLIDES_HIDDEN
  return !item.soon && isRouteEnabled(item.path)
})

/** Side panel (app shell): enabled pages, plus planned ones shown as "Soon". */
export const SIDEBAR_GROUPS: NavGroup[] = buildGroups(
  ['home', 'create', 'knowledge', 'assets', 'brand', 'ai-skills'],
  (item) => item.soon || isRouteEnabled(item.path),
)

/** Footer quick links: every menu item, in menu order. */
export const FOOTER_SECTION_LINKS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)
