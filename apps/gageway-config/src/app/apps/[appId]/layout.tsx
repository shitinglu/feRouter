import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getApplicationById } from '@/lib/actions/applications'
import { AppSidebar } from '@/components/app-management/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/lib/app-context'

interface AppLayoutProps {
  children: React.ReactNode
  params: { appId: string }
}

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const session = await auth()

  const { appId } = await params;
  
  if (!session?.user?.id) {
    notFound()
  }

  const application = await getApplicationById(appId, session.user.id)
  
  if (!application) {
    notFound()
  }

  return (
    <AppProvider application={application}>
      <SidebarProvider>
        <AppSidebar application={application} />
        <SidebarInset  >
          {children}
        </SidebarInset>
        <Toaster position="top-center" />
      </SidebarProvider>
    </AppProvider>
  )
}

export const metadata = {
  title: '应用管理 | Gateway Config',
  description: '管理您的应用配置、路由和权限',
} 