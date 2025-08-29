import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  justLoggedIn: boolean
  lastLoginTime: number | null
}

export interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkAuth: () => void
  notifyUserOnline: (userId: string, loginTime: string) => Promise<void>
  notifyUserOffline: (userId: string, logoutTime: string) => Promise<void>
}

export type AuthStore = AuthState & AuthActions

// 检查后端连接状态 - 使用GET请求
const checkBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 检查后端连接状态...');
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5174',
        'Content-Type': 'application/json'
      }
    });
    const isConnected = response.ok;
    console.log(`🔗 后端连接状态: ${isConnected ? '✅ 连接成功' : '❌ 连接失败'}`);
    return isConnected;
  } catch (error) {
    console.error('❌ 后端连接检查失败:', error);
    return false;
  }
};

// 用户上线通知API
const notifyUserOnlineAPI = async (userId: string, token?: string): Promise<void> => {
  try {
    console.log('📡 发送用户上线通知:', { userId, timestamp: new Date().toISOString() });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5174'
    };
    
    // 如果有token，添加Authorization头部
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 添加Authorization头部到上线通知请求');
    } else {
      console.warn('⚠️ 上线通知请求缺少token，可能导致401错误');
    }
    
    const response = await fetch('http://localhost:3001/api/users/online', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
        action: 'login'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 用户上线通知发送成功:', result);
    } else {
      console.warn(`⚠️ 用户上线通知失败 - HTTP状态: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ 用户上线通知失败 - 后端服务可能未启动:', error instanceof Error ? error.message : String(error));
  }
};

// 用户下线通知API
const notifyUserOfflineAPI = async (userId: string, token?: string): Promise<void> => {
  try {
    console.log('📡 发送用户下线通知:', { userId, timestamp: new Date().toISOString() });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5174'
    };
    
    // 如果有token，添加Authorization头部
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 添加Authorization头部到下线通知请求');
    } else {
      console.warn('⚠️ 下线通知请求缺少token，可能导致401错误');
    }
    
    const response = await fetch('http://localhost:3001/api/users/offline', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
        action: 'logout'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 用户下线通知发送成功:', result);
    } else {
      console.warn(`⚠️ 用户下线通知失败 - HTTP状态: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ 用户下线通知失败 - 后端服务可能未启动:', error instanceof Error ? error.message : String(error));
  }
};

// 真实后端登录API调用
const realLogin = async (credentials: { username: string; password: string }): Promise<{ user: User; token: string }> => {
  console.log('🔐 向后端服务器发送登录请求...');
  
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5174'
    },
    body: JSON.stringify(credentials)
  });

  const responseData = await response.json();
  console.log('📥 后端响应数据:', responseData);

  if (!response.ok) {
    // 处理HTTP错误状态
    if (responseData.success === false) {
      throw new Error(responseData.error || responseData.message || '登录失败');
    }
    throw new Error(`登录失败: ${response.status}`);
  }

  // 检查响应格式
  if (!responseData.success) {
    throw new Error(responseData.error || responseData.message || '登录失败');
  }

  if (!responseData.data || !responseData.data.user || !responseData.data.accessToken) {
    console.error('❌ 服务器返回数据格式错误:', responseData);
    throw new Error('服务器返回数据格式错误');
  }

  // 映射后端用户数据到前端User类型
  const backendUser = responseData.data.user as any; // 临时使用any类型避免TypeScript错误
  const mappedUser: User = {
    id: backendUser.id,
    username: backendUser.username || backendUser.name, // 使用username，如果没有则使用name
    email: backendUser.email,
    avatar: backendUser.avatarUrl || '', // 映射avatarUrl到avatar
    role: backendUser.role || 'user'
  };

  console.log('✅ 用户数据映射完成:', mappedUser);

  return {
    user: mappedUser,
    token: responseData.data.accessToken
  };
}

export const useAuthStore = create<AuthStore>()(persist(
  (set, get) => ({
    // 初始状态
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    justLoggedIn: false,
    lastLoginTime: null,

    // 登录方法（真实后端验证）
    login: async (credentials) => {
      console.log('🔐 开始登录流程:', { username: credentials.username, timestamp: new Date().toISOString() })
      set({ isLoading: true, error: null })
      
      try {
        console.log('⏳ 执行真实后端登录验证...')
        const { user, token } = await realLogin(credentials)
        const loginTime = new Date().toISOString()
        
        console.log('✅ 登录验证成功:', { 
          userId: user.id, 
          username: user.username, 
          loginTime,
          tokenLength: token.length 
        })
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          justLoggedIn: true,
          lastLoginTime: Date.now()
        })
        
        console.log('📡 准备发送用户上线通知到后端服务器...')
        console.log('🎯 后端服务器地址: http://localhost:3001')
        console.log('📋 通知数据:', { userId: user.id, timestamp: loginTime })
        
        // 发送用户上线通知
        try {
          await notifyUserOnlineAPI(user.id, token)
          console.log('🎉 登录流程完成!')
        } catch (notifyError) {
          console.warn('⚠️ 用户上线通知发送失败，但登录成功:', notifyError)
          // 上线通知失败不影响登录成功状态
        }
        
      } catch (error) {
        console.error('❌ 登录流程失败:', error)
        
        let errorMessage = '登录失败'
        if (error instanceof Error) {
          if (error.message.includes('后端服务器不可用')) {
            errorMessage = '无法连接到服务器，请检查网络连接或联系管理员'
          } else if (error.message.includes('用户名和密码')) {
            errorMessage = error.message
          } else if (error.message.includes('密码长度')) {
            errorMessage = error.message
          } else {
            errorMessage = error.message
          }
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage
        })
        throw new Error(errorMessage)
      }
    },

    // 登出方法
    logout: async () => {
      const state = get()
      const logoutTime = new Date().toISOString()
      
      console.log('🚪 开始登出流程:', { 
        userId: state.user?.id, 
        username: state.user?.username,
        isAuthenticated: state.isAuthenticated,
        logoutTime 
      })
      
      // 如果用户已登录，发送下线通知
      if (state.user && state.isAuthenticated) {
        console.log('📡 准备发送用户下线通知到后端服务器...')
        console.log('🎯 后端服务器地址: http://localhost:3001')
        console.log('📋 通知数据:', { userId: state.user.id, timestamp: logoutTime })
        
        try {
          await notifyUserOfflineAPI(state.user.id, state.token || undefined)
        } catch (notifyError) {
          console.warn('⚠️ 用户下线通知发送失败，但登出继续:', notifyError)
          // 下线通知失败不影响登出流程
        }
      } else {
        console.log('ℹ️ 用户未登录或未认证，跳过下线通知')
      }
      
      console.log('🧹 清理用户状态...')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        justLoggedIn: false,
        lastLoginTime: null
      })
      
      console.log('👋 登出流程完成!')
    },

    // 清除错误
    clearError: () => {
      set({ error: null })
    },

    // 设置加载状态
    setLoading: (loading) => {
      set({ isLoading: loading })
    },

    // 检查认证状态
    checkAuth: () => {
      const state = get()
      console.log('🔍 checkAuth - 检查认证状态:', {
        isAuthenticated: state.isAuthenticated,
        hasToken: !!state.token,
        hasUser: !!state.user
      })
      
      // 重置刚登录标志
      if (state.justLoggedIn) {
        set({ justLoggedIn: false })
      }
      
      // 如果有token和用户信息就认为已认证
      if (state.token && state.user && !state.isAuthenticated) {
        set({ isAuthenticated: true })
      }
    },

    // 用户上线通知方法
    notifyUserOnline: async (userId: string, loginTime: string) => {
      await notifyUserOnlineAPI(userId)
    },

    // 用户下线通知方法
    notifyUserOffline: async (userId: string, logoutTime: string) => {
      await notifyUserOfflineAPI(userId)
    }
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated
    })
  }
))

// 选择器
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  
  return { user, isAuthenticated, isLoading, error }
}

export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const clearError = useAuthStore((state) => state.clearError)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const notifyUserOnline = useAuthStore((state) => state.notifyUserOnline)
  const notifyUserOffline = useAuthStore((state) => state.notifyUserOffline)
  
  return { login, logout, clearError, checkAuth, notifyUserOnline, notifyUserOffline }
}