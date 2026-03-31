'use client'

import { AppHeader } from '@/components/app-header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-visible bg-background">
      <AppHeader />
      {children}
      <footer className="mt-auto border-t border-border bg-card shadow-stripe">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/giga-complete-horizontal.svg"
                alt="Giga"
                className="h-5 w-auto opacity-60"
              />
              <span className="h-4 w-px bg-border" />
              <p className="text-xs text-muted-foreground">
                For authorized partners only.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/logos"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Logos
              </a>
              <a
                href="/colors"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Colors
              </a>
              <a
                href="/typography"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Typography
              </a>
              <a
                href="/guidelines/video"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Guidelines
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
