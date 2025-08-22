import React from 'react';
import Navbar from './Navbar';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  fullHeight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showNavbar = true,
  fullHeight = false
}) => {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      fullHeight && 'h-screen flex flex-col',
      className
    )}>
      {showNavbar && <Navbar />}
      
      <main className={cn(
        'flex-1',
        fullHeight ? 'overflow-hidden' : 'pb-8'
      )}>
        {children}
      </main>
    </div>
  );
};

// 页面容器组件
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = '7xl',
  padding = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'mx-auto',
      maxWidthClasses[maxWidth],
      padding && 'px-4 sm:px-6 lg:px-8 py-6',
      className
    )}>
      {children}
    </div>
  );
};

// 页面标题组件
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between',
      'mb-6 pb-4 border-b border-gray-200',
      className
    )}>
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// 内容区域组件
interface ContentAreaProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'bordered';
}

const ContentArea: React.FC<ContentAreaProps> = ({
  children,
  className,
  variant = 'default'
}) => {
  const variantClasses = {
    default: '',
    card: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
    bordered: 'border border-gray-200 rounded-lg p-4'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
};

// 侧边栏布局组件
interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarPosition?: 'left' | 'right';
  className?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  className
}) => {
  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  return (
    <div className={cn(
      'flex gap-6',
      sidebarPosition === 'right' && 'flex-row-reverse',
      className
    )}>
      <aside className={cn(
        'flex-shrink-0',
        widthClasses[sidebarWidth]
      )}>
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
};

// 网格布局组件
interface GridLayoutProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className,
  responsive = true
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const responsiveClasses = responsive
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : columnClasses[columns];

  return (
    <div className={cn(
      'grid',
      responsive ? responsiveClasses : columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export {
  Layout,
  PageContainer,
  PageHeader,
  ContentArea,
  SidebarLayout,
  GridLayout
};

export type {
  LayoutProps,
  PageContainerProps,
  PageHeaderProps,
  ContentAreaProps,
  SidebarLayoutProps,
  GridLayoutProps
};