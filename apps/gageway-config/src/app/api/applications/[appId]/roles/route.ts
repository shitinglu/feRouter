import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'
import { AppRole, PermissionType } from '@prisma/client'

// 获取角色列表和统计信息
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
        { success: false, message: '无权限查看角色信息' },
        { status: 403 }
      )
    }

    // 获取所有角色的统计信息
    const roleStats = await prisma.appPermission.groupBy({
      by: ['role'],
      where: {
        applicationId: appId
      },
      _count: {
        role: true
      }
    })

    // 角色定义和默认权限
    const roleDefinitions = [
      {
        role: 'OWNER' as AppRole,
        name: '拥有者',
        description: '拥有应用的完全控制权，包括删除应用和管理权限',
        defaultPermissions: ['READ', 'WRITE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'MANAGE'] as PermissionType[],
        color: 'bg-red-100 text-red-800',
        level: 4
      },
      {
        role: 'ADMIN' as AppRole,
        name: '管理员',
        description: '拥有应用管理权限，可以配置路由和管理用户权限',
        defaultPermissions: ['READ', 'WRITE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'MANAGE'] as PermissionType[],
        color: 'bg-orange-100 text-orange-800',
        level: 3
      },
      {
        role: 'EDITOR' as AppRole,
        name: '编辑者',
        description: '可以编辑和部署应用配置，但不能管理权限',
        defaultPermissions: ['READ', 'WRITE', 'DEPLOY', 'ROLLBACK'] as PermissionType[],
        color: 'bg-blue-100 text-blue-800',
        level: 2
      },
      {
        role: 'VIEWER' as AppRole,
        name: '查看者',
        description: '只能查看应用配置，无法进行修改操作',
        defaultPermissions: ['READ'] as PermissionType[],
        color: 'bg-gray-100 text-gray-800',
        level: 1
      }
    ]

    // 合并角色定义和统计信息
    const rolesWithStats = roleDefinitions.map(roleDef => {
      const stats = roleStats.find(stat => stat.role === roleDef.role)
      return {
        ...roleDef,
        userCount: stats?._count.role || 0
      }
    })

    // 权限定义
    const permissionDefinitions = [
      {
        permission: 'READ' as PermissionType,
        name: '查看',
        description: '查看应用配置和数据'
      },
      {
        permission: 'WRITE' as PermissionType,
        name: '编辑',
        description: '创建和修改应用配置'
      },
      {
        permission: 'DELETE' as PermissionType,
        name: '删除',
        description: '删除应用配置和数据'
      },
      {
        permission: 'DEPLOY' as PermissionType,
        name: '部署',
        description: '发布应用配置到线上环境'
      },
      {
        permission: 'ROLLBACK' as PermissionType,
        name: '回滚',
        description: '回滚应用配置到历史版本'
      },
      {
        permission: 'MANAGE' as PermissionType,
        name: '管理权限',
        description: '管理用户权限和角色分配'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        roles: rolesWithStats,
        permissions: permissionDefinitions,
        totalUsers: roleStats.reduce((sum, stat) => sum + stat._count.role, 0)
      }
    })

  } catch (error) {
    console.error('获取角色信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取角色信息失败' },
      { status: 500 }
    )
  }
} 