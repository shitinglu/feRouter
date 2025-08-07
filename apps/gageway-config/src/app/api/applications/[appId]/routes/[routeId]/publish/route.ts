import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 发布路由配置
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
        { success: false, message: '无权限发布路由' },
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
        publishedVersion: true,
        versions: {
          where: { status: 'DRAFT' },
          include: {
            redirectConfig: true,
            ossConfig: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { success: false, message: '路由不存在' },
        { status: 404 }
      )
    }

    // 检查是否有草稿版本可以发布
    const draftVersion = route.versions[0]
    if (!draftVersion) {
      return NextResponse.json(
        { success: false, message: '没有草稿版本可以发布' },
        { status: 400 }
      )
    }

    // 执行发布操作
    const result = await prisma.$transaction(async (tx) => {
      // 如果之前有发布版本，先将其状态改为 INACTIVE
      if (route.publishedVersion) {
        await tx.routeVersion.update({
          where: { id: route.publishedVersion.id },
          data: {
            status: 'INACTIVE',
            publishedAt: null,
            publishedBy: null
          }
        })
      }

      // 将草稿版本发布
      const publishedVersion = await tx.routeVersion.update({
        where: { id: draftVersion.id },
        data: {
          status: 'ACTIVE',
          publishedAt: new Date(),
          publishedBy: session.user!.id
        },
        include: {
          redirectConfig: true,
          ossConfig: true
        }
      })

      // 更新路由的发布版本指针
      const updatedRoute = await tx.route.update({
        where: { id: routeId },
        data: {
          publishedVersionId: publishedVersion.id
        }
      })

      // 创建版本记录
      await tx.configVersion.create({
        data: {
          applicationId: appId,
          routeId: routeId,
          versionId: publishedVersion.id,
          version: publishedVersion.version,
          action: 'DEPLOY',
          description: `发布路由配置版本 ${publishedVersion.version}`,
          configData: {
            version: publishedVersion.version,
            configType: publishedVersion.configType,
            redirectConfig: publishedVersion.redirectConfig,
            ossConfig: publishedVersion.ossConfig
          },
          createdBy: session.user!.id
        }
      })

      // 记录操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: appId,
          action: 'PUBLISH_ROUTE',
          resource: 'route',
          resourceId: routeId,
          details: {
            routeName: route.name,
            version: publishedVersion.version,
            publishedAt: new Date().toISOString()
          }
        }
      })

      return { route: updatedRoute, version: publishedVersion }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: `路由版本 ${result.version.version} 发布成功`
    })

  } catch (error) {
    console.error('发布路由失败:', error)
    return NextResponse.json(
      { success: false, message: '发布路由失败' },
      { status: 500 }
    )
  }
}
