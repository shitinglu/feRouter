"use client"

import { useState, useEffect } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Search, Settings, UserPlus, Trash2, Edit, Shield, Users, Eye } from 'lucide-react'
import { toast } from 'sonner'
import AddPermissionForm from './AddPermissionForm'
import EditPermissionForm from './EditPermissionForm'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Permission {
  id: string
  userId: string
  role: string
  permissions: string[]
  user: User
  createdAt: string
  updatedAt: string
  grantedBy: string | null
}

interface PermissionsPageProps {
  params: { appId: string }
}

const ROLE_CONFIG = {
  OWNER: { name: '拥有者', color: 'bg-red-100 text-red-800' },
  ADMIN: { name: '管理员', color: 'bg-orange-100 text-orange-800' },
  EDITOR: { name: '编辑者', color: 'bg-blue-100 text-blue-800' },
  VIEWER: { name: '查看者', color: 'bg-gray-100 text-gray-800' }
}

const PERMISSION_CONFIG = {
  READ: { name: '查看', icon: Eye },
  WRITE: { name: '编辑', icon: Edit },
  DELETE: { name: '删除', icon: Trash2 },
  DEPLOY: { name: '部署', icon: Settings },
  ROLLBACK: { name: '回滚', icon: Settings },
  MANAGE: { name: '管理权限', icon: Shield }
}

export default function PermissionsPage({ params }: PermissionsPageProps) {
  const [appId, setAppId] = useState<string>('')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  // 获取appId
  useEffect(() => {
    const getAppId = async () => {
      const resolvedParams = await params
      setAppId(resolvedParams.appId)
    }
    getAppId()
  }, [params])

  // 加载权限列表
  const loadPermissions = async () => {
    if (!appId) return

    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(keyword && { keyword }),
        ...(selectedRole && { role: selectedRole })
      })

      const response = await fetch(`/api/applications/${appId}/permissions?${searchParams}`)
      const result = await response.json()

      if (result.success) {
        setPermissions(result.data.permissions)
        setTotal(result.data.pagination.total)
      } else {
        toast.error(result.message || '加载权限列表失败')
      }
    } catch (error) {
      console.error('加载权限列表失败:', error)
      toast.error('加载权限列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appId) {
      loadPermissions()
    }
  }, [appId, page, keyword, selectedRole])

  // 删除权限
  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('确定要删除此权限吗？')) return

    try {
      const response = await fetch(`/api/applications/${appId}/permissions/${permissionId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        toast.success('权限删除成功')
        loadPermissions()
      } else {
        toast.error(result.message || '删除权限失败')
      }
    } catch (error) {
      console.error('删除权限失败:', error)
      toast.error('删除权限失败')
    }
  }

  // 编辑权限
  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setEditSheetOpen(true)
  }

  // 添加成功回调
  const handleAddSuccess = () => {
    setAddSheetOpen(false)
    loadPermissions()
  }

  // 编辑成功回调
  const handleEditSuccess = () => {
    setEditSheetOpen(false)
    setEditingPermission(null)
    loadPermissions()
  }

  if (!appId) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">应用管理</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/apps/${appId}`}>应用详情</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>权限管理</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* 页面内容 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">权限管理</h1>
            <p className="text-muted-foreground">管理应用的用户权限和角色分配</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRole('')}
              className={selectedRole === '' ? 'bg-primary text-primary-foreground' : ''}
            >
              全部
            </Button>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <Button
                key={role}
                variant="outline"
                onClick={() => setSelectedRole(role)}
                className={selectedRole === role ? 'bg-primary text-primary-foreground' : ''}
              >
                {config.name}
              </Button>
            ))}
            <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  添加权限
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
                <SheetHeader className="pb-6">
                  <SheetTitle>添加用户权限</SheetTitle>
                  <SheetDescription>
                    为用户分配应用权限和角色
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <AddPermissionForm 
                    appId={appId} 
                    onSuccess={handleAddSuccess}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索用户名或邮箱..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 权限列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              用户权限列表
            </CardTitle>
            <CardDescription>
              共 {total} 个用户拥有此应用权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">加载中...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>权限</TableHead>
                    <TableHead>添加时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        暂无权限记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {permission.user.image ? (
                              <img 
                                src={permission.user.image} 
                                alt={permission.user.name || permission.user.email}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-sm font-medium">
                                  {(permission.user.name || permission.user.email)[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{permission.user.name || permission.user.email}</div>
                              <div className="text-sm text-muted-foreground">{permission.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_CONFIG[permission.role as keyof typeof ROLE_CONFIG]?.color}>
                            {ROLE_CONFIG[permission.role as keyof typeof ROLE_CONFIG]?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permission.permissions.map((perm) => {
                              const config = PERMISSION_CONFIG[perm as keyof typeof PERMISSION_CONFIG]
                              return (
                                <Badge key={perm} variant="secondary" className="text-xs">
                                  {config?.name || perm}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(permission.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditPermission(permission)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePermission(permission.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 编辑权限抽屉 */}
        <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
          <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
            <SheetHeader className="pb-6">
              <SheetTitle>编辑用户权限</SheetTitle>
              <SheetDescription>
                修改用户的角色和权限设置
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              {editingPermission && (
                <EditPermissionForm 
                  appId={appId}
                  permission={editingPermission}
                  onSuccess={handleEditSuccess}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
} 