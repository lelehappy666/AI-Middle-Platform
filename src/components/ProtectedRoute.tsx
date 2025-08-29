import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useAuthActions, useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { checkAuth } = useAuthActions()
  const location = useLocation()
  const authStore = useAuthStore()

  // 组件挂载时检查认证状态
  useEffect(() => {
    console.log('🛡️ ProtectedRoute - 组件挂载，当前路径:', location.pathname)
    console.log('🛡️ ProtectedRoute - 当前认证状态:', { 
      isAuthenticated, 
      isLoading,
      justLoggedIn: authStore.justLoggedIn,
      lastLoginTime: authStore.lastLoginTime
    })
    
    // 如果刚刚登录成功，延迟检查认证状态
    if (authStore.justLoggedIn) {
      console.log('🛡️ ProtectedRoute - 检测到刚登录成功，延迟验证认证状态')
      setTimeout(() => {
        checkAuth()
      }, 2000) // 2秒后再验证
    } else {
      console.log('🛡️ ProtectedRoute - 正常检查认证状态')
      checkAuth()
    }
  }, [checkAuth, authStore.justLoggedIn])

  // 监听认证状态变化
  useEffect(() => {
    console.log('🛡️ ProtectedRoute - 认证状态变化:', { isAuthenticated, isLoading, path: location.pathname })
  }, [isAuthenticated, isLoading, location.pathname])

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          {/* 加载动画 */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            正在验证身份...
          </p>
        </div>
      </div>
    )
  }

  // 如果未认证，重定向到登录页面，并保存当前位置
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - 用户未认证，重定向到登录页面')
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // 如果已认证，渲染子组件
  console.log('✅ ProtectedRoute - 用户已认证，渲染受保护内容')
  return <>{children}</>
}

export default ProtectedRoute