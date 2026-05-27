import { SkillsBrowser } from '@/components/skills/skills-browser'
import { PageHeader } from '@/components/page-header'

export const metadata = {
  title: 'AI Skills — Brand asset generator',
}

export default function SkillsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="AI Skills"
        description="The AI skills the Giga team uses. Download one, add it to your AI platform, and it runs whenever the work calls for it."
      />
      <SkillsBrowser />
    </main>
  )
}
