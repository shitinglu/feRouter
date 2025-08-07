'use client'

import { useState, useEffect } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useApp } from '@/hooks/use-app'
import axios from 'axios'
import {
  PerformanceDashboard,
  PerformanceOverview,
  SystemMetricsTable,
  ErrorStatsTable,
  RecentErrorsTable,
  CriticalAlertsTable
} from '@/components/analytics/PerformanceCharts'

// 数据类型定义
interface PerformanceData {
  overview: {
    cpuUsage: number
    memoryUsage: number
    avgResponseTime: number
    uptime: string
    throughput: number
    errorRate: number
    activeAlerts: number
    totalErrors: number
  }
  systemMetrics: Array<{
    time: string
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkIn: number
    networkOut: number
    responseTime: number
    throughput: number
    errorCount: number
    activeUsers: number
    dbConnections: number
    dbQueryTime: number
  }>
  errorStats: {
    byType: Record<string, number>
    bySeverity: Record<string, number>
    total: number
  }
  alertStats: {
    byType: Record<string, number>
    bySeverity: Record<string, number>
    byStatus: Record<string, number>
    total: number
  }
  recentErrors: Array<{
    id: string
    errorType: string
    severity: string
    message: string
    method?: string
    path?: string
    statusCode?: number
    ip?: string
    createdAt: string
    route?: {
      name: string
      path: string
    }
  }>
  criticalAlerts: Array<{
    id: string
    alertType: string
    severity: string
    title: string
    description: string
    threshold?: number
    currentValue?: number
    status: string
    createdAt: string
  }>
  trends: {
    cpu: Array<{ time: string; value: number }>
    memory: Array<{ time: string; value: number }>
    responseTime: Array<{ time: string; value: number }>
    throughput: Array<{ time: string; value: number }>
    errors: Array<{ time: string; value: number }>
  }
}

export default function PerformancePage() {
  const { appId } = useApp()
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  // 获取性能监控数据
  const fetchPerformance = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/applications/${appId}/performance?timeRange=${timeRange}`)
      console.log('Performance API response:', response.data) // 调试日志
      if (response.data.success) {
        setPerformance(response.data.data)
      } else {
        console.error('API返回错误:', response.data.message)
      }
    } catch (error) {
      console.error('获取性能监控数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appId) {
      fetchPerformance()
    }
  }, [appId, timeRange])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
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
                  <BreadcrumbLink href={`/apps/${appId}/analytics`}>数据分析</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>性能监控</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>加载性能监控数据中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="flex flex-col h-full">
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
                  <BreadcrumbLink href={`/apps/${appId}/analytics`}>数据分析</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>性能监控</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">无法加载性能监控数据</h3>
            <p className="text-muted-foreground mb-4">请检查网络连接或联系管理员</p>
            <Button onClick={fetchPerformance}>重试</Button>
          </div>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/apps/${appId}/analytics`}>数据分析</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>性能监控</BreadcrumbPage>
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
            <h1 className="text-2xl font-bold">性能监控</h1>
            <p className="text-muted-foreground">监控系统性能指标、错误日志和警报信息</p>
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
              onClick={fetchPerformance}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 性能监控标签页 */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">性能概览</TabsTrigger>
            <TabsTrigger value="metrics">系统指标</TabsTrigger>
            <TabsTrigger value="errors">错误分析</TabsTrigger>
            <TabsTrigger value="alerts">警报管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 综合性能仪表板 */}
            <PerformanceDashboard
              overview={performance.overview}
              systemMetrics={performance.systemMetrics}
              errorStats={performance.errorStats}
              recentErrors={performance.recentErrors}
              criticalAlerts={performance.criticalAlerts}
              timeRange={timeRange}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {/* 系统指标详细页面 */}
            <PerformanceOverview overview={performance.overview} />
            <SystemMetricsTable metrics={performance.systemMetrics} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            {/* 错误分析页面 */}
            <ErrorStatsTable errorStats={performance.errorStats} />
            <RecentErrorsTable errors={performance.recentErrors} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {/* 警报管理页面 */}
            <CriticalAlertsTable alerts={performance.criticalAlerts} />
            {/* 这里可以添加警报配置组件 */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 