import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/db/prisma'
import { auth } from '@/auth'

// 获取路由部署记录
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

    // 获取路由的部署记录
    const deployRecords = await prisma.configVersion.findMany({
      where: {
        applicationId: appId,
        routeId: routeId,
        action: {
          in: ['DEPLOY', 'UNPUBLISH', 'ROLLBACK']
        }
      },
      include: {
        application: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 获取操作人信息
    const userIds = [...new Set(deployRecords.map(record => record.createdBy))]
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

    // 格式化返回数据
    const formattedRecords = deployRecords.map(record => ({
      id: record.id,
      version: record.version,
      action: record.action,
      description: record.description,
      createdAt: record.createdAt.toISOString(),
      createdBy: record.createdBy,
      createdByName: userMap[record.createdBy]?.name || userMap[record.createdBy]?.email,
      configData: record.configData
    }))

    return NextResponse.json({
      success: true,
      data: formattedRecords,
      message: '获取部署记录成功'
    })

  } catch (error) {
    console.error('获取部署记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取部署记录失败' },
      { status: 500 }
    )
  }
} 