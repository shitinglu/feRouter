import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取应用列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const applications = await prisma.application.findMany({
      include: {
        _count: {
          select: {
            routes: true,
            permissions: true
          }
        },
        permissions: {
          where: { userId: session.user.id },
          select: { role: true, permissions: true }
        },
        routes: {
          include: {
            publishedVersion: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedApplications = applications
      .filter(app => app.permissions.length > 0) // 只返回用户有权限的应用
      .map(app => {
        // 统计已发布的活跃路由数量
        const activeRoutesCount = app.routes.filter(route => 
          route.publishedVersion?.status === 'ACTIVE'
        ).length;

        return {
          id: app.id,
          name: app.name,
          code: app.code,
          domain: app.domain,
          description: app.description,
          status: app.status,
          _count: {
            routes: activeRoutesCount,
            permissions: app._count.permissions
          },
          userRole: app.permissions[0]?.role || 'VIEWER',
          userPermissions: app.permissions[0]?.permissions || [],
          createdAt: app.createdAt,
          updatedAt: app.updatedAt
        }
      })

    return NextResponse.json({
      success: true,
      data: formattedApplications,
      message: '获取应用列表成功'
    })

  } catch (error) {
    console.error('获取应用列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取应用列表失败' },
      { status: 500 }
    )
  }
}

// 创建新应用
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, code, domain, description } = body

    // 验证必填字段
    if (!name || !code || !domain) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查应用代码是否已存在
    const existingApp = await prisma.application.findFirst({
      where: {
        OR: [
          { code },
          { domain }
        ]
      }
    })

    if (existingApp) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingApp.code === code ? '应用代码已存在' : '域名已存在' 
        },
        { status: 409 }
      )
    }

    // 创建应用和拥有者权限
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          name,
          code,
          domain,
          description,
          createdBy: session.user!.id
        }
      })

      // 为创建者分配拥有者权限
      await tx.appPermission.create({
        data: {
          userId: session.user!.id,
          applicationId: application.id,
          role: 'OWNER',
          permissions: ['READ', 'WRITE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'MANAGE'],
          grantedBy: session.user!.id
        }
      })

      // 记录操作日志
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          applicationId: application.id,
          action: 'CREATE_APPLICATION',
          resource: 'application',
          resourceId: application.id,
          details: {
            name,
            code,
            domain,
            description
          }
        }
      })

      // 创建初始版本记录
      await tx.configVersion.create({
        data: {
          applicationId: application.id,
          version: '1.0.0',
          action: 'CREATE',
          description: '初始应用创建',
          configData: {
            name,
            code,
            domain,
            description,
            status: 'ACTIVE'
          },
          createdBy: session.user!.id
        }
      })

      return application
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: '应用创建成功'
    }, { status: 201 })

  } catch (error) {
    console.error('创建应用失败:', error)
    return NextResponse.json(
      { success: false, message: '创建应用失败' },
      { status: 500 }
    )
  }
} 