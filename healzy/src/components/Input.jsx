import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={[styles.container, containerClassName].join(' ')}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.iconLeft}>{icon}</span>}
        <input
          ref={ref}
          type={type}
          className={[
            styles.input,
            icon ? styles.hasIconLeft : '',
            iconRight ? styles.hasIconRight : '',
            error ? styles.hasError : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
