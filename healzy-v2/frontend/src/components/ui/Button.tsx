'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-glow',
  secondary: 'bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-950 dark:hover:bg-primary-900 dark:text-primary-300',
  outline: 'border border-slate-200 hover:border-primary-400 hover:bg-primary-50 text-slate-700 dark:border-slate-700 dark:hover:border-primary-600 dark:text-slate-200 dark:hover:bg-primary-950',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
};

const sizeClasses: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  xl: 'px-7 py-3.5 text-base gap-2.5 rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="spinner w-4 h-4 flex-shrink-0" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
