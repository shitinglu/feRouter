'use client'

import { useState, useEffect } from 'react'
import { BarChart, TrendingUp, Eye, Clock, Globe, Users } from 'lucide-react'
import { ApplicationDetail } from '@/lib/actions/applications'

interface AnalyticsProps {
  application: ApplicationDetail
}

interface AnalyticsData {
  totalRequests: number
  activeRoutes: number
  responseTime: number
  errorRate: number
  dailyRequests: { date: string; requests: number }[]
  topRoutes: { path: string; requests: number }[]
}

export default function Analytics({ application }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRequests: 0,
    activeRoutes: 0,
    responseTime: 0,
    errorRate: 0,
    dailyRequests: [],
    topRoutes: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据加载
    const loadAnalytics = async () => {
      setLoading(true)
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据
      setAnalytics({
        totalRequests: 12450,
        activeRoutes: application._count.routes,
        responseTime: 245,
        errorRate: 2.1,
        dailyRequests: [
          { date: '2024-01-01', requests: 1200 },
          { date: '2024-01-02', requests: 1350 },
          { date: '2024-01-03', requests: 1180 },
          { date: '2024-01-04', requests: 1420 },
          { date: '2024-01-05', requests: 1380 },
          { date: '2024-01-06', requests: 1150 },
          { date: '2024-01-07', requests: 1290 },
        ],
        topRoutes: [
          { path: '/api/users', requests: 3200 },
          { path: '/api/orders', requests: 2850 },
          { path: '/api/products', requests: 2400 },
          { path: '/api/auth', requests: 1950 },
          { path: '/api/dashboard', requests: 1450 },
        ]
      })
      
      setLoading(false)
    }

    loadAnalytics()
  }, [application])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载数据分析...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总请求数</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">较上周</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活跃路由</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeRoutes}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">共 {application._count.routes} 个路由</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均响应时间</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.responseTime}ms</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">过去24小时</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">错误率</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.errorRate}%</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">较昨日持平</span>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 每日请求趋势 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">请求趋势</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.dailyRequests.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ 
                    height: `${(day.requests / Math.max(...analytics.dailyRequests.map(d => d.requests))) * 200}px`,
                    minHeight: '20px'
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 热门路由 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">热门路由</h3>
          <div className="space-y-4">
            {analytics.topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-4">
                    {index + 1}
                  </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {route.path}
                  </code>
                </div>
                <span className="text-sm text-gray-900 font-medium">
                  {route.requests.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 性能指标 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">性能指标</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">99.9%</div>
            <div className="text-sm text-gray-500">可用性</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">1.2GB</div>
            <div className="text-sm text-gray-500">流量使用</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-500">并发用户</div>
          </div>
        </div>
      </div>
    </div>
  )
} 