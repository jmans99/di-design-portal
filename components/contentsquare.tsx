'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    _uxa?: unknown[][]
    CS_CONF?: unknown
  }
}

const TAG_ID = process.env.NEXT_PUBLIC_CONTENTSQUARE_TAG_ID

function ContentsquareTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    if (!TAG_ID) return

    window._uxa = window._uxa || []
    const path = pathname + (search ? '?' + search : '')

    if (typeof window.CS_CONF === 'undefined') {
      // First load: set the path and inject the tag once
      window._uxa.push(['setPath', path])
      if (!document.getElementById('contentsquare-tag')) {
        const s = document.createElement('script')
        s.id = 'contentsquare-tag'
        s.async = true
        s.src = 'https://t.contentsquare.net/uxa/' + TAG_ID + '.js'
        document.head.appendChild(s)
      }
    } else {
      // Later page changes: report a new pageview
      window._uxa.push(['trackPageview', path])
    }
  }, [pathname, search])

  return null
}

// useSearchParams needs a Suspense boundary in the App Router.
// Renders nothing when no tag ID is set (local dev, previews).
export function Contentsquare() {
  if (!TAG_ID) return null

  return (
    <Suspense fallback={null}>
      <ContentsquareTracker />
    </Suspense>
  )
}
