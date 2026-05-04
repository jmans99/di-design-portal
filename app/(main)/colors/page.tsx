'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy URL: palette lives on /typography#colors */
export default function ColorsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/typography#colors')
  }, [router])

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-6xl flex-1 items-center justify-center px-6 py-10">
      <p className="text-sm text-muted-foreground">Opening typography…</p>
    </main>
  )
}
