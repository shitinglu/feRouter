import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 切换路由状态
export async function PATCH(
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
    const { status } = await request.json();

    // 检查用户权限
    const permission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'DEPLOY' }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限修改路由状态' },
        { status: 403 }
      )
    }

    // 获取路由信息
    const route = await prisma.route.findFirst({
      where: { id: routeId, applicationId: appId }
    })

    if (!route) {
      return NextResponse.json(
        { success: false, message: '路由不存在' },
        { status: 404 }
      )
    }

    // 更新路由状态
    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: { status },
    })

    // 记录操作日志
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        applicationId: appId,
        action: status === 'ACTIVE' ? 'ENABLE_ROUTE' : 'DISABLE_ROUTE',
        resource: 'route',
        resourceId: routeId,
        details: {
          routeName: route.name,
          previousStatus: route.status,
          newStatus: status,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRoute,
      message: `路由${status === 'ACTIVE' ? '启用' : '停用'}成功`
    })

  } catch (error) {
    console.error('修改路由状态失败:', error)
    return NextResponse.json(
      { success: false, message: '修改路由状态失败' },
      { status: 500 }
    )
  }
} 