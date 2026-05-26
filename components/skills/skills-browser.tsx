'use client'

import { useMemo, useState } from 'react'
import {
  Download,
  Check,
  ArrowUpRight,
  PenLine,
  BarChart3,
  Compass,
  Terminal,
  BookOpen,
  Palette,
} from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  SKILLS,
  SKILL_CATEGORIES,
  type Skill,
  type SkillCategoryId,
} from '@/lib/skills-registry'

const CATEGORY_ICON: Record<SkillCategoryId, typeof PenLine> = {
  design: Palette,
  writing: PenLine,
  data: BarChart3,
  strategy: Compass,
}

type Filter = 'all' | SkillCategoryId

export function SkillsBrowser() {
  const [filter, setFilter] = useState<Filter>('all')
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SKILLS.length }
    for (const cat of SKILL_CATEGORIES) {
      c[cat.id] = SKILLS.filter((s) => s.category === cat.id).length
    }
    return c
  }, [])

  const visibleSkills = filter === 'all' ? SKILLS : SKILLS.filter((s) => s.category === filter)

  function handleDownload(skill: Skill) {
    setDownloadedId(skill.id)
    window.setTimeout(() => {
      setDownloadedId((curr) => (curr === skill.id ? null : curr))
    }, 2000)
  }

  return (
    <div className="pb-4">
      {/* Filter bar + install guide trigger */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter skills by category">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>
            All
          </FilterPill>
          {SKILL_CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.id}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
              count={counts[cat.id]}
            >
              {cat.label}
            </FilterPill>
          ))}
        </div>
        <InstallGuideDialog />
      </div>

      {/* One grid for all skills, filtered by the chips. Keyed on filter so the stagger replays. */}
      <div key={filter} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSkills.map((skill, i) => {
          const cat = SKILL_CATEGORIES.find((c) => c.id === skill.category)
          return (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              Icon={CATEGORY_ICON[skill.category]}
              categoryLabel={cat?.label ?? ''}
              downloaded={downloadedId === skill.id}
              onDownload={() => handleDownload(skill)}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth active:scale-[0.97] ${
        active
          ? 'border-primary-600 bg-primary-600 text-white shadow-stripe'
          : 'border-border bg-card text-muted-foreground hover:border-primary-300 hover:text-foreground'
      }`}
    >
      {children}
      <span className={`tabular-nums text-xs ${active ? 'text-white/70' : 'text-muted-foreground/70'}`}>
        {count}
      </span>
    </button>
  )
}

function SkillCard({
  skill,
  index,
  Icon,
  categoryLabel,
  downloaded,
  onDownload,
}: {
  skill: Skill
  index: number
  Icon: typeof PenLine
  categoryLabel: string
  downloaded: boolean
  onDownload: () => void
}) {
  return (
    <article
      className="reveal-in hover-lift flex h-full flex-col rounded-lg border border-border bg-card p-5"
      style={{ '--i': index } as React.CSSProperties}
    >
      {/* Icon tile anchor + optional command badge */}
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        {skill.command && (
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-grey-700">
            <Terminal className="h-3 w-3" aria-hidden />
            {skill.command}
          </span>
        )}
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-grey-500">
        {categoryLabel}
      </p>
      <h3 className="mt-1 font-heading text-lg font-medium leading-snug tracking-[-0.01em] text-foreground">
        {skill.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{skill.description}</p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold uppercase tracking-wide text-grey-600">Use when</span>{' '}
          {skill.useWhen}
        </p>
      </div>

      {/* Footer pinned to bottom: meta row + full-width download */}
      <div className="mt-auto pt-5">
        <div className="mb-2.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{skill.size}</span>
          {skill.source && (
            <>
              <span className="h-3 w-px bg-border" aria-hidden />
              <a
                href={skill.source}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-0.5 transition-smooth hover:text-foreground"
              >
                Source
                <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
            </>
          )}
        </div>
        <a
          href={skill.file}
          download
          onClick={onDownload}
          aria-label={`Download ${skill.title} skill`}
          className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white shadow-stripe transition-smooth active:scale-[0.98] ${
            downloaded ? 'bg-accent-green-600' : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {downloaded ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Saved
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden />
              Download
            </>
          )}
        </a>
      </div>
    </article>
  )
}

const INSTALL_STEPS = [
  {
    title: 'Download a skill',
    body: 'Pick a skill above and download its .zip. Keep it zipped, that is the format Claude expects.',
  },
  {
    title: 'Open Skills settings',
    body: 'In Claude Desktop, open Settings and go to the Capabilities tab, then find the Skills section.',
  },
  {
    title: 'Upload the package',
    body: 'Choose Upload skill and select the .zip you just downloaded. Claude reads its name and description automatically.',
  },
  {
    title: 'Use it in a chat',
    body: 'Start a new conversation. Claude runs the skill when your task matches it, or you can ask for it by name.',
  },
]

function InstallGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-stripe transition-smooth hover:border-primary-300 hover:text-primary-700 active:scale-[0.97] sm:self-auto"
        >
          <BookOpen className="h-4 w-4 text-primary-600" aria-hidden />
          How to install
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-medium tracking-[-0.01em]">
            Install in Claude Desktop
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Skills extend Claude with reusable instructions. Adding one takes about a minute and
            only has to be done once.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-2 flex flex-col gap-5">
          {INSTALL_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 font-heading text-sm font-semibold tabular-nums text-primary-700"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-1 flex items-start gap-2.5 rounded-lg bg-secondary px-4 py-3">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-grey-600" aria-hidden />
          <p className="text-xs leading-relaxed text-grey-700">
            <span className="font-semibold">Using Claude Code instead?</span> Unzip the package
            into{' '}
            <code className="rounded bg-grey-100 px-1 py-0.5 font-mono text-[11px] text-grey-900">
              ~/.claude/skills/
            </code>{' '}
            and the skill is available across every project. Skills that ship a slash command also
            work as{' '}
            <code className="rounded bg-grey-100 px-1 py-0.5 font-mono text-[11px] text-grey-900">
              /commands
            </code>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
