'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LogoGenerator } from '@/components/logo-generator'
import { PageHeader } from '@/components/page-header'

function LogosContent() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? undefined

  return <LogoGenerator initialColorVariant={variant} />
}

export default function LogosPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-12">
      <PageHeader
        title="Logos"
        description="Select a color variant, choose your format, and download a ready-to-use asset."
      />
      <Suspense fallback={<div className="min-h-[200px]" aria-hidden />}>
        <LogosContent />
      </Suspense>
    </main>
  )
}
