'use client'

import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Settings,
  Route,
  Users,
  History,
  Home,
  ChevronRight,
  Building2,
  Eye,
  ArrowLeft,
  Globe
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ApplicationDetail } from '@/lib/actions/applications'
import Link from 'next/link'

interface AppSidebarProps {
  application: ApplicationDetail
}

// 菜单项配置
const menuItems = [
  {
    title: '概览',
    url: '',
    icon: Home,
    description: '应用概览和关键指标'
  },
  {
    title: '路由管理',
    url: '/routes',
    icon: Route,
    description: '管理应用路由配置',
    // items: [
    //   {
    //     title: '路由列表',
    //     url: '/routes',
    //     description: '查看所有路由配置'
    //   },
    //   {
    //     title: '添加路由',
    //     url: '/routes/new',
    //     description: '创建新的路由配置'
    //   },
    //   {
    //     title: '路由测试',
    //     url: '/routes/test',
    //     description: '测试路由配置'
    //   },
    // ],
  },
  {
    title: '权限管理',
    url: '/permissions',
    icon: Users,
    description: '管理用户权限',
    items: [
      {
        title: '用户权限',
        url: '/permissions',
        description: '管理用户访问权限'
      },
      {
        title: '角色管理',
        url: '/permissions/roles',
        description: '配置用户角色'
      },
    ],
  },
  // {
  //   title: '部署管理',
  //   url: '/deployments',
  //   icon: History,
  //   description: '管理应用部署',
  //   items: [
  //     {
  //       title: '部署历史',
  //       url: '/deployments',
  //       description: '查看部署历史记录'
  //     },
  //     {
  //       title: '版本管理',
  //       url: '/deployments/versions',
  //       description: '管理应用版本'
  //     },
  //     {
  //       title: '回滚操作',
  //       url: '/deployments/rollback',
  //       description: '回滚到指定版本'
  //     },
  //   ],
  // },
  {
    title: '数据分析',
    url: '/analytics',
    icon: BarChart3,
    description: '查看数据分析',
    items: [
      {
        title: '流量分析',
        url: '/analytics',
        description: '查看流量统计'
      },
      {
        title: '性能监控',
        url: '/analytics/performance',
        description: '监控应用性能'
      },
      {
        title: '错误日志',
        url: '/analytics/errors',
        description: '查看错误日志'
      },
    ],
  },
  {
    title: '应用设置',
    url: '/settings',
    icon: Settings,
    description: '应用配置设置',
    items: [
      {
        title: '基本设置',
        url: '/settings',
        description: '基本应用配置'
      },
      {
        title: '域名配置',
        url: '/settings/domains',
        description: '配置应用域名'
      },
      {
        title: '环境变量',
        url: '/settings/env',
        description: '管理环境变量'
      },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'INACTIVE': return 'bg-gray-100 text-gray-800'
    case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return '运行中'
    case 'INACTIVE': return '已停用'
    case 'MAINTENANCE': return '维护中'
    default: return '未知'
  }
}

export function AppSidebar({ application }: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    const fullUrl = `/apps/${application.id}${url}`
    return pathname === fullUrl
  }

  const isParentActive = (item: any) => {
    if (isActive(item.url)) return true
    return item.items?.some((subItem: any) => isActive(subItem.url))
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <ArrowLeft className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs text-muted-foreground">返回应用列表</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* 应用信息 */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{application.name}</h3>
                <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="size-3" />
                <span className="truncate">{application.domain}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                路由: {application._count.routes} | 权限: {application._count.permissions}
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>功能导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isParentActive(item)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            tooltip={item.description}
                            className={isParentActive(item) ? 'bg-accent' : ''}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  isActive={isActive(subItem.url)}
                                  tooltip={subItem.description}
                                >
                                  <Link href={`/apps/${application.id}${subItem.url}`}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.description}
                        isActive={isActive(item.url)}
                      >
                        <Link href={`/apps/${application.id}${item.url}`}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="在新窗口预览应用">
              <a href={`//${application.domain}`} target="_blank" rel="noopener noreferrer">
                <Eye />
                <span>预览应用</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
} 