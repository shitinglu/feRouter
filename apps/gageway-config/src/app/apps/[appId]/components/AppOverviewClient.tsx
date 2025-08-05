'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Route, Users, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/hooks/use-app'

export function AppOverviewClient() {
  // 🎉 现在你可以在任何地方轻松获取应用信息！
  const { application, appId } = useApp()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 快速操作区域 */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/apps/${appId}/routes/new`}>
            <Route className="mr-2 h-4 w-4" />
            添加路由
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/apps/${appId}/analytics`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            查看分析
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/apps/${appId}/settings`}>
            设置
          </Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃路由</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{application._count.routes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> 本月新增
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户权限</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{application._count.permissions}</div>
            <p className="text-xs text-muted-foreground">
              分配给不同用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日请求</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 较昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">
              过去24小时
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 应用信息和最近活动 */}
        <div className="">
        <Card>
          <CardHeader>
            <CardTitle>应用信息</CardTitle>
            <CardDescription>基本配置信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">应用名称</span>
              <span className="text-sm font-medium">{application.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">域名</span>
              <span className="text-sm font-medium">{application.domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">状态</span>
              <Badge variant={application.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {application.status === 'ACTIVE' ? '运行中' : '已停用'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">创建时间</span>
              <span className="text-sm font-medium">
                {new Date(application.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">您的角色</span>
              <Badge variant="outline">{application.userRole}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* ... 其他内容保持不变 */}
      </div>

      {/* 快速链接 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href={`/apps/${appId}/routes`} className="flex flex-col items-center gap-2">
                <Route className="h-6 w-6" />
                <span>管理路由</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href={`/apps/${appId}/permissions`} className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>用户权限</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href={`/apps/${appId}/analytics`} className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>数据分析</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 