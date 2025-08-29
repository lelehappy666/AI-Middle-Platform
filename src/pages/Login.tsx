import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react'
import { useAuthActions, useAuth } from '../store/authStore'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [isUsernameValid, setIsUsernameValid] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login, clearError } = useAuthActions()
  const { isLoading, error, isAuthenticated } = useAuth()

  // 页面挂载动画
  useEffect(() => {
    setMounted(true)
    clearError()
  }, [])

  // 如果已登录，重定向到目标页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location, isLoading])

  // 用户名格式验证
  const validateUsername = (value: string) => {
    const trimmedValue = value.trim()
    // 用户名格式：支持中英文字符、数字、下划线，长度2-20位
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/
    
    if (!trimmedValue) {
      setUsernameError('')
      setIsUsernameValid(false)
      return false
    }
    
    if (!usernameRegex.test(trimmedValue)) {
      setUsernameError('用户名格式不正确，支持中英文字符、数字、下划线，长度2-20位')
      setIsUsernameValid(false)
      return false
    }
    
    setUsernameError('')
    setIsUsernameValid(true)
    return true
  }

  // 表单验证
  useEffect(() => {
    const isUsernameOk = validateUsername(username)
    setIsFormValid(isUsernameOk && password.length >= 6)
  }, [username, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isLoading) return

    try {
      await login({ username: username.trim(), password })
    } catch (error) {
      // 错误已在store中处理
    }
  }

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
    if (error) clearError()
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    validateUsername(value)
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900" />
      
      {/* 动态背景元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 登录卡片 */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-1000 ease-out transform ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* 毛玻璃效果卡片 */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-lg" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              AI中台
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              请登录您的账户
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className={`mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3 transition-all duration-300 ${
              error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入框 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    usernameError 
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                      : isUsernameValid 
                        ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                        : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="请输入用户名"
                  disabled={isLoading}
                  autoComplete="username"
                />
                {/* 验证状态图标 */}
                {username && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {isUsernameValid ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    ) : usernameError ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* 用户名格式说明 */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                支持中英文字符、数字、下划线，长度2-20位
              </div>
              
              {/* 用户名错误提示 */}
              {usernameError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{usernameError}</span>
                </div>
              )}
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="请输入密码"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              } ${
                isLoading ? 'scale-95' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>登录中...</span>
                </div>
              ) : (
                '登录'
              )}
            </button>
          </form>



          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">账户注册请联系管理员:lele748916898@outlook.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login