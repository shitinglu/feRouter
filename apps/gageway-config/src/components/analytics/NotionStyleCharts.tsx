'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Notion风格的流量趋势图表
interface TrafficData {
  time: string
  requests: number
  uniqueUsers: number
  avgResponseTime: number
}

interface NotionTrafficChartProps {
  data: TrafficData[]
  timeRange: string
}

export function NotionTrafficChart({ data, timeRange }: NotionTrafficChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 流量趋势分析</h3>
        <p className="text-sm text-gray-600 mb-4">
          {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
        </p>
        <div className="flex items-center justify-center h-32 text-gray-400">
          暂无数据
        </div>
      </div>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests))
  const maxUsers = Math.max(...data.map(d => d.uniqueUsers))

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📈</span>
        <h3 className="text-lg font-semibold text-gray-900">流量趋势分析</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
      </p>
      
      {/* Notion风格图例 */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium text-gray-700">请求数</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm font-medium text-gray-700">独立用户</span>
        </div>
      </div>
      
      {/* Notion风格数据展示 */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const date = new Date(item.time)
          const timeLabel = timeRange === '1d' 
            ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
          
          const requestsPercentage = (item.requests / maxRequests) * 100
          const usersPercentage = (item.uniqueUsers / maxUsers) * 100
          
          return (
            <div key={index} className="group hover:bg-gray-50 rounded-md p-3 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{timeLabel}</span>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>📊 {item.requests.toLocaleString()}</span>
                  <span>👥 {item.uniqueUsers.toLocaleString()}</span>
                  <span>⚡ {item.avgResponseTime}ms</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${requestsPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">{requestsPercentage.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${usersPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">{usersPercentage.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Notion风格路由流量表格
interface RouteTrafficData {
  name: string
  path: string
  requests: number
  percentage: number
  status: 'active' | 'inactive'
}

interface NotionRouteTableProps {
  data: RouteTrafficData[]
}

export function NotionRouteTable({ data }: NotionRouteTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🚦 路由流量分布</h3>
        <p className="text-sm text-gray-600 mb-4">各路由的访问量统计</p>
        <div className="flex items-center justify-center h-32 text-gray-400">
          暂无数据
        </div>
      </div>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests))

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* 表格头部 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🚦</span>
          <h3 className="text-lg font-semibold text-gray-900">路由流量分布</h3>
        </div>
        <p className="text-sm text-gray-600">各路由的访问量统计</p>
      </div>

      {/* Notion风格表格 */}
      <div className="divide-y divide-gray-100">
        {/* 表头 */}
        <div className="px-6 py-3 bg-gray-50 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">路由名称</div>
          <div className="col-span-3">路径</div>
          <div className="col-span-2">请求数</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">占比</div>
        </div>

        {/* 表格数据 */}
        {data.slice(0, 10).map((route, index) => {
          const percentage = (route.requests / maxRequests) * 100
          
          return (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors grid grid-cols-12 gap-4 items-center">
              {/* 序号 */}
              <div className="col-span-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              
              {/* 路由名称 */}
              <div className="col-span-4">
                <span className="font-medium text-gray-900">{route.name}</span>
              </div>
              
              {/* 路径 */}
              <div className="col-span-3">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                  {route.path}
                </code>
              </div>
              
              {/* 请求数 */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {route.requests.toLocaleString()}
                  </span>
                  <div className="flex-1 max-w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 状态 */}
              <div className="col-span-1">
                <Badge 
                  variant={route.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {route.status === 'active' ? '🟢' : '🔴'}
                </Badge>
              </div>
              
              {/* 占比 */}
              <div className="col-span-1">
                <span className="text-sm font-medium text-gray-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Notion风格指标卡片
interface NotionMetricCardProps {
  icon: string
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

export function NotionMetricCard({ 
  icon,
  title, 
  value, 
  description, 
  trend,
  color = 'blue' 
}: NotionMetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50'
  }

  const valueColorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    purple: 'text-purple-700'
  }

  return (
    <div className={`bg-white rounded-lg border-2 ${colorClasses[color]} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend.type === 'positive' ? 'bg-green-100 text-green-700' :
            trend.type === 'negative' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {trend.type === 'positive' ? '↗️' : trend.type === 'negative' ? '↘️' : '➡️'} {trend.value}
          </div>
        )}
      </div>
      
      <div className={`text-2xl font-bold ${valueColorClasses[color]} mb-1`}>
        {value}
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  )
}

// Notion风格状态码分布
interface StatusCodeData {
  category: string
  count: number
  percentage: number
  color: string
}

interface NotionStatusChartProps {
  data: StatusCodeData[]
}

export function NotionStatusChart({ data }: NotionStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 HTTP状态码分布</h3>
        <p className="text-sm text-gray-600 mb-4">响应状态码统计</p>
        <div className="flex items-center justify-center h-32 text-gray-400">
          暂无数据
        </div>
      </div>
    )
  }

  const iconMap: Record<string, string> = {
    '2xx 成功': '✅',
    '3xx 重定向': '🔄',
    '4xx 客户端错误': '⚠️',
    '5xx 服务端错误': '❌'
  }

  const colorMap: Record<string, string> = {
    emerald: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-lg font-semibold text-gray-900">HTTP状态码分布</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">响应状态码统计</p>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group hover:bg-gray-50 rounded-lg p-3 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{iconMap[item.category] || '📈'}</span>
                <span className="font-medium text-gray-900">{item.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {item.count.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colorMap[item.color] || 'bg-gray-500'} rounded-full transition-all duration-500 group-hover:opacity-80`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Notion风格综合仪表板
interface NotionDashboardProps {
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

export function NotionDashboard({
  trafficData,
  routeTrafficData,
  statusCodeData,
  timeRange,
  metrics
}: NotionDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Notion风格标题区域 */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 数据分析仪表板</h1>
        <p className="text-gray-600">实时监控您的应用性能和用户行为</p>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <NotionMetricCard
          icon="📊"
          title="总请求数"
          value={metrics.totalRequests.toLocaleString()}
          description="累计请求量"
          trend={{ value: '+12%', type: 'positive' }}
          color="blue"
        />
        <NotionMetricCard
          icon="👥"
          title="独立用户"
          value={metrics.uniqueUsers.toLocaleString()}
          description="活跃用户数"
          trend={{ value: '+8%', type: 'positive' }}
          color="purple"
        />
        <NotionMetricCard
          icon="⚡"
          title="响应时间"
          value={`${metrics.avgResponseTime}ms`}
          description="平均响应延迟"
          trend={{ 
            value: metrics.avgResponseTime > 200 ? '+15ms' : '-5ms', 
            type: metrics.avgResponseTime > 200 ? 'negative' : 'positive' 
          }}
          color={metrics.avgResponseTime > 200 ? 'yellow' : 'green'}
        />
        <NotionMetricCard
          icon="🔥"
          title="错误率"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          description="请求失败比例"
          trend={{ 
            value: metrics.errorRate > 0.05 ? '+0.1%' : '-0.1%', 
            type: metrics.errorRate > 0.05 ? 'negative' : 'positive' 
          }}
          color={metrics.errorRate > 0.05 ? 'red' : 'green'}
        />
        <NotionMetricCard
          icon="🚀"
          title="系统可用性"
          value={metrics.uptime}
          description="服务稳定性"
          trend={{ value: '稳定', type: 'positive' }}
          color="green"
        />
      </div>

      {/* 主要图表区域 */}
      <div className="grid gap-8 lg:grid-cols-2">
        <NotionTrafficChart data={trafficData} timeRange={timeRange} />
        <NotionStatusChart data={statusCodeData} />
      </div>
      
      {/* 路由流量表格 */}
      <NotionRouteTable data={routeTrafficData} />
    </div>
  )
} 