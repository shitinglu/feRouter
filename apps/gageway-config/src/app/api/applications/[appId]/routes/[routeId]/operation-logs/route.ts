import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取路由操作记录
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string; routeId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { appId, routeId } = await params;

    // 检查用户权限
    const permission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'READ' }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限访问该应用' },
        { status: 403 }
      )
    }

    // 获取操作记录
    const operationLogs = await prisma.auditLog.findMany({
      where: {
        applicationId: appId,
        resourceId: routeId,
        resource: 'route'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 格式化返回数据
    const formattedLogs = operationLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      createdBy: log.userId,
      createdByName: log.user?.name || log.user?.email || 'Unknown',
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }))

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      message: '获取操作记录成功'
    })

  } catch (error) {
    console.error('获取操作记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取操作记录失败' },
      { status: 500 }
    )
  }
} 