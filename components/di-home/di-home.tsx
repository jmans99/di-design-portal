'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, Network, School, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OUTPUT_OPTIONS, briefHref, type Brief, type OutputType } from '@/lib/brief'
import { AUDIENCE_GROUPS } from '@/lib/knowledge'
import { cn } from '@/lib/utils'

const ICON_STROKE = 1.5
const ANYONE = 'anyone'

type Template = { title: string; description: string; image: string; href: string | null }

const TEMPLATES: Template[] = [
  {
    title: 'Abstract map',
    description: 'A dot map of schools and health centres for any country, ready for slides.',
    image: '/templates/abstract-map.jpg',
    href: '/materials/maps/abstract',
  },
  {
    title: 'Country announcement',
    description: 'Announce a country joining, sized for social media.',
    image: '/templates/country-announcement.jpg',
    href: '/materials/social-media',
  },
  {
    title: 'Virtual background',
    description: '4K backgrounds for Teams, Zoom and Google Meet.',
    image: '/templates/virtual-background.jpg',
    href: '/materials/backgrounds',
  },
  {
    title: 'Email signature',
    description: 'Build your signature, then paste it into Outlook.',
    image: '/templates/email-signature.jpg',
    href: '/materials/email-signature',
  },
  {
    title: 'Engagement map',
    description: 'A world map of engaged countries, 1920 × 1080.',
    image: '/templates/engagement-map.jpg',
    href: '/materials/engagement-map',
  },
  {
    title: 'Master deck',
    description: 'The Digital Inclusion master deck, in the deck builder.',
    image: '/templates/master-deck.jpg',
    href: null,
  },
]

const KNOWLEDGE_LINKS = [
  {
    title: 'Audiences',
    description: 'Who we talk to, in nine audience groups, with what each audience needs.',
    href: '/knowledge/audiences',
    icon: Users,
  },
  {
    title: 'Facilities',
    description: 'Schools and health facilities, with what they need and which offerings serve them.',
    href: '/knowledge/facilities',
    icon: School,
  },
  {
    title: 'Systems',
    description: 'Education and health systems and services, with what they need and which offerings serve them.',
    href: '/knowledge/systems',
    icon: Network,
  },
  {
    title: 'Offerings',
    description: 'What we offer, in six categories, and which audiences each offering serves.',
    href: '/knowledge/offerings',
    icon: Building2,
  },
]

/** "Social post" → "social post", "UNICEF" stays "UNICEF". */
function inSentence(label: string) {
  return /^[A-Z][A-Z]/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1)
}

const article = (label: string) => (/^[aeiou]/i.test(label) ? 'an' : 'a')

/** DI home: "What are you generating today?" (shell "app" only). */
export function DiHome() {
  const router = useRouter()
  const [outputType, setOutputType] = useState<OutputType>('map')
  const [audienceGroupId, setAudienceGroupId] = useState(ANYONE)
  const [showSoonNote, setShowSoonNote] = useState(false)

  const output = OUTPUT_OPTIONS.find((o) => o.type === outputType)!

  const start = () => {
    const brief: Brief = { outputType, audienceGroupId: audienceGroupId === ANYONE ? undefined : audienceGroupId }
    const href = briefHref(brief)
    if (href) router.push(href)
    else setShowSoonNote(true)
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-6 pb-16 pt-10 md:pt-14">
      {/* Brief selector */}
      <section aria-labelledby="home-title" className="rounded-3xl border border-border bg-card p-6 shadow-stripe md:p-10">
        <h1
          id="home-title"
          className="font-heading text-[clamp(1.9rem,3.4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-foreground"
        >
          What are you generating today?
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 font-heading text-xl font-medium text-foreground md:text-2xl">
          <span>I&apos;m creating {article(output.label)}</span>
          <Select
            value={outputType}
            onValueChange={(v) => {
              setOutputType(v as OutputType)
              setShowSoonNote(false)
            }}
          >
            <SelectTrigger aria-label="Output" className={SENTENCE_TRIGGER}>
              <SelectValue>{inSentence(output.label)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_OPTIONS.map((o) => (
                <SelectItem key={o.type} value={o.type}>
                  {o.label}
                  {!o.href && <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>for</span>
          <Select value={audienceGroupId} onValueChange={setAudienceGroupId}>
            <SelectTrigger aria-label="Audience" className={SENTENCE_TRIGGER}>
              <SelectValue>
                {inSentence(AUDIENCE_GROUPS.find((g) => g.id === audienceGroupId)?.name ?? 'Anyone')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANYONE}>Anyone</SelectItem>
              {AUDIENCE_GROUPS.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={start}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-stripe-md transition-smooth hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Start
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={ICON_STROKE} aria-hidden />
          </button>
          <p role="status" className="text-sm text-muted-foreground">
            {showSoonNote && `${output.label}s will open in the deck builder soon.`}
          </p>
        </div>
      </section>

      {/* Templates */}
      <section aria-labelledby="templates-title" className="mt-14">
        <h2 id="templates-title" className="font-heading text-xl font-medium text-foreground">
          Start from a template
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.title}>
              <TemplateCard template={t} />
            </li>
          ))}
        </ul>
      </section>

      {/* Knowledge */}
      <section aria-labelledby="knowledge-title" className="mt-14">
        <h2 id="knowledge-title" className="font-heading text-xl font-medium text-foreground">
          Knowledge
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KNOWLEDGE_LINKS.map(({ title, description, href, icon: Icon }) => (
            <li key={title}>
              <Link
                href={href}
                className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-stripe transition-smooth hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" strokeWidth={ICON_STROKE} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-heading text-base font-medium text-foreground">
                    {title}
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={ICON_STROKE}
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

const SENTENCE_TRIGGER =
  'h-auto w-auto gap-2 rounded-full border-primary-200 bg-primary-50 px-4 py-1.5 font-heading text-xl font-medium text-primary-800 shadow-none hover:bg-primary-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 md:text-2xl [&>svg]:h-5 [&>svg]:w-5 [&>svg]:opacity-70'

function TemplateCard({ template }: { template: Template }) {
  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.image}
          alt=""
          className={cn('h-full w-full object-cover', template.href && 'zoom-on-group-hover')}
          loading="lazy"
        />
        {!template.href && (
          <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-foreground shadow-stripe">
            Coming soon
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-heading text-base font-medium text-foreground">{template.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
      </div>
    </>
  )

  const className = 'group block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-stripe'
  if (!template.href) {
    return (
      <div className={className} aria-disabled="true">
        {body}
      </div>
    )
  }
  return (
    <Link
      href={template.href}
      className={cn(className, 'transition-smooth hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      {body}
    </Link>
  )
}
