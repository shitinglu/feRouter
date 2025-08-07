'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Cpu, 
  MemoryStick, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Server,
  Database,
  Network,
  HardDrive,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

// 数据类型定义
interface SystemMetric {
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
}

interface ErrorStats {
  byType: Record<string, number>
  bySeverity: Record<string, number>
  total: number
}

interface AlertStats {
  byType: Record<string, number>
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  total: number
}

interface RecentError {
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
}

interface CriticalAlert {
  id: string
  alertType: string
  severity: string
  title: string
  description: string
  threshold?: number
  currentValue?: number
  status: string
  createdAt: string
}

// 性能概览卡片
interface PerformanceOverviewProps {
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
}

export function PerformanceOverview({ overview }: PerformanceOverviewProps) {
  const metrics = [
    {
      title: 'CPU使用率',
      value: `${overview.cpuUsage.toFixed(1)}%`,
      icon: Cpu,
      status: overview.cpuUsage > 80 ? 'warning' : overview.cpuUsage > 95 ? 'error' : 'normal'
    },
    {
      title: '内存使用率',
      value: `${overview.memoryUsage.toFixed(1)}%`,
      icon: MemoryStick,
      status: overview.memoryUsage > 80 ? 'warning' : overview.memoryUsage > 95 ? 'error' : 'normal'
    },
    {
      title: '平均响应时间',
      value: `${overview.avgResponseTime.toFixed(0)}ms`,
      icon: Clock,
      status: overview.avgResponseTime > 1000 ? 'warning' : overview.avgResponseTime > 2000 ? 'error' : 'normal'
    },
    {
      title: '系统可用性',
      value: overview.uptime,
      icon: CheckCircle,
      status: 'normal'
    },
    {
      title: '吞吐量',
      value: `${overview.throughput}/min`,
      icon: TrendingUp,
      status: 'normal'
    },
    {
      title: '错误率',
      value: `${overview.errorRate.toFixed(2)}%`,
      icon: XCircle,
      status: overview.errorRate > 5 ? 'warning' : overview.errorRate > 10 ? 'error' : 'normal'
    },
    {
      title: '活跃警报',
      value: overview.activeAlerts.toString(),
      icon: AlertTriangle,
      status: overview.activeAlerts > 0 ? 'warning' : 'normal'
    },
    {
      title: '错误总数',
      value: overview.totalErrors.toString(),
      icon: AlertCircle,
      status: overview.totalErrors > 50 ? 'warning' : 'normal'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 系统指标趋势表格
interface SystemMetricsTableProps {
  metrics: SystemMetric[]
  timeRange: string
}

export function SystemMetricsTable({ metrics, timeRange }: SystemMetricsTableProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            系统指标趋势
          </CardTitle>
          <CardDescription>
            {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}内的系统性能数据
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

  // 只显示最近的数据点
  const recentMetrics = metrics.slice(-10).reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          系统指标趋势
        </CardTitle>
        <CardDescription>
          最近10个时间点的系统性能数据
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">CPU</TableHead>
              <TableHead className="text-right">内存</TableHead>
              <TableHead className="text-right">响应时间</TableHead>
              <TableHead className="text-right">吞吐量</TableHead>
              <TableHead className="text-right">错误数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentMetrics.map((metric, index) => {
              const date = new Date(metric.time)
              const timeLabel = timeRange === '1d' 
                ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit' })
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{timeLabel}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={metric.cpuUsage > 80 ? 'destructive' : 'secondary'}>
                      {metric.cpuUsage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={metric.memoryUsage > 80 ? 'destructive' : 'secondary'}>
                      {metric.memoryUsage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={metric.responseTime > 1000 ? 'destructive' : 'secondary'}>
                      {metric.responseTime.toFixed(0)}ms
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{metric.throughput}/min</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={metric.errorCount > 0 ? 'destructive' : 'default'}>
                      {metric.errorCount}
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

// 错误统计表格
interface ErrorStatsTableProps {
  errorStats: ErrorStats
}

export function ErrorStatsTable({ errorStats }: ErrorStatsTableProps) {
  const errorTypeNames: Record<string, string> = {
    'SYSTEM': '系统错误',
    'APPLICATION': '应用错误',
    'NETWORK': '网络错误',
    'DATABASE': '数据库错误',
    'SECURITY': '安全错误',
    'VALIDATION': '验证错误',
    'TIMEOUT': '超时错误',
    'GATEWAY': '网关错误'
  }

  const severityNames: Record<string, string> = {
    'LOW': '低级',
    'MEDIUM': '中级',
    'HIGH': '高级',
    'CRITICAL': '严重'
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 按类型统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            错误类型分布
          </CardTitle>
          <CardDescription>按错误类型分类统计</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>错误类型</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(errorStats.byType).map(([type, count]) => (
                <TableRow key={type}>
                  <TableCell className="font-medium">
                    {errorTypeNames[type] || type}
                  </TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {((count / errorStats.total) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 按严重程度统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            严重程度分布
          </CardTitle>
          <CardDescription>按严重程度分类统计</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>严重程度</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
                <TableRow key={severity}>
                  <TableCell className="font-medium">
                    {severityNames[severity] || severity}
                  </TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getSeverityVariant(severity)}>
                      {((count / errorStats.total) * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 最近错误日志表格
interface RecentErrorsTableProps {
  errors: RecentError[]
}

export function RecentErrorsTable({ errors }: RecentErrorsTableProps) {
  if (!errors || errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            最近错误日志
          </CardTitle>
          <CardDescription>最近发生的错误记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            暂无错误记录
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          最近错误日志
        </CardTitle>
        <CardDescription>最近 {errors.length} 条错误记录</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>严重程度</TableHead>
              <TableHead>错误消息</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>状态码</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errors.slice(0, 10).map((error) => (
              <TableRow key={error.id}>
                <TableCell className="font-medium">
                  {new Date(error.createdAt).toLocaleString('zh-CN')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{error.errorType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityVariant(error.severity)}>
                    {error.severity}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {error.message}
                </TableCell>
                <TableCell>
                  {error.path && (
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {error.path}
                    </code>
                  )}
                </TableCell>
                <TableCell>
                  {error.statusCode && (
                    <Badge variant={error.statusCode >= 500 ? 'destructive' : 'secondary'}>
                      {error.statusCode}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 关键警报表格
interface CriticalAlertsTableProps {
  alerts: CriticalAlert[]
}

export function CriticalAlertsTable({ alerts }: CriticalAlertsTableProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            关键警报
          </CardTitle>
          <CardDescription>需要立即关注的警报</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            无关键警报
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'CRITICAL': return 'destructive'
      case 'ERROR': return 'destructive'
      case 'WARNING': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          关键警报
        </CardTitle>
        <CardDescription>{alerts.length} 个需要关注的警报</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>严重程度</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>阈值</TableHead>
              <TableHead>当前值</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">
                  {new Date(alert.createdAt).toLocaleString('zh-CN')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{alert.alertType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityVariant(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{alert.title}</TableCell>
                <TableCell>{alert.threshold || '-'}</TableCell>
                <TableCell className="font-medium text-red-600">
                  {alert.currentValue || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={alert.status === 'ACTIVE' ? 'destructive' : 'secondary'}>
                    {alert.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 性能监控仪表板
interface PerformanceDashboardProps {
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
  systemMetrics: SystemMetric[]
  errorStats: ErrorStats
  recentErrors: RecentError[]
  criticalAlerts: CriticalAlert[]
  timeRange: string
}

export function PerformanceDashboard({
  overview,
  systemMetrics,
  errorStats,
  recentErrors,
  criticalAlerts,
  timeRange
}: PerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 性能概览 */}
      <PerformanceOverview overview={overview} />
      
      {/* 系统指标趋势 */}
      <SystemMetricsTable metrics={systemMetrics} timeRange={timeRange} />
      
      {/* 错误统计 */}
      <ErrorStatsTable errorStats={errorStats} />
      
      {/* 最近错误和关键警报 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentErrorsTable errors={recentErrors} />
        <CriticalAlertsTable alerts={criticalAlerts} />
      </div>
    </div>
  )
} 