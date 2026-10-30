'use client'

import { useSearchParams } from 'next/navigation'
import { BrandTabs, BrandTabsPanel, BrandTabsRoot, useBrandFilter } from '@/components/brand/brand-tabs'
import { LogoGenerator } from '@/components/logo-generator'
import { PageHeader } from '@/components/page-header'

function LogosContent() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? undefined
  return <LogoGenerator filter={useBrandFilter()} initialColorVariant={variant} />
}

export default function LogosPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      {/* The (main) layout renders per request, so the URL is known on the server: no Suspense needed. */}
      <BrandTabsRoot withAll>
        <PageHeader
          title="Logos"
          description="Select a color variant, choose your format, and download a ready-to-use asset."
          actions={<BrandTabs />}
        />
        <BrandTabsPanel>
          <LogosContent />
        </BrandTabsPanel>
      </BrandTabsRoot>
    </main>
  )
}
