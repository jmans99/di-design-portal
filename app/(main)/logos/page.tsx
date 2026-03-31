'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LogoGenerator } from '@/components/logo-generator'

function LogosContent() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? undefined

  return <LogoGenerator initialColorVariant={variant} />
}

export default function LogosPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div
        className="-mx-6 -mt-10 mb-3"
        style={{ background: 'linear-gradient(180deg, hsl(214 100% 97%) 0%, hsl(210 40% 98.3%) 100%)' }}
      >
        <div className="px-6 pb-6 pt-9">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            Giga · Brand Assets
          </p>
          <h1 className="font-heading text-[2.75rem] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Logos
          </h1>
          <p className="mt-3 w-full text-[15px] leading-relaxed text-muted-foreground">
            Select a color variant, choose your format, and download a ready-to-use asset.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="min-h-[200px]" aria-hidden />}>
        <LogosContent />
      </Suspense>
    </main>
  )
}
