'use client'

import { useSearchParams } from 'next/navigation'
import { BrandTabs, BrandTabsContent, BrandTabsRoot } from '@/components/brand/brand-tabs'
import { LogoGenerator } from '@/components/logo-generator'
import { PageHeader } from '@/components/page-header'
import type { Brand } from '@/lib/brand'

function LogosContent({ brand }: { brand: Brand }) {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? undefined

  return <LogoGenerator brandTab={brand} initialColorVariant={variant} />
}

export default function LogosPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      {/* The (main) layout renders per request, so the URL is known on the server: no Suspense needed. */}
      <BrandTabsRoot>
        <PageHeader
          title="Logos"
          description="Select a color variant, choose your format, and download a ready-to-use asset."
          actions={<BrandTabs />}
        />
        {(['di', 'giga'] as const).map((brand) => (
          <BrandTabsContent key={brand} brand={brand}>
            <LogosContent brand={brand} />
          </BrandTabsContent>
        ))}
      </BrandTabsRoot>
    </main>
  )
}
