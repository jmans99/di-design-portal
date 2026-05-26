/**
 * Registry of downloadable Claude skills used by the Giga team.
 * Each skill is packaged as a `.zip` containing a `SKILL.md` (name + description
 * frontmatter), ready to upload to Claude Desktop. Source files live in the
 * DI-prompts repository by Maria Antonia Bravo.
 */

export type SkillCategoryId = 'writing' | 'data' | 'strategy'

export interface SkillCategory {
  id: SkillCategoryId
  label: string
  /** One-line framing of what this group is for. */
  blurb: string
}

export interface Skill {
  id: string
  title: string
  category: SkillCategoryId
  /** What the skill is, in one sentence. */
  description: string
  /** When to reach for it. */
  useWhen: string
  /** Static path to the downloadable package. */
  file: string
  /** Human-readable archive size. */
  size: string
  /** Slash command, when the skill is invoked as one. */
  command?: string
  /** Source markdown on GitHub. */
  source: string
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'writing',
    label: 'Writing & Editing',
    blurb: 'Voice, structure, and editing passes for high-signal prose.',
  },
  {
    id: 'data',
    label: 'Data & Charts',
    blurb: 'On-brand, policy-legible data visuals.',
  },
  {
    id: 'strategy',
    label: 'Strategy & Research',
    blurb: 'Frameworks for understanding stakeholders and audiences.',
  },
]

export const SKILLS_AUTHOR = {
  name: 'Maria Antonia Bravo',
  repo: 'https://github.com/mabravoreyes/DI-prompts',
}

export const SKILLS: Skill[] = [
  {
    id: 'tech-writing-coach',
    title: 'Tech Writing Coach',
    category: 'writing',
    description:
      'A writing coach for high-signal, tactical prose, drawing on Wes Kao, Zinsser, and Strunk & White. Covers voice, sentence rhythm, formatting, and a banned-words list.',
    useWhen:
      'Drafting internal docs, product explainers, or comms where clarity beats polish.',
    file: '/skills/tech-writing-coach.zip',
    size: '3.2 KB',
    source: 'https://github.com/mabravoreyes/DI-prompts/blob/main/tech_writing_coach.md',
  },
  {
    id: 'cloudflare-radar-style',
    title: 'Cloudflare Radar Style',
    category: 'writing',
    description:
      'A style guide for analytical, data-driven writing modelled on Cloudflare Radar blog posts: event → timeline → data impact → recovery → context, with precise hedging.',
    useWhen:
      'Writing about internet trends or network events for both technical and general readers.',
    file: '/skills/cloudflare-radar-style.zip',
    size: '2.0 KB',
    source: 'https://github.com/mabravoreyes/DI-prompts/blob/main/cloudflare-radar-style.md',
  },
  {
    id: 'copy-edit',
    title: 'Copy-Edit',
    category: 'writing',
    description:
      'A three-step editing pass over long-form text: structure and coherence, content and specificity, then a close grammar pass. Run all three or target one.',
    useWhen:
      'Polishing a blog post, newsletter, script, or email before it ships.',
    file: '/skills/copy-edit.zip',
    size: '1.2 KB',
    command: '/copy-edit',
    source: 'https://github.com/mabravoreyes/DI-prompts/blob/main/copy-edit.md',
  },
  {
    id: 'giga-chart-style',
    title: 'Giga Chart Style',
    category: 'data',
    description:
      'A visual identity for matplotlib charts: Cloudflare Radar information hierarchy applied to Giga brand colours and fonts, with patterns for time series, dumbbells, and heatmaps.',
    useWhen:
      'Building charts in Jupyter for Giga blogs, decks, or country reports.',
    file: '/skills/giga-chart-style.zip',
    size: '2.9 KB',
    source: 'https://github.com/mabravoreyes/DI-prompts/blob/main/giga-chart-style.md',
  },
  {
    id: 'giga-persona-segmentation',
    title: 'Persona Segmentation',
    category: 'strategy',
    description:
      'Classifies a person into one of four school-connectivity personas (Mandate Holder, Program Owner, Data Analyst, Implementer) with confidence-scored rationale.',
    useWhen:
      'Routing comms or tailoring a deliverable in a government or education connectivity context.',
    file: '/skills/giga-persona-segmentation.zip',
    size: '3.6 KB',
    source: 'https://github.com/mabravoreyes/DI-prompts/blob/main/giga_persona_segmentation.md',
  },
]
