import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'

// 获取应用性能监控数据
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      )
    }

    const { appId } = params
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'

    // 检查应用权限
    const permission = await prisma.appPermission.findFirst({
      where: {
        applicationId: appId,
        userId: session.user.id!,
      },
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '没有权限访问此应用' },
        { status: 403 }
      )
    }

    // 获取应用信息
    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        _count: {
          select: {
            routes: true,
            analytics: true,
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: '应用不存在' },
        { status: 404 }
      )
    }

    // 生成模拟性能监控数据
    const systemMetrics = generateMockSystemMetrics(appId, timeRange)
    const errorStats = generateMockErrorStats()
    const alertStats = generateMockAlertStats()
    const recentErrors = generateMockRecentErrors()
    const criticalAlerts = generateMockCriticalAlerts()

    // 计算性能摘要
    const latestMetrics = systemMetrics[systemMetrics.length - 1] || {
      cpuUsage: 0,
      memoryUsage: 0,
      responseTime: 0,
      errorCount: 0,
      throughput: 0
    }

    const performance = {
      overview: {
        cpuUsage: latestMetrics.cpuUsage,
        memoryUsage: latestMetrics.memoryUsage,
        avgResponseTime: latestMetrics.responseTime,
        uptime: calculateUptime(systemMetrics),
        throughput: latestMetrics.throughput,
        errorRate: calculateErrorRate(systemMetrics),
        activeAlerts: criticalAlerts.length,
        totalErrors: errorStats.total
      },
      systemMetrics,
      errorStats,
      alertStats,
      recentErrors,
      criticalAlerts,
      // 性能趋势数据
      trends: {
        cpu: systemMetrics.map(m => ({ time: m.time, value: m.cpuUsage })),
        memory: systemMetrics.map(m => ({ time: m.time, value: m.memoryUsage })),
        responseTime: systemMetrics.map(m => ({ time: m.time, value: m.responseTime })),
        throughput: systemMetrics.map(m => ({ time: m.time, value: m.throughput })),
        errors: systemMetrics.map(m => ({ time: m.time, value: m.errorCount }))
      }
    }

    return NextResponse.json({
      success: true,
      data: performance,
      message: '获取性能监控数据成功'
    })

  } catch (error) {
    console.error('获取性能监控数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取性能监控数据失败' },
      { status: 500 }
    )
  }
}

// 生成模拟系统指标数据
function generateMockSystemMetrics(appId: string, timeRange: string) {
  const now = new Date()
  const dataPoints = timeRange === '1d' ? 24 : timeRange === '7d' ? 7 * 24 : 30 * 24
  const interval = 60 * 60 * 1000 // 1小时间隔
  
  const data = []
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval)
    
    // 模拟一些波动的性能数据
    const baseLoad = 30 + Math.sin((i / dataPoints) * Math.PI * 2) * 20
    const noise = Math.random() * 10 - 5
    
    data.push({
      time: time.toISOString(),
      cpuUsage: Math.max(0, Math.min(100, baseLoad + noise)),
      memoryUsage: Math.max(0, Math.min(100, baseLoad + noise + 10)),
      diskUsage: Math.max(0, Math.min(100, 45 + noise)),
      networkIn: Math.max(0, 5 + Math.random() * 10),
      networkOut: Math.max(0, 3 + Math.random() * 8),
      responseTime: Math.max(50, 150 + noise * 5),
      throughput: Math.max(0, Math.floor(100 + noise * 20)),
      errorCount: Math.max(0, Math.floor(Math.random() * 5)),
      activeUsers: Math.max(0, Math.floor(50 + noise * 10)),
      dbConnections: Math.max(0, Math.floor(10 + noise)),
      dbQueryTime: Math.max(1, 25 + noise * 2)
    })
  }
  
  return data
}

// 生成模拟错误统计
function generateMockErrorStats() {
  return {
    byType: {
      'SYSTEM': 15,
      'APPLICATION': 28,
      'NETWORK': 5,
      'DATABASE': 12,
      'SECURITY': 2,
      'VALIDATION': 18,
      'TIMEOUT': 7,
      'GATEWAY': 4
    },
    bySeverity: {
      'LOW': 45,
      'MEDIUM': 32,
      'HIGH': 12,
      'CRITICAL': 2
    },
    total: 91
  }
}

// 生成模拟警报统计
function generateMockAlertStats() {
  return {
    byType: {
      'CPU_HIGH': 3,
      'MEMORY_HIGH': 2,
      'RESPONSE_SLOW': 5,
      'ERROR_RATE_HIGH': 1,
      'DB_SLOW': 2
    },
    bySeverity: {
      'INFO': 5,
      'WARNING': 6,
      'ERROR': 2,
      'CRITICAL': 0
    },
    byStatus: {
      'ACTIVE': 4,
      'ACKNOWLEDGED': 7,
      'RESOLVED': 2
    },
    total: 13
  }
}

// 生成模拟最近错误
function generateMockRecentErrors() {
  const now = new Date()
  const errors = []
  
  for (let i = 0; i < 20; i++) {
    const time = new Date(now.getTime() - i * 30 * 60 * 1000) // 每30分钟一个错误
    errors.push({
      id: `error_${i}`,
      errorType: ['SYSTEM', 'APPLICATION', 'NETWORK', 'DATABASE'][Math.floor(Math.random() * 4)],
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
      message: `模拟错误消息 ${i + 1}`,
      method: 'GET',
      path: `/api/route/${i}`,
      statusCode: [400, 404, 500, 502][Math.floor(Math.random() * 4)],
      ip: `192.168.1.${100 + i}`,
      createdAt: time.toISOString(),
      route: {
        name: `路由 ${i + 1}`,
        path: `/route/${i}`
      }
    })
  }
  
  return errors
}

// 生成模拟关键警报
function generateMockCriticalAlerts() {
  const now = new Date()
  const alerts = []
  
  for (let i = 0; i < 3; i++) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000) // 每小时一个警报
    alerts.push({
      id: `alert_${i}`,
      alertType: ['CPU_HIGH', 'MEMORY_HIGH', 'RESPONSE_SLOW'][i],
      severity: ['ERROR', 'CRITICAL', 'WARNING'][i],
      title: `关键警报 ${i + 1}`,
      description: `这是一个模拟的关键警报描述 ${i + 1}`,
      threshold: [80, 90, 2000][i],
      currentValue: [85, 95, 2500][i],
      status: 'ACTIVE',
      createdAt: time.toISOString()
    })
  }
  
  return alerts
}

// 计算系统可用性
function calculateUptime(metrics: any[]) {
  if (metrics.length === 0) return '99.9%'
  
  // 简单计算：假设CPU < 95%且响应时间 < 2000ms为可用
  const availableCount = metrics.filter(m => 
    m.cpuUsage < 95 && m.responseTime < 2000
  ).length
  
  const uptime = (availableCount / metrics.length) * 100
  return `${uptime.toFixed(1)}%`
}

// 计算错误率
function calculateErrorRate(metrics: any[]) {
  if (metrics.length === 0) return 0
  
  const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0)
  const totalRequests = metrics.reduce((sum, m) => sum + m.throughput, 0)
  
  if (totalRequests === 0) return 0
  return (totalErrors / totalRequests) * 100
} 