'use client'

import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { FOOTER_SECTION_LINKS } from '@/lib/nav'

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
                src="/logos/unicef-digital-impact-unboxed.svg"
                alt="UNICEF Digital Impact Division"
                className="h-7 w-auto opacity-70"
              />
              <span className="h-4 w-px bg-border" />
              <p className="text-xs text-muted-foreground">
                For authorized partners only.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Section links">
              {FOOTER_SECTION_LINKS.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
