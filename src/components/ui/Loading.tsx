import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderSpinner = () => (
    <svg
      className={cn(
        'animate-spin text-blue-600',
        sizes[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => {
    const dotSize = {
      sm: 'w-1 h-1',
      md: 'w-1.5 h-1.5',
      lg: 'w-2 h-2'
    };

    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-blue-600 rounded-full animate-pulse',
              dotSize[size]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => {
    const pulseSize = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return (
      <div className={cn('relative', pulseSize[size], className)}>
        <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20" />
        <div className="absolute inset-2 bg-blue-600 rounded-full animate-pulse" />
      </div>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-gray-600 font-medium',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

// 全屏加载组件
interface FullScreenLoadingProps {
  isVisible: boolean;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  isVisible,
  text = '加载中...',
  variant = 'spinner'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center space-y-4">
        <Loading size="lg" variant={variant} />
        <p className="text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
};

// 内联加载组件
interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  text,
  size = 'sm',
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loading size={size} variant="spinner" />
      {text && (
        <span className="text-gray-600 text-sm">{text}</span>
      )}
    </div>
  );
};

// 骨架屏组件
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = true
}) => {
  const baseClasses = [
    'bg-gray-200',
    animation && 'animate-pulse'
  ].filter(Boolean).join(' ');

  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
};

export {
  Loading,
  FullScreenLoading,
  InlineLoading,
  Skeleton
};

export type {
  LoadingProps,
  FullScreenLoadingProps,
  InlineLoadingProps,
  SkeletonProps
};