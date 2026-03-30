'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LogoGenerator } from '@/components/logo-generator'

function LogosContent() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? undefined

  return (
    <>
      <div className="pb-6 animate-in fade-in duration-300 ease-out">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-medium text-foreground text-balance">
            Logos
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Select a color variant, choose your format, and download a ready-to-use asset.
          </p>
        </div>
      </div>
      <LogoGenerator initialColorVariant={variant} />
    </>
  )
}

export default function LogosPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <Suspense fallback={
        <>
          <div className="pb-6 animate-in fade-in duration-300 ease-out">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-3xl font-medium text-foreground text-balance">Logos</h2>
              <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
                Select a color variant, choose your format, and download a ready-to-use asset.
              </p>
            </div>
          </div>
          <div className="min-h-[200px]" aria-hidden />
        </>
      }>
        <LogosContent />
      </Suspense>
    </main>
  )
}
