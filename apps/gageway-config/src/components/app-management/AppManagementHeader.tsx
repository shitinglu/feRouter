'use client'

import { ArrowLeft, Settings, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplicationDetail } from '@/lib/actions/applications'

interface AppManagementHeaderProps {
  application: ApplicationDetail
}

export default function AppManagementHeader({ application }: AppManagementHeaderProps) {
  const router = useRouter()

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

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{application.name}</h1>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusText(application.status)}
                </Badge>
                <Badge variant="outline">{application.userRole}</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {application.domain}
                </span>
                <span>应用ID: {application.code}</span>
                <span>路由: {application._count.routes}</span>
                <span>权限: {application._count.permissions}</span>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            应用设置
          </Button>
        </div>
      </div>
    </div>
  )
} 