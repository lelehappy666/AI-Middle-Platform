import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ].join(' ');

    const variants = {
      primary: [
        'bg-blue-600 text-white shadow-lg shadow-blue-600/25',
        'hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30',
        'active:bg-blue-800'
      ].join(' '),
      secondary: [
        'bg-gray-100 text-gray-900 border border-gray-200',
        'hover:bg-gray-200 hover:border-gray-300',
        'active:bg-gray-300'
      ].join(' '),
      ghost: [
        'bg-transparent text-gray-700 border border-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'active:bg-gray-200'
      ].join(' '),
      danger: [
        'bg-red-600 text-white shadow-lg shadow-red-600/25',
        'hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30',
        'active:bg-red-800'
      ].join(' ')
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };