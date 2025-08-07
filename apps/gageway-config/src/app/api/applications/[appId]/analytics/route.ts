import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取应用数据分析
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { appId } = await params;
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d' // 默认7天

    // 检查用户权限
    const userPermission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'READ' }
      }
    })

    if (!userPermission) {
      return NextResponse.json(
        { success: false, message: '无权限查看分析数据' },
        { status: 403 }
      )
    }

    // 计算时间范围
    const now = new Date()
    const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    const dateFilter = {
      createdAt: { gte: startDate }
    }

    // 获取应用基础信息和统计
    const [
      application,
      routeStats,
      operationLogs,
      versionStats
    ] = await Promise.all([
      // 应用基础信息
      prisma.application.findUnique({
        where: { id: appId },
        include: {
          _count: {
            select: {
              routes: true,
              permissions: true
            }
          }
        }
      }),
      
      // 路由统计
      prisma.route.findMany({
        where: { applicationId: appId },
        include: {
          publishedVersion: {
            select: { 
              status: true, 
              configType: true,
              publishedAt: true 
            }
          },
          _count: {
            select: { versions: true }
          }
        }
      }),
      
      // 最近操作日志
      prisma.auditLog.findMany({
        where: { 
          applicationId: appId,
          ...dateFilter
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      
      // 版本统计
      prisma.configVersion.findMany({
        where: { 
          applicationId: appId,
          ...dateFilter
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    if (!application) {
      return NextResponse.json(
        { success: false, message: '应用不存在' },
        { status: 404 }
      )
    }

    // 分析路由状态分布
    const routeStatusStats = {
      active: 0,
      inactive: 0,
      total: routeStats.length
    }
    
    const configTypeStats = {
      redirect: 0,
      oss: 0,
      draft: 0
    }

    routeStats.forEach(route => {
      if (route.status === 'ACTIVE') {
        routeStatusStats.active++
      } else {
        routeStatusStats.inactive++
      }
      
      if (route.publishedVersion?.configType === 'REDIRECT') {
        configTypeStats.redirect++
      } else if (route.publishedVersion?.configType === 'OSS') {
        configTypeStats.oss++
      } else {
        configTypeStats.draft++
      }
    })

    // 操作类型统计
    const operationStats: Record<string, number> = {}
    operationLogs.forEach(log => {
      operationStats[log.action] = (operationStats[log.action] || 0) + 1
    })

    // 最活跃的路由（基于版本数量）
    const topRoutes = routeStats
      .map(route => ({
        id: route.id,
        name: route.name,
        path: route.path,
        method: route.method,
        versionCount: route._count.versions,
        status: route.status,
        configType: route.publishedVersion?.configType || 'DRAFT',
        lastPublished: route.publishedVersion?.publishedAt
      }))
      .sort((a, b) => b.versionCount - a.versionCount)
      .slice(0, 10)

    // 生成模拟的图表数据（实际项目中应该从真实数据库获取）
    const generateChartData = () => {
      const now = new Date()
      const data = []
      const dataPoints = timeRange === '1d' ? 24 : timeRange === '7d' ? 7 : 30
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(now)
        if (timeRange === '1d') {
          time.setHours(time.getHours() - i)
        } else {
          time.setDate(time.getDate() - i)
        }
        
        data.push({
          time: time.toISOString(),
          requests: Math.floor(Math.random() * 1000) + 100,
          uniqueUsers: Math.floor(Math.random() * 200) + 20,
          avgResponseTime: Math.floor(Math.random() * 200) + 50,
          p95ResponseTime: Math.floor(Math.random() * 500) + 100,
          errorRate: Math.random() * 0.05
        })
      }
      return data
    }

    const chartData = generateChartData()

    // 路由流量数据（模拟）
    const routeTrafficData = topRoutes.map((route, index) => ({
      name: route.name,
      path: route.path,
      requests: Math.floor(Math.random() * 5000) + 500,
      percentage: Math.random() * 30 + 5,
      status: route.status.toLowerCase() as 'active' | 'inactive'
    }))

    // 状态码数据（模拟数据，实际应该从请求日志获取）
    const statusCodeData = [
      {
        category: '2xx 成功',
        count: Math.floor(operationLogs.length * 0.85),
        percentage: 85,
        color: 'emerald'
      },
      {
        category: '3xx 重定向',
        count: Math.floor(operationLogs.length * 0.10),
        percentage: 10,
        color: 'blue'
      },
      {
        category: '4xx 客户端错误',
        count: Math.floor(operationLogs.length * 0.04),
        percentage: 4,
        color: 'yellow'
      },
      {
        category: '5xx 服务端错误',
        count: Math.floor(operationLogs.length * 0.01),
        percentage: 1,
        color: 'red'
      }
    ].filter(item => item.count > 0)

    const analytics = {
      overview: {
        totalRoutes: routeStats.length,
        activeRoutes: routeStatusStats.active,
        totalOperations: operationLogs.length,
        totalUsers: application._count.permissions,
        uptime: '99.9%' // 这个需要从实际监控数据获取
      },
      routeStats: {
        statusDistribution: routeStatusStats,
        configTypeDistribution: configTypeStats
      },
      operationStats,
      topRoutes,
      // 新增图表数据
      chartData: {
        trafficData: chartData,
        routeTrafficData,
        performanceData: chartData,
        statusCodeData
      },
      // 详细指标数据
      metrics: {
        totalRequests: chartData.reduce((sum, item) => sum + item.requests, 0),
        uniqueUsers: chartData.reduce((sum, item) => sum + item.uniqueUsers, 0),
        avgResponseTime: Math.round(
          chartData.reduce((sum, item) => sum + item.avgResponseTime, 0) / chartData.length
        ),
        errorRate: chartData.reduce((sum, item) => sum + item.errorRate, 0) / chartData.length,
        uptime: '99.9%'
      },
      recentActivity: operationLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        userName: log.user.name || log.user.email,
        createdAt: log.createdAt,
        details: log.details
      })),
      versionHistory: versionStats.map(version => ({
        id: version.id,
        version: version.version,
        action: version.action,
        description: version.description,
        createdAt: version.createdAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      message: '获取分析数据成功'
    })

  } catch (error) {
    console.error('获取分析数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取分析数据失败' },
      { status: 500 }
    )
  }
} 