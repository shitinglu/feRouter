import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'
import { AppRole, PermissionType } from '@prisma/client'

// 获取权限详情
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string; permissionId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { appId, permissionId } = await params;

    // 检查用户权限
    const userPermission = await prisma.appPermission.findFirst({
      where: {
        userId: session.user.id,
        applicationId: appId,
        permissions: { has: 'MANAGE' }
      }
    })

    if (!userPermission) {
      return NextResponse.json(
        { success: false, message: '无权限查看应用权限' },
        { status: 403 }
      )
    }

    // 查询权限详情
    const permission = await prisma.appPermission.findFirst({
      where: {
        id: permissionId,
        applicationId: appId
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

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '权限记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: permission.id,
        userId: permission.userId,
        role: permission.role,
        permissions: permission.permissions,
        user: permission.user,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
        grantedBy: permission.grantedBy
      }
    })

  } catch (error) {
    console.error('获取权限详情失败:', error)
    return NextResponse.json(
      { success: false, message: '获取权限详情失败' },
      { status: 500 }
    )
  }
}

// 更新权限
export async function PUT(
  request: NextRequest,
  { params }: { params: { appId: string; permissionId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { appId, permissionId } = await params;
    const body = await request.json()
    const { role, permissions } = body

    // 验证必填字段
    if (!role || !permissions || !Array.isArray(permissions)) {
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

    // 检查权限记录是否存在
    const existingPermission = await prisma.appPermission.findFirst({
      where: {
        id: permissionId,
        applicationId: appId
      }
    })

    if (!existingPermission) {
      return NextResponse.json(
        { success: false, message: '权限记录不存在' },
        { status: 404 }
      )
    }

    // 更新权限记录
    const updatedPermission = await prisma.appPermission.update({
      where: { id: permissionId },
      data: {
        role: role as AppRole,
        permissions: permissions as PermissionType[]
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
        action: 'UPDATE_PERMISSION',
        resource: 'permission',
        resourceId: permissionId,
        details: {
          targetUserId: existingPermission.userId,
          oldRole: existingPermission.role,
          newRole: role,
          oldPermissions: existingPermission.permissions,
          newPermissions: permissions
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPermission.id,
        userId: updatedPermission.userId,
        role: updatedPermission.role,
        permissions: updatedPermission.permissions,
        user: updatedPermission.user,
        createdAt: updatedPermission.createdAt,
        updatedAt: updatedPermission.updatedAt,
        grantedBy: updatedPermission.grantedBy
      }
    })

  } catch (error) {
    console.error('更新权限失败:', error)
    return NextResponse.json(
      { success: false, message: '更新权限失败' },
      { status: 500 }
    )
  }
}

// 删除权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: { appId: string; permissionId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const { appId, permissionId } = await params;

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

    // 查询要删除的权限记录
    const permission = await prisma.appPermission.findFirst({
      where: {
        id: permissionId,
        applicationId: appId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, message: '权限记录不存在' },
        { status: 404 }
      )
    }

    // 防止删除最后一个OWNER权限
    if (permission.role === 'OWNER') {
      const ownerCount = await prisma.appPermission.count({
        where: {
          applicationId: appId,
          role: 'OWNER'
        }
      })

      if (ownerCount <= 1) {
        return NextResponse.json(
          { success: false, message: '不能删除最后一个拥有者权限' },
          { status: 400 }
        )
      }
    }

    // 删除权限记录
    await prisma.appPermission.delete({
      where: { id: permissionId }
    })

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        applicationId: appId,
        action: 'REVOKE_PERMISSION',
        resource: 'permission',
        resourceId: permissionId,
        details: {
          targetUserId: permission.userId,
          targetUserEmail: permission.user.email,
          revokedRole: permission.role,
          revokedPermissions: permission.permissions
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '权限删除成功'
    })

  } catch (error) {
    console.error('删除权限失败:', error)
    return NextResponse.json(
      { success: false, message: '删除权限失败' },
      { status: 500 }
    )
  }
} 