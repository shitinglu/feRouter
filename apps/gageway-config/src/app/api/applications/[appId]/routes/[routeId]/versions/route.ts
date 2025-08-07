import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取路由版本列表
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

    // 获取路由和所有版本
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        applicationId: appId
      },
      include: {
        publishedVersion: true,
        versions: {
          include: {
            redirectConfig: true,
            ossConfig: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { success: false, message: '路由不存在' },
        { status: 404 }
      )
    }

    // 获取版本创建者信息
    const userIds = [...new Set(route.versions.map(v => v.createdBy).filter(Boolean))]
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, any>)

    // 格式化版本数据
    const formattedVersions = route.versions.map(version => ({
      id: version.id,
      version: version.version,
      configType: version.configType,
      status: version.status,
      isPublished: route.publishedVersionId === version.id,
      publishedAt: version.publishedAt?.toISOString(),
      publishedBy: version.publishedBy,
      createdAt: version.createdAt.toISOString(),
      createdBy: version.createdBy,
      createdByName: userMap[version.createdBy || '']?.name || userMap[version.createdBy || '']?.email,
      baseVersionId: version.baseVersionId,
      // 配置详情
      targetUrl: version.redirectConfig?.targetUrl,
      statusCode: version.redirectConfig?.statusCode,
      bucket: version.ossConfig?.bucket,
      objectKey: version.ossConfig?.objectKey,
      region: version.ossConfig?.region,
    }))

    return NextResponse.json({
      success: true,
      data: {
        route: {
          id: route.id,
          name: route.name,
          path: route.path,
          method: route.method
        },
        versions: formattedVersions
      },
      message: '获取版本列表成功'
    })

  } catch (error) {
    console.error('获取版本列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取版本列表失败' },
      { status: 500 }
    )
  }
}