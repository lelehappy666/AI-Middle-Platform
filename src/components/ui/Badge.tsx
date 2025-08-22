import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-full',
    'transition-all duration-200',
    'border',
    onClick && 'cursor-pointer hover:shadow-sm'
  ].filter(Boolean).join(' ');

  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    success: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// 带图标的Badge组件
interface IconBadgeProps extends BadgeProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const IconBadge: React.FC<IconBadgeProps> = ({
  children,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  return (
    <Badge {...props}>
      <div className="flex items-center space-x-1">
        {icon && iconPosition === 'left' && (
          <span className="w-3 h-3">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="w-3 h-3">{icon}</span>
        )}
      </div>
    </Badge>
  );
};

// 数字Badge组件
interface NumberBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
  variant?: 'default' | 'primary' | 'danger';
}

const NumberBadge: React.FC<NumberBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  className,
  variant = 'danger'
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  const variants = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    danger: 'bg-red-500'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[1.25rem] h-5 px-1',
        'text-xs font-medium text-white',
        'rounded-full',
        variants[variant],
        className
      )}
    >
      {displayCount}
    </span>
  );
};

// 状态Badge组件
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  showText?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = false,
  className
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: '在线',
      textColor: 'text-green-800',
      bgColor: 'bg-green-100'
    },
    offline: {
      color: 'bg-gray-500',
      text: '离线',
      textColor: 'text-gray-800',
      bgColor: 'bg-gray-100'
    },
    busy: {
      color: 'bg-red-500',
      text: '忙碌',
      textColor: 'text-red-800',
      bgColor: 'bg-red-100'
    },
    away: {
      color: 'bg-yellow-500',
      text: '离开',
      textColor: 'text-yellow-800',
      bgColor: 'bg-yellow-100'
    }
  };

  const config = statusConfig[status];

  if (showText) {
    return (
      <Badge
        variant="default"
        size="sm"
        className={cn(
          config.bgColor,
          config.textColor,
          'border-transparent',
          className
        )}
      >
        <div className="flex items-center space-x-1">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <span>{config.text}</span>
        </div>
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full border-2 border-white',
        config.color,
        className
      )}
    />
  );
};

// 可关闭的Badge组件
interface DismissibleBadgeProps extends BadgeProps {
  onDismiss?: () => void;
}

const DismissibleBadge: React.FC<DismissibleBadgeProps> = ({
  children,
  onDismiss,
  ...props
}) => {
  return (
    <Badge {...props}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </Badge>
  );
};

export {
  Badge,
  IconBadge,
  NumberBadge,
  StatusBadge,
  DismissibleBadge
};

export type {
  BadgeProps,
  IconBadgeProps,
  NumberBadgeProps,
  StatusBadgeProps,
  DismissibleBadgeProps
};