import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell/app-shell'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remembered side panel state (cookie written by components/ui/sidebar.tsx).
  const sidebarState = (await cookies()).get('sidebar_state')?.value
  return <AppShell defaultOpen={sidebarState !== 'false'}>{children}</AppShell>
}
