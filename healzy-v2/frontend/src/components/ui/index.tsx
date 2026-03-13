'use client';

import { cn, getInitials, generateAvatarColor } from '@/utils/helpers';
import Image from 'next/image';

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const dotMap = {
  xs: 'w-1.5 h-1.5 -bottom-px -right-px',
  sm: 'w-2 h-2 bottom-0 right-0',
  md: 'w-2.5 h-2.5 bottom-0 right-0',
  lg: 'w-3 h-3 bottom-0.5 right-0.5',
  xl: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
  '2xl': 'w-4 h-4 bottom-1 right-1',
};

export function Avatar({ name = '', src, size = 'md', online, className }: AvatarProps) {
  const initials = getInitials(name.split(' ')[0] || '', name.split(' ')[1] || '');
  const color = generateAvatarColor(name);

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div className={cn('rounded-full flex items-center justify-center overflow-hidden font-semibold select-none', sizeMap[size])}>
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center text-white', sizeMap[size])} style={{ backgroundColor: color }}>
            {initials || '?'}
          </div>
        )}
      </div>
      {online !== undefined && (
        <span className={cn(
          'absolute rounded-full border-2 border-white dark:border-slate-900',
          dotMap[size],
          online ? 'bg-green-400' : 'bg-slate-400'
        )} />
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
};

const dotVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

export function Badge({ variant = 'default', children, size = 'md', dot, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      badgeVariants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotVariants[variant])} />}
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className={cn('spinner', s, className)} />
  );
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)] z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-glow">
          <span className="text-white text-xl font-bold font-heading">H</span>
        </div>
        <Spinner size="md" />
      </div>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (v: number) => void;
  className?: string;
}

export function StarRating({ value, max = 5, size = 'md', interactive, onChange, className }: StarRatingProps) {
  const starSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < value;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn('transition-transform', interactive && 'hover:scale-110 cursor-pointer')}
          >
            <svg className={cn(starSize, filled || half ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600')} fill="currentColor" viewBox="0 0 20 20">
              {half ? (
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              ) : null}
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ children, className, hover, padding = 'md', onClick }: CardProps) {
  const padMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div
      onClick={onClick}
      className={cn(
        'card',
        padMap[padding],
        hover && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 rounded', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-1/3" />
        </div>
      </div>
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-3/4" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl mb-2">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 font-heading">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-[var(--bg-secondary)] rounded-2xl shadow-dialog overflow-hidden animate-slide-up', sizeMap[size], className)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h2 className="font-semibold text-lg font-heading">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-400',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
