"use client"

import { useState, useEffect } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Eye, Edit, Trash2, Settings, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Role {
  role: string
  name: string
  description: string
  defaultPermissions: string[]
  color: string
  level: number
  userCount: number
}

interface Permission {
  permission: string
  name: string
  description: string
}

interface RoleData {
  roles: Role[]
  permissions: Permission[]
  totalUsers: number
}

interface RolesPageProps {
  params: { appId: string }
}

const PERMISSION_ICONS: Record<string, any> = {
  READ: Eye,
  WRITE: Edit,
  DELETE: Trash2,
  DEPLOY: Settings,
  ROLLBACK: Settings,
  MANAGE: Shield
}

export default function RolesPage({ params }: RolesPageProps) {
  const [appId, setAppId] = useState<string>('')
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [loading, setLoading] = useState(true)

  // 获取appId
  useEffect(() => {
    const getAppId = async () => {
      const resolvedParams = await params
      setAppId(resolvedParams.appId)
    }
    getAppId()
  }, [params])

  // 加载角色数据
  const loadRoleData = async () => {
    if (!appId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${appId}/roles`)
      const result = await response.json()

      if (result.success) {
        setRoleData(result.data)
      } else {
        toast.error(result.message || '加载角色信息失败')
      }
    } catch (error) {
      console.error('加载角色信息失败:', error)
      toast.error('加载角色信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appId) {
      loadRoleData()
    }
  }, [appId])

  if (!appId) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  if (!roleData) {
    return <div className="flex items-center justify-center h-64">加载失败</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">应用管理</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/apps/${appId}`}>应用详情</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/apps/${appId}/permissions`}>权限管理</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>角色管理</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* 页面内容 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">角色管理</h1>
          <p className="text-muted-foreground">查看和了解系统中的各种角色及其权限配置</p>
        </div>

        {/* 统计信息 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleData.totalUsers}</div>
              <p className="text-xs text-muted-foreground">拥有应用权限的用户</p>
            </CardContent>
          </Card>
          
          {roleData.roles.slice(0, 3).map((role) => (
            <Card key={role.role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{role.name}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{role.userCount}</div>
                <p className="text-xs text-muted-foreground">个用户</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 角色列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              系统角色
            </CardTitle>
            <CardDescription>
              系统预定义的角色类型及其默认权限配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roleData.roles.map((role) => (
                <Card key={role.role} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <Badge className={role.color}>
                        {role.userCount} 人
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">权限范围</h4>
                        <div className="grid gap-2">
                          {role.defaultPermissions.map((permission) => {
                            const permConfig = roleData.permissions.find(p => p.permission === permission)
                            const IconComponent = PERMISSION_ICONS[permission] || Shield
                            
                            return (
                              <div key={permission} className="flex items-center gap-2 text-sm">
                                <IconComponent className="h-3 w-3 text-muted-foreground" />
                                <span>{permConfig?.name || permission}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 权限说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              权限说明
            </CardTitle>
            <CardDescription>
              了解系统中各种权限的具体含义和作用范围
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roleData.permissions.map((permission) => {
                const IconComponent = PERMISSION_ICONS[permission.permission] || Shield
                
                return (
                  <div key={permission.permission} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{permission.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}