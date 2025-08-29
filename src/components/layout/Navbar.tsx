import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Image, Video, Home, Info, MessageCircle, Mic, Sparkles, Settings, LogOut, User } from 'lucide-react';
import { useAuth, useAuthActions } from '../../store';
import { Button, SearchInput } from '../ui';
import { cn } from '../../lib/utils';
import { useMediaStore } from '../../store/mediaStore';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const { setSearchQuery: setStoreSearchQuery } = useMediaStore();

  // 按功能重要性和用户操作习惯重新排列导航按钮
  const navigationItems = [
    // 核心功能 - 最重要，放在最前面
    {
      name: '首页',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
      category: 'core'
    },
    // 主要媒体功能 - 核心业务功能
    {
      name: '图片',
      href: '/images',
      icon: Image,
      current: location.pathname === '/images',
      category: 'media'
    },
    {
      name: '视频',
      href: '/videos',
      icon: Video,
      current: location.pathname === '/videos',
      category: 'media'
    },
    // AI功能集群 - 智能功能集中放置
    {
      name: 'AI对话',
      href: '/ai/chat',
      icon: MessageCircle,
      current: location.pathname === '/ai/chat',
      category: 'ai'
    },
    {
      name: '录音分析',
      href: '/ai/audio',
      icon: Mic,
      current: location.pathname === '/ai/audio',
      category: 'ai'
    },
    {
      name: 'AI生成',
      href: '/ai/generate',
      icon: Sparkles,
      current: location.pathname === '/ai/generate',
      category: 'ai'
    },
    // 辅助功能 - 次要功能，放在最后
    {
      name: '关于',
      href: '/about',
      icon: Info,
      current: location.pathname === '/about',
      category: 'auxiliary'
    },
    {
      name: '设置',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      category: 'auxiliary'
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setStoreSearchQuery(query);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate('/login');
    } catch (error) {
      console.error('登出时发生错误:', error);
      // 即使出错也要完成登出流程
      setShowLogoutConfirm(false);
      navigate('/login');
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  return (
    <nav className={cn(
      'sticky top-0 z-40 w-full',
      'bg-white/80 backdrop-blur-md',
      'border-b border-gray-200/50',
      'shadow-sm',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                Media Gallery
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-4">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const prevItem = navigationItems[index - 1];
              const isNewCategory = prevItem && prevItem.category !== item.category;
              
              return (
                <React.Fragment key={item.name}>
                  {/* 添加功能分组间的视觉分隔 */}
                  {isNewCategory && (
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                  )}
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'hover:scale-105 active:scale-95', // 添加微妙的交互效果
                      item.current
                        ? 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm',
                      // 根据功能类别添加特殊样式
                      item.category === 'core' && 'font-semibold',
                      item.category === 'ai' && 'hover:bg-purple-50 hover:text-purple-700',
                      item.category === 'auxiliary' && 'text-gray-500'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 transition-colors duration-200',
                      item.category === 'ai' && 'group-hover:text-purple-600'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <SearchInput
              placeholder="搜索图片和视频..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch('')}
              className="w-full"
            />
          </div>

          {/* User Actions */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {user?.username || '用户'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">退出登录</span>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Search */}
            <div className="mb-4">
              <SearchInput
                placeholder="搜索图片和视频..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch('')}
                className="w-full"
              />
            </div>

            {/* Mobile Navigation Items */}
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const prevItem = navigationItems[index - 1];
              const isNewCategory = prevItem && prevItem.category !== item.category;
              
              return (
                <React.Fragment key={item.name}>
                  {/* 移动端功能分组标题 */}
                  {isNewCategory && (
                    <div className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {item.category === 'media' && '媒体功能'}
                          {item.category === 'ai' && 'AI功能'}
                          {item.category === 'auxiliary' && '辅助功能'}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    </div>
                  )}
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200',
                      'active:scale-95', // 移动端点击效果
                      item.current
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                      // 根据功能类别添加特殊样式
                      item.category === 'core' && 'font-semibold',
                      item.category === 'ai' && 'hover:bg-purple-50 hover:text-purple-700',
                      item.category === 'auxiliary' && 'text-gray-500'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      item.category === 'ai' && 'text-purple-600'
                    )} />
                    <span>{item.name}</span>
                  </Link>
                </React.Fragment>
              );
            })}

            {/* Mobile User Actions */}
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user?.username || '用户'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">退出登录</span>
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                确认退出登录
              </h3>
              <p className="text-gray-600 text-center mb-6">
                您确定要退出当前账户吗？
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={cancelLogout}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export type { NavbarProps };