import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Image, Video, Home, Info, MessageCircle, Mic, Sparkles, Settings } from 'lucide-react';
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
  const { setSearchQuery: setStoreSearchQuery } = useMediaStore();

  const navigationItems = [
    {
      name: '首页',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: '图片',
      href: '/images',
      icon: Image,
      current: location.pathname === '/images'
    },
    {
      name: '视频',
      href: '/videos',
      icon: Video,
      current: location.pathname === '/videos'
    },
    {
      name: 'AI对话',
      href: '/ai/chat',
      icon: MessageCircle,
      current: location.pathname === '/ai/chat'
    },
    {
      name: '录音分析',
      href: '/ai/audio',
      icon: Mic,
      current: location.pathname === '/ai/audio'
    },
    {
      name: 'AI生成',
      href: '/ai/generate',
      icon: Sparkles,
      current: location.pathname === '/ai/generate'
    },
    {
      name: '关于',
      href: '/about',
      icon: Info,
      current: location.pathname === '/about'
    },
    {
      name: '设置',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setStoreSearchQuery(query);
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
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    item.current
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            

          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchInput
              placeholder="搜索图片和视频..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch('')}
              className="w-full"
            />
          </div>

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
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200',
                    item.current
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export type { NavbarProps };