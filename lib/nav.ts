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
  Network,
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

export type NavItem = {
  id: string
  path: string
  label: string
  /** Side panel icon. */
  icon: LucideIcon
  /** Planned page: listed in the side panel as disabled with "Soon". */
  soon?: boolean
}
export type NavGroup = { id: string; label: string; items: NavItem[] }

/**
 * Side panel: every group and item, in display order. Items marked `soon` are
 * planned pages, shown as disabled with a "Soon" label.
 */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    id: 'home',
    label: 'Home',
    items: [{ id: 'home', path: '/', label: 'Home', icon: House }],
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
      { id: 'systems', path: '/knowledge/systems', label: 'Systems', icon: Network },
      { id: 'offerings', path: '/knowledge/offerings', label: 'Offerings', icon: Building2 },
      { id: 'kpis', path: '/knowledge/kpis', label: 'KPIs', icon: ChartColumn, soon: true },
      { id: 'case-studies', path: '/knowledge/case-studies', label: 'Case studies', icon: Waypoints, soon: true },
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
    id: 'brand',
    label: 'Brand',
    items: [
      { id: 'colors', path: '/colors', label: 'Colors', icon: Palette },
      { id: 'typography', path: '/typography', label: 'Typography', icon: Type },
      { id: 'brand-guidelines', path: '/guidelines/brand', label: 'Brand guidelines', icon: BookOpen },
      { id: 'video-guidelines', path: '/guidelines/video', label: 'Video guidelines', icon: Video },
    ],
  },
  {
    id: 'ai-skills',
    label: 'AI skills',
    items: [{ id: 'skills', path: '/materials/skills', label: 'AI skills', icon: Sparkles }],
  },
]
