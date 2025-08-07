'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3, TrendingUp, Activity, AlertCircle, CheckCircle, Users } from 'lucide-react'

// 数据类型定义
interface TrafficData {
  time: string
  requests: number
  uniqueUsers: number
  avgResponseTime: number
}

interface RouteTrafficData {
  name: string
  path: string
  requests: number
  percentage: number
  status: 'active' | 'inactive'
}

interface StatusCodeData {
  category: string
  count: number
  percentage: number
  color: string
}

// 简洁的指标卡片
interface CleanMetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function CleanMetricCard({ title, value, description, icon: Icon, trend }: CleanMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-md">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

// 简洁的流量趋势表格
interface CleanTrafficTableProps {
  data: TrafficData[]
  timeRange: string
}

export function CleanTrafficTable({ data, timeRange }: CleanTrafficTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            流量趋势数据
          </CardTitle>
          <CardDescription>
            {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          流量趋势数据
        </CardTitle>
        <CardDescription>
          {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">请求数</TableHead>
              <TableHead className="text-right">用户数</TableHead>
              <TableHead className="text-right">响应时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const date = new Date(item.time)
              const timeLabel = timeRange === '1d' 
                ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{timeLabel}</TableCell>
                  <TableCell className="text-right">{item.requests.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.uniqueUsers.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.avgResponseTime > 200 ? 'destructive' : 'secondary'}>
                      {item.avgResponseTime}ms
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 简洁的路由流量表格
interface CleanRouteTableProps {
  data: RouteTrafficData[]
}

export function CleanRouteTable({ data }: CleanRouteTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            路由流量统计
          </CardTitle>
          <CardDescription>各路由的访问量排行</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          路由流量统计
        </CardTitle>
        <CardDescription>共 {data.length} 个路由，按访问量排序</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排名</TableHead>
              <TableHead>路由名称</TableHead>
              <TableHead>路径</TableHead>
              <TableHead className="text-right">请求数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">占比</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((route, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{route.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {route.path}
                  </code>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {route.requests.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                    {route.status === 'active' ? '启用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {route.percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 简洁的状态码统计
interface CleanStatusTableProps {
  data: StatusCodeData[]
}

export function CleanStatusTable({ data }: CleanStatusTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            状态码分布
          </CardTitle>
          <CardDescription>HTTP响应状态码统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (category: string) => {
    if (category.includes('2xx')) return CheckCircle
    if (category.includes('4xx') || category.includes('5xx')) return AlertCircle
    return Activity
  }

  const getStatusVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    if (category.includes('2xx')) return 'default'
    if (category.includes('4xx')) return 'secondary'
    if (category.includes('5xx')) return 'destructive'
    return 'outline'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          状态码分布
        </CardTitle>
        <CardDescription>HTTP响应状态码统计</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>状态码类型</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">占比</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const StatusIcon = getStatusIcon(item.category)
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(item.category)}>
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 简洁的仪表板
interface CleanDashboardProps {
  trafficData: TrafficData[]
  routeTrafficData: RouteTrafficData[]
  statusCodeData: StatusCodeData[]
  timeRange: string
  metrics: {
    totalRequests: number
    uniqueUsers: number
    avgResponseTime: number
    errorRate: number
    uptime: string
  }
}

export function CleanDashboard({
  trafficData,
  routeTrafficData,
  statusCodeData,
  timeRange,
  metrics
}: CleanDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 关键指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CleanMetricCard
          title="总请求数"
          value={metrics.totalRequests.toLocaleString()}
          description="累计请求量"
          icon={BarChart3}
          trend={{ value: '12%', isPositive: true }}
        />
        <CleanMetricCard
          title="独立用户"
          value={metrics.uniqueUsers.toLocaleString()}
          description="活跃用户数"
          icon={Users}
          trend={{ value: '8%', isPositive: true }}
        />
        <CleanMetricCard
          title="响应时间"
          value={`${metrics.avgResponseTime}ms`}
          description="平均响应延迟"
          icon={Activity}
          trend={{ 
            value: metrics.avgResponseTime > 200 ? '15ms' : '5ms', 
            isPositive: metrics.avgResponseTime <= 200 
          }}
        />
        <CleanMetricCard
          title="错误率"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          description="请求失败比例"
          icon={AlertCircle}
          trend={{ 
            value: '0.1%', 
            isPositive: metrics.errorRate <= 0.05 
          }}
        />
      </div>

      {/* 数据表格 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CleanTrafficTable data={trafficData} timeRange={timeRange} />
        <CleanStatusTable data={statusCodeData} />
      </div>
      
      {/* 路由统计表格 */}
      <CleanRouteTable data={routeTrafficData} />
    </div>
  )
} 