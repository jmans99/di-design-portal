import { SocialMediaStudio } from '@/components/social-media/studio'
import { PageHeader } from '@/components/page-header'

export const metadata = {
  title: 'Social media — Brand asset generator',
}

export default function SocialMediaPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Social media"
        description="Pick a country and download the ready-to-post country-joins-Giga announcement. Tagline, date, and subtitle are editable. PNG export is 1080×1350 (Instagram portrait)."
      />
      <SocialMediaStudio />
    </main>
  )
}
