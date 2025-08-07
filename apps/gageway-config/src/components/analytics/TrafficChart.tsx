'use client'

import { 
  AreaChart, 
  BarChart,
  DonutChart,
  LineChart,
  Card,
  Title,
  Text,
  Flex,
  Badge,
  Metric,
  CategoryBar,
  ProgressBar
} from '@tremor/react'

// 流量趋势图表
interface TrafficData {
  time: string
  requests: number
  uniqueUsers: number
  avgResponseTime: number
}

interface TrafficChartProps {
  data: TrafficData[]
  timeRange: string
}

export function TrafficTrendChart({ data, timeRange }: TrafficChartProps) {
  const formatTime = (time: string) => {
    const date = new Date(time)
    if (timeRange === '1d') {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const chartData = data.map(item => ({
    ...item,
    time: formatTime(item.time),
    '请求数': item.requests,
    '独立用户': item.uniqueUsers,
    '响应时间(ms)': item.avgResponseTime
  }))

  return (
    <Card className="p-6">
      <Title>流量趋势分析</Title>
      <Text>
        {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的访问趋势
      </Text>
      <AreaChart
        className="h-80 mt-6"
        data={chartData}
        index="time"
        categories={['请求数', '独立用户']}
        colors={['blue', 'violet']}
        valueFormatter={(number: number) => 
          `${Intl.NumberFormat('zh-CN').format(number).toString()}`
        }
        showLegend={true}
        showGridLines={true}
        curveType="natural"
      />
    </Card>
  )
}

// 路由流量分布图表
interface RouteTrafficData {
  name: string
  path: string
  requests: number
  percentage: number
  status: 'active' | 'inactive'
}

interface RouteTrafficChartProps {
  data: RouteTrafficData[]
}

export function RouteTrafficChart({ data }: RouteTrafficChartProps) {
  const chartData = data.map(item => ({
    name: `${item.name} (${item.path})`,
    '请求数': item.requests,
    '占比': item.percentage
  }))

  const donutData = data.slice(0, 5).map(item => ({
    name: item.name,
    value: item.requests,
    share: `${item.percentage.toFixed(1)}%`
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 路由请求数柱状图 */}
      <Card className="p-6">
        <Title>路由请求分布</Title>
        <Text>各路由的访问量对比</Text>
        <BarChart
          className="h-80 mt-6"
          data={chartData}
          index="name"
          categories={['请求数']}
          colors={['blue']}
          valueFormatter={(number: number) => 
            `${Intl.NumberFormat('zh-CN').format(number).toString()}`
          }
          layout="vertical"
          showGridLines={false}
        />
      </Card>

      {/* 路由占比环形图 */}
      <Card className="p-6">
        <Title>流量占比分析</Title>
        <Text>Top 5 路由流量占比</Text>
        <DonutChart
          className="h-80 mt-6"
          data={donutData}
          category="value"
          index="name"
          valueFormatter={(number: number) => 
            `${Intl.NumberFormat('zh-CN').format(number).toString()}`
          }
          colors={['blue', 'violet', 'indigo', 'rose', 'cyan']}
          showLabel={true}
          showAnimation={true}
        />
      </Card>
    </div>
  )
}

// 性能分析图表
interface PerformanceData {
  time: string
  avgResponseTime: number
  p95ResponseTime: number
  errorRate: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
  timeRange: string
}

export function PerformanceChart({ data, timeRange }: PerformanceChartProps) {
  const formatTime = (time: string) => {
    const date = new Date(time)
    if (timeRange === '1d') {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const chartData = data.map(item => ({
    ...item,
    time: formatTime(item.time),
    '平均响应时间': item.avgResponseTime,
    'P95响应时间': item.p95ResponseTime,
    '错误率(%)': item.errorRate * 100
  }))

  return (
    <Card className="p-6">
      <Title>性能分析</Title>
      <Text>响应时间和错误率趋势</Text>
      <LineChart
        className="h-80 mt-6"
        data={chartData}
        index="time"
        categories={['平均响应时间', 'P95响应时间']}
        colors={['emerald', 'red']}
        valueFormatter={(number: number) => `${number.toFixed(1)}ms`}
        showLegend={true}
        showGridLines={true}
        connectNulls={true}
      />
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

interface StatusCodeChartProps {
  data: StatusCodeData[]
}

export function StatusCodeChart({ data }: StatusCodeChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <Card className="p-6">
      <Title>HTTP状态码分布</Title>
      <Text>响应状态码统计分析</Text>
      
      <div className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.category}>
            <Flex>
              <Text className="font-medium">{item.category}</Text>
              <Flex className="space-x-2">
                <Text>{Intl.NumberFormat('zh-CN').format(item.count)}</Text>
                <Badge color={item.color as any}>
                  {item.percentage.toFixed(1)}%
                </Badge>
              </Flex>
            </Flex>
            <ProgressBar 
              value={item.percentage} 
              color={item.color as any}
              className="mt-2"
            />
          </div>
        ))}
      </div>

      {/* 饼图展示 */}
      <DonutChart
        className="h-60 mt-6"
        data={data.map(item => ({
          name: item.category,
          value: item.count,
          share: `${item.percentage.toFixed(1)}%`
        }))}
        category="value"
        index="name"
        valueFormatter={(number: number) => 
          `${Intl.NumberFormat('zh-CN').format(number).toString()}`
        }
        colors={data.map(item => item.color) as any}
        showLabel={true}
        showAnimation={true}
      />
    </Card>
  )
}

// 实时指标卡片
interface MetricCardProps {
  title: string
  metric: string | number
  delta?: string
  deltaType?: 'increase' | 'decrease' | 'unchanged'
  color?: 'blue' | 'emerald' | 'red' | 'yellow' | 'violet'
}

export function MetricCard({ 
  title, 
  metric, 
  delta, 
  deltaType = 'unchanged',
  color = 'blue' 
}: MetricCardProps) {
  return (
    <Card className="p-6">
      <Flex alignItems="start">
        <div>
          <Text>{title}</Text>
          <Metric color={color}>{metric}</Metric>
        </div>
        {delta && (
          <Badge 
            color={
              deltaType === 'increase' ? 'emerald' : 
              deltaType === 'decrease' ? 'red' : 'gray'
            }
            size="xs"
          >
            {deltaType === 'increase' ? '+' : deltaType === 'decrease' ? '-' : ''}
            {delta}
          </Badge>
        )}
      </Flex>
    </Card>
  )
}

// 综合仪表板组件
interface DashboardProps {
  trafficData: TrafficData[]
  routeTrafficData: RouteTrafficData[]
  performanceData: PerformanceData[]
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

export function AnalyticsDashboard({
  trafficData,
  routeTrafficData,
  performanceData,
  statusCodeData,
  timeRange,
  metrics
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="总请求数"
          metric={Intl.NumberFormat('zh-CN').format(metrics.totalRequests)}
          color="blue"
        />
        <MetricCard
          title="独立用户"
          metric={Intl.NumberFormat('zh-CN').format(metrics.uniqueUsers)}
          color="violet"
        />
        <MetricCard
          title="平均响应时间"
          metric={`${metrics.avgResponseTime}ms`}
          color="emerald"
        />
        <MetricCard
          title="错误率"
          metric={`${(metrics.errorRate * 100).toFixed(2)}%`}
          color={metrics.errorRate > 0.05 ? 'red' : 'emerald'}
        />
        <MetricCard
          title="系统可用性"
          metric={metrics.uptime}
          color="emerald"
        />
      </div>

      {/* 流量趋势图 */}
      <TrafficTrendChart data={trafficData} timeRange={timeRange} />

      {/* 路由分析图表 */}
      <RouteTrafficChart data={routeTrafficData} />

      {/* 性能和状态码分析 */}
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceChart data={performanceData} timeRange={timeRange} />
        <StatusCodeChart data={statusCodeData} />
      </div>
    </div>
  )
} 