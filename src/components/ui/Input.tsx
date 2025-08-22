import React from 'react';
import { cn } from '../../lib/utils';
import { Search, Eye, EyeOff, X } from 'lucide-react';

// 基础输入框组件
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search';
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    variant = 'default',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseClasses = [
      'flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2',
      'text-sm placeholder:text-gray-500 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50'
    ].join(' ');

    const variantClasses = {
      default: '',
      search: 'pl-10'
    };

    const errorClasses = error ? [
      'border-red-300 focus:ring-red-500 focus:border-transparent'
    ].join(' ') : '';

    const containerClasses = cn(
      'relative',
      disabled && 'opacity-50'
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className={containerClasses}>
          {/* 左侧图标 */}
          {(leftIcon || variant === 'search') && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {variant === 'search' ? (
                <Search className="h-4 w-4" />
              ) : (
                leftIcon
              )}
            </div>
          )}
          
          {/* 输入框 */}
          <input
            type={inputType}
            className={cn(
              baseClasses,
              variantClasses[variant],
              errorClasses,
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {/* 右侧图标 */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {/* 错误信息或帮助文本 */}
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

// 搜索输入框组件
interface SearchInputProps extends Omit<InputProps, 'variant' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    onSearch,
    onClear,
    showClearButton = true,
    onChange,
    value,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || '');
    const displayValue = value !== undefined ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);
      onSearch?.(newValue);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('');
      }
      onClear?.();
      onSearch?.('');
    };

    let clearButton;
    if (showClearButton && displayValue) {
      clearButton = (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      );
    }

    return (
      <Input
        ref={ref}
        variant="search"
        value={displayValue}
        onChange={handleChange}
        rightIcon={clearButton}
        {...props}
      />
    );
  }
);

// Textarea 组件
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    helperText,
    resize = true,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      'flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2',
      'text-sm placeholder:text-gray-500 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50'
    ].join(' ');

    const errorClasses = error ? [
      'border-red-300 focus:ring-red-500 focus:border-transparent'
    ].join(' ') : '';

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <textarea
          className={cn(
            baseClasses,
            errorClasses,
            !resize && 'resize-none',
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
SearchInput.displayName = 'SearchInput';
Textarea.displayName = 'Textarea';

export { Input, SearchInput, Textarea };
export type { InputProps, SearchInputProps, TextareaProps };