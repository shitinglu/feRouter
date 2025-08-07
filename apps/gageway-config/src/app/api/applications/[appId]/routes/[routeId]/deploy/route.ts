import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 上线路由
export async function POST(
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
        permissions: { has: 'DEPLOY' }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限上线路由' },
        { status: 403 }
      )
    }

    // 检查路由是否存在
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        applicationId: appId
      },
      include: {
        publishedVersion: true
      }
    })

    if (!route || !route.publishedVersion) {
      return NextResponse.json(
        { success: false, message: '路由不存在或没有发布版本' },
        { status: 404 }
      )
    }

    // 执行上线操作
    const result = await prisma.$transaction(async (tx) => {
      // 更新版本状态
      const updatedVersion = await tx.routeVersion.update({
        where: { id: route.publishedVersion!.id },
        data: {
          status: 'ACTIVE'
        }
      })

      // 创建版本记录
      await tx.configVersion.create({
        data: {
          applicationId: appId,
          routeId: routeId,
          versionId: route.publishedVersion!.id,
          version: route.publishedVersion!.version,
          action: 'DEPLOY',
          description: `上线路由 - ${route.name}`,
          configData: {
            action: 'deploy',
            previousStatus: route.publishedVersion!.status,
            newStatus: 'ACTIVE'
          },
          createdBy: session.user!.id
        }
      })

      // 记录操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: appId,
          action: 'DEPLOY_ROUTE',
          resource: 'route',
          resourceId: routeId,
          details: {
            routeName: route.name,
            version: route.publishedVersion!.version,
            previousStatus: route.publishedVersion!.status,
            newStatus: 'ACTIVE'
          }
        }
      })

      return updatedVersion
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: '路由上线成功'
    })

  } catch (error) {
    console.error('上线路由失败:', error)
    return NextResponse.json(
      { success: false, message: '上线路由失败' },
      { status: 500 }
    )
  }
} 