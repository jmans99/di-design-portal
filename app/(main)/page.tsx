import { HomeHero } from '@/components/home/home-hero'
import { SystemBento } from '@/components/home/system-bento'
import { WorkflowList } from '@/components/home/workflow-list'
import { Showcase } from '@/components/home/showcase'
import { Faq } from '@/components/home/faq'
import { ClosingCta } from '@/components/home/closing-cta'
import { DiHome } from '@/components/di-home/di-home'
import { getSite } from '@/lib/site'

export default function HomePage() {
  if (getSite().shell === 'app') return <DiHome />

  return (
    <main className="min-w-0 flex-1 overflow-visible">
      <HomeHero />
      <SystemBento />
      <WorkflowList />
      <Showcase />
      <Faq />
      <ClosingCta />
    </main>
  )
}
