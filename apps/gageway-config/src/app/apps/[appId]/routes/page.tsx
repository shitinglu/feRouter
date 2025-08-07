
"use client"
import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react';
import TableList from "./TableList"
import AddRouteDrawer from "./AddRouteDrawer"

interface RoutesPageProps {
  params: { appId: string }
}

export default function RoutesPage({ params }: RoutesPageProps) {
  const [appId, setAppId] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取appId (客户端组件中处理)
  React.useEffect(() => {
    const getAppId = async () => {
      const resolvedParams = await params;
      setAppId(resolvedParams.appId);
    };
    getAppId();
  }, [params]);

  // 打开抽屉
  const handleAddRoute = () => {
    setDrawerOpen(true);
  };

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // 添加成功后刷新列表
  const handleAddSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!appId) {
    return <div>加载中...</div>;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apps/${appId}`}>应用概览</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>路由管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button onClick={handleAddRoute}>
            <Plus className="h-4 w-4" />
            添加路由
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-6">
        <TableList appId={appId} key={refreshKey} />
      </div>

      {/* 添加路由抽屉 */}
      <AddRouteDrawer
        appId={appId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={handleAddSuccess}
      />
    </>
  )
}