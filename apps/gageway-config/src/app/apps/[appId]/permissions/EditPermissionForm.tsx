"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface Permission {
    id: string
    userId: string
    role: string
    permissions: string[]
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    createdAt: string
    updatedAt: string
    grantedBy: string | null
}

interface EditPermissionFormProps {
    appId: string
    permission: Permission
    onSuccess: () => void
}

const ROLE_OPTIONS = [
    {
        value: 'OWNER',
        label: '拥有者',
        description: '拥有应用的完全控制权',
        permissions: ['READ', 'WRITE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'MANAGE']
    },
    {
        value: 'ADMIN',
        label: '管理员',
        description: '拥有应用管理权限',
        permissions: ['READ', 'WRITE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'MANAGE']
    },
    {
        value: 'EDITOR',
        label: '编辑者',
        description: '可以编辑和部署应用配置',
        permissions: ['READ', 'WRITE', 'DEPLOY', 'ROLLBACK']
    },
    {
        value: 'VIEWER',
        label: '查看者',
        description: '只能查看应用配置',
        permissions: ['READ']
    }
]

const PERMISSION_OPTIONS = [
    { value: 'READ', label: '查看', description: '查看应用配置和数据' },
    { value: 'WRITE', label: '编辑', description: '创建和修改应用配置' },
    { value: 'DELETE', label: '删除', description: '删除应用配置和数据' },
    { value: 'DEPLOY', label: '部署', description: '发布应用配置到线上环境' },
    { value: 'ROLLBACK', label: '回滚', description: '回滚应用配置到历史版本' },
    { value: 'MANAGE', label: '管理权限', description: '管理用户权限和角色分配' }
]

export default function EditPermissionForm({ appId, permission, onSuccess }: EditPermissionFormProps) {
    const [selectedRole, setSelectedRole] = useState(permission.role)
    const [permissions, setPermissions] = useState<string[]>(permission.permissions)
    const [loading, setLoading] = useState(false)

    // 初始化表单数据
    useEffect(() => {
        setSelectedRole(permission.role)
        setPermissions(permission.permissions)
    }, [permission])

    // 角色变更时自动更新权限
    const handleRoleChange = (role: string) => {
        setSelectedRole(role)
        const roleConfig = ROLE_OPTIONS.find(r => r.value === role)
        if (roleConfig) {
            setPermissions(roleConfig.permissions)
        }
    }

    // 权限变更
    const handlePermissionChange = (perm: string, checked: boolean) => {
        if (checked) {
            setPermissions(prev => [...prev, perm])
        } else {
            setPermissions(prev => prev.filter(p => p !== perm))
        }
    }

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (permissions.length === 0) {
            toast.error('请至少选择一个权限')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/applications/${appId}/permissions/${permission.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: selectedRole,
                    permissions
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('权限更新成功')
                onSuccess()
            } else {
                toast.error(result.message || '更新权限失败')
            }
        } catch (error) {
            console.error('更新权限失败:', error)
            toast.error('更新权限失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* 用户信息 */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">用户信息</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        {permission.user.image ? (
                            <img 
                                src={permission.user.image} 
                                alt={permission.user.name || permission.user.email}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-medium">
                                    {(permission.user.name || permission.user.email)[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{permission.user.name || permission.user.email}</div>
                            <div className="text-sm text-muted-foreground truncate">{permission.user.email}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 角色选择 */}
                <div className="space-y-4">
                    <Label>角色</Label>
                    <RadioGroup value={selectedRole} onValueChange={handleRoleChange}>
                        <div className="space-y-3">
                            {ROLE_OPTIONS.map((role) => (
                                <div key={role.value} className="flex items-start space-x-3">
                                    <RadioGroupItem value={role.value} id={`edit-${role.value}`} className="mt-0.5" />
                                    <Label htmlFor={`edit-${role.value}`} className="flex-1 cursor-pointer space-y-1">
                                        <div className="font-medium">{role.label}</div>
                                        <div className="text-sm text-muted-foreground">{role.description}</div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>

                {/* 权限选择 */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">权限配置</CardTitle>
                        <CardDescription className="text-sm">
                            根据角色自动选择权限，你也可以自定义调整
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {PERMISSION_OPTIONS.map((perm) => (
                            <div key={perm.value} className="flex items-start space-x-3">
                                <Checkbox
                                    id={`edit-${perm.value}`}
                                    checked={permissions.includes(perm.value)}
                                    onCheckedChange={(checked) => 
                                        handlePermissionChange(perm.value, checked as boolean)
                                    }
                                    className="mt-0.5"
                                />
                                <div className="grid gap-1.5 leading-none flex-1">
                                    <Label 
                                        htmlFor={`edit-${perm.value}`}
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        {perm.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {perm.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 提交按钮 */}
                <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? '更新中...' : '更新权限'}
                    </Button>
                </div>
            </form>
        </div>
    )
}