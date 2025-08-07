import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取单个路由详情
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

    // 获取路由详情
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        applicationId: appId
      },
      include: {
        publishedVersion: {
          include: {
            redirectConfig: true,
            ossConfig: true
          }
        },
        versions: {
          include: {
            redirectConfig: true,
            ossConfig: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { success: false, message: '路由不存在' },
        { status: 404 }
      )
    }

    // 获取当前激活的版本（发布版本优先，否则最新版本）
    const activeVersion = route.publishedVersion || route.versions[0]

    if (!activeVersion) {
      return NextResponse.json(
        { success: false, message: '路由没有可用版本' },
        { status: 404 }
      )
    }

    // 格式化返回数据
    const formattedRoute = {
      id: route.id,
      name: route.name,
      path: route.path,
      method: route.method,
      configType: activeVersion.configType,
      status: activeVersion.status,
      priority: route.priority,
      version: activeVersion.version,
      publishedVersionId: route.publishedVersionId,
      publishedAt: activeVersion.publishedAt?.toISOString(),
      publishedBy: activeVersion.publishedBy,
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
      createdBy: route.createdBy,
      // 重定向配置
      targetUrl: activeVersion.redirectConfig?.targetUrl,
      statusCode: activeVersion.redirectConfig?.statusCode,
      // OSS配置
      ossBucket: activeVersion.ossConfig?.bucket,
      ossPath: activeVersion.ossConfig?.objectKey,
      region: activeVersion.ossConfig?.region,
      // 版本列表
      versions: route.versions.map(v => ({
        id: v.id,
        version: v.version,
        status: v.status,
        createdAt: v.createdAt.toISOString()
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedRoute,
      message: '获取路由详情成功'
    })

  } catch (error) {
    console.error('获取路由详情失败:', error)
    return NextResponse.json(
      { success: false, message: '获取路由详情失败' },
      { status: 500 }
    )
  }
}

// 更新路由配置 - 创建新版本
export async function PUT(
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
    const body = await request.json()

    // 检查用户权限
    const permission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'WRITE' }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限修改路由' },
        { status: 403 }
      )
    }

    // 获取当前路由和其发布版本
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        applicationId: appId
      },
      include: {
        publishedVersion: {
          include: {
            redirectConfig: true,
            ossConfig: true
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

    // 如果没有发布版本，不允许编辑
    if (!route.publishedVersion) {
      return NextResponse.json(
        { success: false, message: '路由还没有发布版本，请先发布' },
        { status: 400 }
      )
    }

    const currentVersion = route.publishedVersion;

    // 创建新的草稿版本
    const result = await prisma.$transaction(async (tx) => {
      // 生成新版本号
      const versionParts = currentVersion.version.split('.');
      const patchVersion = parseInt(versionParts[2] || '0') + 1;
      const newVersionNumber = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

      // 创建新的路由版本（草稿状态）
      const newVersion = await tx.routeVersion.create({
        data: {
          routeId: routeId,
          version: newVersionNumber,
          configType: currentVersion.configType,
          status: 'DRAFT',
          baseVersionId: currentVersion.id,
          createdBy: session.user!.id
        }
      })

      // 根据配置类型创建相应的配置
      if (currentVersion.configType === 'REDIRECT') {
        await tx.redirectConfig.create({
          data: {
            versionId: newVersion.id,
            targetUrl: body.targetUrl || currentVersion.redirectConfig?.targetUrl,
            statusCode: body.statusCode || currentVersion.redirectConfig?.statusCode || 302,
            queryForward: currentVersion.redirectConfig?.queryForward || true,
            headers: currentVersion.redirectConfig?.headers || {}
          }
        })
      } else if (currentVersion.configType === 'OSS') {
        await tx.ossConfig.create({
          data: {
            versionId: newVersion.id,
            bucket: body.bucket || currentVersion.ossConfig?.bucket,
            objectKey: body.objectKey || currentVersion.ossConfig?.objectKey,
            region: body.region || currentVersion.ossConfig?.region,
            endpoint: currentVersion.ossConfig?.endpoint,
            cacheControl: currentVersion.ossConfig?.cacheControl,
            contentType: currentVersion.ossConfig?.contentType,
            headers: currentVersion.ossConfig?.headers || {}
          }
        })
      }

      // 记录版本创建日志
      await tx.configVersion.create({
        data: {
          applicationId: appId,
          routeId: routeId,
          versionId: newVersion.id,
          version: newVersionNumber,
          action: 'CREATE',
          description: `基于 ${currentVersion.version} 创建草稿版本`,
          configData: {
            baseVersion: currentVersion.version,
            changes: body
          },
          createdBy: session.user!.id
        }
      })

      // 记录操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: appId,
          action: 'CREATE_DRAFT_VERSION',
          resource: 'route',
          resourceId: routeId,
          details: {
            newVersion: newVersionNumber,
            baseVersion: currentVersion.version,
            changes: body
          }
        }
      })

      return newVersion
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: '草稿版本创建成功，请发布后生效'
    })

  } catch (error) {
    console.error('创建草稿版本失败:', error)
    return NextResponse.json(
      { success: false, message: '创建草稿版本失败' },
      { status: 500 }
    )
  }
}

// 删除路由
export async function DELETE(
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
        permissions: { has: 'WRITE' }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限删除路由' },
        { status: 403 }
      )
    }

    // 检查路由是否存在
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        applicationId: appId
      }
    })

    if (!route) {
      return NextResponse.json(
        { success: false, message: '路由不存在' },
        { status: 404 }
      )
    }

    // 删除路由及其所有相关数据
    await prisma.$transaction(async (tx) => {
      // 删除所有版本的重定向配置
      await tx.redirectConfig.deleteMany({
        where: {
          version: {
            routeId: routeId
          }
        }
      })

      // 删除所有版本的OSS配置
      await tx.ossConfig.deleteMany({
        where: {
          version: {
            routeId: routeId
          }
        }
      })

      // 删除所有版本记录
      await tx.configVersion.deleteMany({
        where: {
          routeId: routeId
        }
      })

      // 删除所有路由版本
      await tx.routeVersion.deleteMany({
        where: {
          routeId: routeId
        }
      })

      // 删除审计日志
      await tx.auditLog.deleteMany({
        where: {
          resourceId: routeId,
          resource: 'route'
        }
      })

      // 最后删除路由本身
      await tx.route.delete({
        where: {
          id: routeId
        }
      })

      // 记录删除操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: appId,
          action: 'DELETE_ROUTE',
          resource: 'route',
          resourceId: routeId,
          details: {
            routeName: route.name,
            routePath: route.path,
            deletedAt: new Date().toISOString()
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: '路由删除成功'
    })

  } catch (error) {
    console.error('删除路由失败:', error)
    return NextResponse.json(
      { success: false, message: '删除路由失败' },
      { status: 500 }
    )
  }
}