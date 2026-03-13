import { motion } from 'framer-motion';
import styles from './Button.module.css';

const variants = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  danger: styles.danger,
  accent: styles.accent,
};

const sizes = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={[
        styles.btn,
        variants[variant],
        sizes[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : icon ? (
        <span className={styles.iconLeft}>{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className={styles.iconRight}>{iconRight}</span>}
    </motion.button>
  );
}
