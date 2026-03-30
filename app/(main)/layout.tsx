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
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Giga Brand Asset Generator — for authorized partners only.
          </p>
          <p className="text-xs text-muted-foreground">
            Assets generated dynamically. Never pre-rendered.
          </p>
        </div>
      </footer>
    </div>
  )
}
