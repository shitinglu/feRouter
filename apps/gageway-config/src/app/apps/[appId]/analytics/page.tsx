'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Activity, 
  Route, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useApp } from '@/hooks/use-app'
import axios from 'axios'
import { 
  CleanDashboard,
  CleanTrafficTable,
  CleanRouteTable,
  CleanStatusTable 
} from '@/components/analytics/CleanStyleCharts'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

interface AnalyticsData {
  overview: {
    totalRoutes: number
    activeRoutes: number
    totalOperations: number
    totalUsers: number
    uptime: string
  }
  routeStats: {
    statusDistribution: {
      active: number
      inactive: number
      total: number
    }
    configTypeDistribution: {
      redirect: number
      oss: number
      draft: number
    }
  }
  operationStats: Record<string, number>
  topRoutes: Array<{
    id: string
    name: string
    path: string
    method: string
    versionCount: number
    status: string
    configType: string
    lastPublished?: Date
  }>
  chartData: {
    trafficData: Array<{
      time: string
      requests: number
      uniqueUsers: number
      avgResponseTime: number
    }>
    routeTrafficData: Array<{
      name: string
      path: string
      requests: number
      percentage: number
      status: 'active' | 'inactive'
    }>
    performanceData: Array<{
      time: string
      avgResponseTime: number
      p95ResponseTime: number
      errorRate: number
    }>
    statusCodeData: Array<{
      category: string
      count: number
      percentage: number
      color: string
    }>
  }
  metrics: {
    totalRequests: number
    uniqueUsers: number
    avgResponseTime: number
    errorRate: number
    uptime: string
  }
  recentActivity: Array<{
    id: string
    action: string
    resource: string
    resourceId: string
    userName: string
    createdAt: Date
    details?: any
  }>
  versionHistory: Array<{
    id: string
    version: string
    action: string
    description?: string
    createdAt: Date
  }>
}

export default function AnalyticsPage() {
  const { appId } = useApp()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/applications/${appId}/analytics?timeRange=${timeRange}`)
      console.log('Analytics API response:', response.data) // 调试日志
      if (response.data.success) {
        setAnalytics(response.data.data)
      } else {
        console.error('API返回错误:', response.data.message)
      }
    } catch (error) {
      console.error('获取分析数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appId) {
      fetchAnalytics()
    }
  }, [appId, timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>加载分析数据中...</span>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">无法加载分析数据</h3>
          <p className="text-gray-500 mb-4">请检查网络连接或联系管理员</p>
          <Button onClick={fetchAnalytics}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 - 与权限管理页面一致 */}
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
              <BreadcrumbItem>
                <BreadcrumbPage>数据分析</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* 页面内容 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">数据分析</h1>
            <p className="text-muted-foreground">查看应用的使用统计和性能指标</p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              <option value="1d">最近 1 天</option>
              <option value="7d">最近 7 天</option>
              <option value="30d">最近 30 天</option>
            </select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAnalytics}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

      {/* 概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总路由数</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {analytics.overview.activeRoutes}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总操作数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === '1d' ? '今日' : timeRange === '7d' ? '7日内' : '30日内'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">团队成员</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              有权限用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统可用性</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.uptime}</div>
            <p className="text-xs text-muted-foreground">
              运行稳定
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃度</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((analytics.overview.activeRoutes / analytics.overview.totalRoutes) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              路由活跃率
            </p>
          </CardContent>
        </Card>
      </div>

        {/* 数据分析标签页 */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">总览仪表板</TabsTrigger>
            <TabsTrigger value="traffic">流量分析</TabsTrigger>
            <TabsTrigger value="routes">路由分析</TabsTrigger>
            <TabsTrigger value="operations">操作分析</TabsTrigger>
            <TabsTrigger value="activity">活动记录</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* 使用简洁的仪表板组件 */}
            {analytics.chartData && analytics.metrics ? (
              <CleanDashboard
                trafficData={analytics.chartData.trafficData || []}
                routeTrafficData={analytics.chartData.routeTrafficData || []}
                statusCodeData={analytics.chartData.statusCodeData || []}
                timeRange={timeRange}
                metrics={analytics.metrics}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">数据结构不完整，请检查API返回</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            {/* 流量分析页面 */}
            {analytics.chartData && analytics.metrics ? (
              <div className="space-y-4">
                <CleanTrafficTable 
                  data={analytics.chartData.trafficData || []} 
                  timeRange={timeRange} 
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <CleanRouteTable data={analytics.chartData.routeTrafficData || []} />
                  <CleanStatusTable data={analytics.chartData.statusCodeData || []} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">数据结构不完整，请检查API返回</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 路由状态分布 */}
            <Card>
              <CardHeader>
                <CardTitle>路由状态分布</CardTitle>
                <CardDescription>当前路由的启用状态统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">活跃路由</span>
                    </div>
                    <Badge variant="secondary">{analytics.routeStats.statusDistribution.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">停用路由</span>
                    </div>
                    <Badge variant="outline">{analytics.routeStats.statusDistribution.inactive}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 配置类型分布 */}
            <Card>
              <CardHeader>
                <CardTitle>配置类型分布</CardTitle>
                <CardDescription>路由配置类型统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">重定向</span>
                    </div>
                    <Badge variant="secondary">{analytics.routeStats.configTypeDistribution.redirect}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">OSS映射</span>
                    </div>
                    <Badge variant="secondary">{analytics.routeStats.configTypeDistribution.oss}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">草稿</span>
                    </div>
                    <Badge variant="outline">{analytics.routeStats.configTypeDistribution.draft}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 热门路由 */}
          <Card>
            <CardHeader>
              <CardTitle>最活跃路由</CardTitle>
              <CardDescription>基于版本变更次数排序</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topRoutes.map((route, index) => (
                  <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-gray-500">
                          {route.method} {route.path}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{route.versionCount} 个版本</div>
                      <Badge variant={route.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                        {route.configType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="operations" className="space-y-4">
          {/* 操作类型统计 */}
          <Card>
            <CardHeader>
              <CardTitle>操作类型统计</CardTitle>
              <CardDescription>最近 {timeRange === '1d' ? '1天' : timeRange === '7d' ? '7天' : '30天'} 的操作分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(analytics.operationStats).map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{action}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 版本历史 */}
          <Card>
            <CardHeader>
              <CardTitle>版本变更历史</CardTitle>
              <CardDescription>最近的版本操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.versionHistory.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">版本 {version.version}</div>
                      <div className="text-sm text-gray-500">{version.description || '无描述'}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{version.action}</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="activity" className="space-y-4">
          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>系统操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-500">
                          {activity.resource} · {activity.userName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 