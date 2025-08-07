'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// 简化的流量趋势图表
interface TrafficData {
  time: string
  requests: number
  uniqueUsers: number
  avgResponseTime: number
}

interface SimpleTrafficChartProps {
  data: TrafficData[]
  timeRange: string
}

export function SimpleTrafficChart({ data, timeRange }: SimpleTrafficChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>流量趋势分析</CardTitle>
          <CardDescription>
            {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests))
  const maxUsers = Math.max(...data.map(d => d.uniqueUsers))

  return (
    <Card>
      <CardHeader>
        <CardTitle>流量趋势分析</CardTitle>
        <CardDescription>
          {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 图例 */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>请求数</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>独立用户</span>
            </div>
          </div>
          
          {/* 简化的柱状图 */}
          <div className="space-y-2">
            {data.map((item, index) => {
              const date = new Date(item.time)
              const timeLabel = timeRange === '1d' 
                ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
              
              const requestsPercentage = (item.requests / maxRequests) * 100
              const usersPercentage = (item.uniqueUsers / maxUsers) * 100
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{timeLabel}</span>
                    <span>请求: {item.requests} | 用户: {item.uniqueUsers}</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div 
                      className="absolute left-0 top-0 h-4 bg-blue-500 rounded-t"
                      style={{ width: `${requestsPercentage}%` }}
                    ></div>
                    <div 
                      className="absolute left-0 bottom-0 h-4 bg-purple-500 rounded-b"
                      style={{ width: `${usersPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 简化的路由流量图表
interface RouteTrafficData {
  name: string
  path: string
  requests: number
  percentage: number
  status: 'active' | 'inactive'
}

interface SimpleRouteChartProps {
  data: RouteTrafficData[]
}

export function SimpleRouteChart({ data }: SimpleRouteChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>路由流量分布</CardTitle>
          <CardDescription>各路由的访问量对比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests))

  return (
    <Card>
      <CardHeader>
        <CardTitle>路由流量分布</CardTitle>
        <CardDescription>各路由的访问量对比</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 10).map((route, index) => {
            const percentage = (route.requests / maxRequests) * 100
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{route.name}</span>
                    <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                      {route.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">{route.requests} 请求</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">{route.path}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// 简化的指标卡片
interface SimpleMetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'stable'
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export function SimpleMetricCard({ 
  title, 
  value, 
  description, 
  trend = 'stable',
  color = 'blue' 
}: SimpleMetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 border-blue-200 bg-blue-50',
    green: 'text-green-600 border-green-200 bg-green-50',
    red: 'text-red-600 border-red-200 bg-red-50',
    yellow: 'text-yellow-600 border-yellow-200 bg-yellow-50'
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '➡️'
  }

  return (
    <Card className={`border-l-4 ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <span className="text-2xl">{trendIcons[trend]}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// 状态码分布图表
interface StatusCodeData {
  category: string
  count: number
  percentage: number
  color: string
}

interface SimpleStatusChartProps {
  data: StatusCodeData[]
}

export function SimpleStatusChart({ data }: SimpleStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>HTTP状态码分布</CardTitle>
          <CardDescription>响应状态码统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-500">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HTTP状态码分布</CardTitle>
        <CardDescription>响应状态码统计</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const colorMap: Record<string, string> = {
              emerald: 'bg-green-500',
              blue: 'bg-blue-500',
              yellow: 'bg-yellow-500',
              red: 'bg-red-500'
            }
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colorMap[item.color] || 'bg-gray-500'} transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// 简化的仪表板
interface SimpleDashboardProps {
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

export function SimpleDashboard({
  trafficData,
  routeTrafficData,
  statusCodeData,
  timeRange,
  metrics
}: SimpleDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 关键指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SimpleMetricCard
          title="总请求数"
          value={Intl.NumberFormat('zh-CN').format(metrics.totalRequests)}
          color="blue"
          trend="up"
        />
        <SimpleMetricCard
          title="独立用户"
          value={Intl.NumberFormat('zh-CN').format(metrics.uniqueUsers)}
          color="green"
          trend="up"
        />
        <SimpleMetricCard
          title="平均响应时间"
          value={`${metrics.avgResponseTime}ms`}
          color={metrics.avgResponseTime > 200 ? 'yellow' : 'green'}
          trend={metrics.avgResponseTime > 200 ? 'up' : 'stable'}
        />
        <SimpleMetricCard
          title="错误率"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          color={metrics.errorRate > 0.05 ? 'red' : 'green'}
          trend={metrics.errorRate > 0.05 ? 'up' : 'stable'}
        />
        <SimpleMetricCard
          title="系统可用性"
          value={metrics.uptime}
          color="green"
          trend="stable"
        />
      </div>

      {/* 图表 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleTrafficChart data={trafficData} timeRange={timeRange} />
        <SimpleStatusChart data={statusCodeData} />
      </div>
      
      <SimpleRouteChart data={routeTrafficData} />
    </div>
  )
} 