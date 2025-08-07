import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取应用路由列表
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
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')
    const configType = searchParams.get('configType')
    const keyword = searchParams.get('keyword')

    // 检查用户是否有该应用的访问权限
    const permission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '无权限访问该应用' },
        { status: 403 }
      )
    }

    // 构建查询条件
    const whereCondition: any = {
      applicationId: appId
    }

    if (keyword) {
      whereCondition.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { path: { contains: keyword, mode: 'insensitive' } }
      ]
    }

    // 查询路由列表（包含发布版本信息）
    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where: whereCondition,
        include: {
          publishedVersion: {
            include: {
              redirectConfig: true,
              ossConfig: true
            }
          },
          versions: {
            where: status || configType ? {
              ...(status && { status }),
              ...(configType && { configType })
            } : undefined,
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              redirectConfig: true,
              ossConfig: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.route.count({ where: whereCondition })
    ])

    // 格式化返回数据
    const formattedRoutes = routes.map(route => {
      // 优先使用发布版本，如果没有发布版本则使用最新版本
      const activeVersion = route.publishedVersion || route.versions[0]
      
      if (!activeVersion) {
        return null // 跳过没有版本的路由
      }

      return {
        id: route.id,
        name: route.name,
        path: route.path,
        method: route.method,
        configType: activeVersion.configType,
        status: route.status, // 使用路由级别的状态
        versionStatus: activeVersion.status, // 版本状态
        priority: route.priority,
        description: route.name,
        targetUrl: activeVersion.redirectConfig?.targetUrl,
        ossPath: activeVersion.ossConfig?.objectKey,
        ossBucket: activeVersion.ossConfig?.bucket,
        statusCode: activeVersion.redirectConfig?.statusCode,
        publishedAt: activeVersion.publishedAt?.toISOString(),
        publishedBy: activeVersion.publishedBy,
        publishedVersionId: route.publishedVersionId,
        createdAt: route.createdAt.toISOString(),
        updatedAt: route.updatedAt.toISOString(),
      }
    }).filter(Boolean) // 过滤掉null值

    return NextResponse.json({
      success: true,
      data: {
        routes: formattedRoutes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      message: '获取路由列表成功'
    })

  } catch (error) {
    console.error('获取路由列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取路由列表失败' },
      { status: 500 }
    )
  }
}

// 创建新路由
export async function POST(
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
    const body = await request.json()
    const {
      name,
      path,
      method = 'GET',
      configType,
      priority = 0,
      targetUrl,
      statusCode = 302,
      bucket,
      objectKey,
      region,
      headers
    } = body

    // 验证必填字段
    if (!name || !path || !configType) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

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
        { success: false, message: '无权限创建路由' },
        { status: 403 }
      )
    }

    // 检查路径和方法组合是否已存在
    const existingRoute = await prisma.route.findFirst({
      where: {
        applicationId: appId,
        path,
        method
      }
    })

    if (existingRoute) {
      return NextResponse.json(
        { success: false, message: '该路径和方法组合已存在' },
        { status: 409 }
      )
    }

    // 创建路由和初始版本
    const result = await prisma.$transaction(async (tx) => {
      // 创建路由主记录
      const route = await tx.route.create({
        data: {
          applicationId: appId,
          name,
          path,
          method,
          priority,
          createdBy: session.user!.id
        }
      })

      // 创建初始版本（草稿状态）
      const version = await tx.routeVersion.create({
        data: {
          routeId: route.id,
          version: '1.0.0',
          configType,
          status: 'DRAFT',
          createdBy: session.user!.id
        }
      })

      // 根据配置类型创建相应的配置
      if (configType === 'REDIRECT' && targetUrl) {
        await tx.redirectConfig.create({
          data: {
            versionId: version.id,
            targetUrl,
            statusCode,
            headers: headers || {}
          }
        })
      } else if (configType === 'OSS' && bucket && objectKey) {
        await tx.ossConfig.create({
          data: {
            versionId: version.id,
            bucket,
            objectKey,
            region,
            headers: headers || {}
          }
        })
      }

      // 记录操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: appId,
          action: 'CREATE_ROUTE',
          resource: 'route',
          resourceId: route.id,
          details: { name, path, method, configType, version: '1.0.0' }
        }
      })

      return { route, version }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: '路由创建成功'
    }, { status: 201 })

  } catch (error) {
    console.error('创建路由失败:', error)
    return NextResponse.json(
      { success: false, message: '创建路由失败' },
      { status: 500 }
    )
  }
} 