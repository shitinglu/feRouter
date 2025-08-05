'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationDetail } from '@/lib/actions/applications'
import RouteManagement from './RouteManagement'
// import PermissionManagement from './PermissionManagement'
// import DeploymentHistory from './DeploymentHistory'
import Analytics from './Analytics'

interface AppManagementTabsProps {
  application: ApplicationDetail
}

export default function AppManagementTabs({ application }: AppManagementTabsProps) {
  return (
    <Tabs defaultValue="routes" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="routes">路由管理</TabsTrigger>
        <TabsTrigger value="permissions">权限管理</TabsTrigger>
        <TabsTrigger value="deployments">部署历史</TabsTrigger>
        <TabsTrigger value="analytics">数据分析</TabsTrigger>
      </TabsList>
      
      <TabsContent value="routes" className="mt-6">
        <RouteManagement application={application} />
      </TabsContent>
      
      <TabsContent value="permissions" className="mt-6">
        {/* <PermissionManagement application={application} /> */}
      </TabsContent>
      
      <TabsContent value="deployments" className="mt-6">
        {/* <DeploymentHistory application={application} /> */}
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <Analytics application={application} />
      </TabsContent>
    </Tabs>
  )
}

