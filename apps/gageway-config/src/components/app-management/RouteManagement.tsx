'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, ExternalLink } from 'lucide-react'
import { ApplicationDetail } from '@/lib/actions/applications'

interface RouteManagementProps {
  application: ApplicationDetail
}

interface Route {
  id: string
  path: string
  method: string
  target: string
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export default function RouteManagement({ application }: RouteManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('ALL')
  
  // 模拟路由数据
  const routes: Route[] = [
    {
      id: '1',
      path: '/api/users',
      method: 'GET',
      target: 'https://api.example.com/users',
      status: 'ACTIVE',
      description: '用户列表接口',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      path: '/api/orders/*',
      method: 'ALL',
      target: 'https://order.example.com',
      status: 'ACTIVE',
      description: '订单相关接口',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      path: '/admin/*',
      method: 'ALL',
      target: 'https://admin.example.com',
      status: 'TESTING',
      description: '管理后台',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-12'),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'TESTING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'ALL': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'ALL' || route.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">路由管理</h2>
          <p className="text-sm text-gray-500">管理 {application.name} 的路由配置</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          添加路由
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索路由路径或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">运行中</option>
            <option value="TESTING">测试中</option>
            <option value="INACTIVE">已停用</option>
          </select>
        </div>
      </div>

      {/* 路由列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  路由路径
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  方法
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  目标地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {route.path}
                      </code>
                      {route.description && (
                        <p className="text-xs text-gray-500 mt-1">{route.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(route.method)}`}>
                      {route.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{route.target}</span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(route.status)}`}>
                      {route.status === 'ACTIVE' ? '运行中' : route.status === 'TESTING' ? '测试中' : '已停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无匹配的路由配置</p>
          </div>
        )}
      </div>
    </div>
  )
} 