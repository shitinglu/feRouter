import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface RoutesPageProps {
  params: { appId: string }
}

export default function RoutesPage({ params }: RoutesPageProps) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apps/${params.appId}`}>应用概览</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>路由管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/apps/${params.appId}/routes/new`}>
              <Plus className="mr-2 h-4 w-4" />
              添加路由
            </Link>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <h3 className="text-lg font-semibold">路由管理页面</h3>
          <p className="text-muted-foreground mt-2">这里将显示路由列表和管理功能</p>
        </div>
      </div>
    </>
  )
}