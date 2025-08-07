import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'
import { AppRole, PermissionType } from '@prisma/client'

// 获取应用权限列表
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
    const role = searchParams.get('role')
    const keyword = searchParams.get('keyword')

    // 检查用户是否有该应用的管理权限
    const userPermission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'MANAGE' }
      }
    })

    if (!userPermission) {
      return NextResponse.json(
        { success: false, message: '无权限管理应用权限' },
        { status: 403 }
      )
    }

    // 构建查询条件
    const whereCondition: any = {
      applicationId: appId
    }

    if (role) {
      whereCondition.role = role
    }

    if (keyword) {
      whereCondition.user = {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    }

    // 查询权限列表
    const [permissions, total] = await Promise.all([
      prisma.appPermission.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.appPermission.count({ where: whereCondition })
    ])

    // 格式化返回数据
    const formattedPermissions = permissions.map(permission => ({
      id: permission.id,
      userId: permission.userId,
      role: permission.role,
      permissions: permission.permissions,
      user: permission.user,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      grantedBy: permission.grantedBy
    }))

    return NextResponse.json({
      success: true,
      data: {
        permissions: formattedPermissions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })

  } catch (error) {
    console.error('获取权限列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取权限列表失败' },
      { status: 500 }
    )
  }
}

// 添加权限
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
    const { userEmail, role, permissions } = body

    // 验证必填字段
    if (!userEmail || !role || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查操作者权限
    const operatorPermission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'MANAGE' }
      }
    })

    if (!operatorPermission) {
      return NextResponse.json(
        { success: false, message: '无权限管理应用权限' },
        { status: 403 }
      )
    }

    // 查找目标用户
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查是否已存在权限记录
    const existingPermission = await prisma.appPermission.findUnique({
      where: {
        userId_applicationId: {
          userId: targetUser.id,
          applicationId: appId
        }
      }
    })

    if (existingPermission) {
      return NextResponse.json(
        { success: false, message: '该用户已拥有此应用权限' },
        { status: 409 }
      )
    }

    // 创建权限记录
    const newPermission = await prisma.appPermission.create({
      data: {
        userId: targetUser.id,
        applicationId: appId,
        role: role as AppRole,
        permissions: permissions as PermissionType[],
        grantedBy: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        applicationId: appId,
        action: 'GRANT_PERMISSION',
        resource: 'permission',
        resourceId: newPermission.id,
        details: {
          targetUserId: targetUser.id,
          targetUserEmail: userEmail,
          role,
          permissions
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newPermission.id,
        userId: newPermission.userId,
        role: newPermission.role,
        permissions: newPermission.permissions,
        user: newPermission.user,
        createdAt: newPermission.createdAt,
        updatedAt: newPermission.updatedAt,
        grantedBy: newPermission.grantedBy
      }
    })

  } catch (error) {
    console.error('添加权限失败:', error)
    return NextResponse.json(
      { success: false, message: '添加权限失败' },
      { status: 500 }
    )
  }
}
