'use client'

import { useApp as useAppContext } from '@/lib/app-context'

// 重新导出，提供更好的 API
export function useApp() {
  return useAppContext()
}

// 便捷的获取应用 ID 的 hook
export function useAppId() {
  const { appId } = useAppContext()
  return appId
}

// 便捷的获取应用信息的 hook  
export function useApplication() {
  const { application } = useAppContext()
  return application
} 