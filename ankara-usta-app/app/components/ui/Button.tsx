'use client';

import React, { forwardRef } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'İşleniyor…',
    fullWidth = false,
    iconOnly = false,
    iconLeft,
    iconRight,
    className = '',
    disabled,
    'aria-label': ariaLabel,
    children,
    ...props
  },
  ref
) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    fullWidth ? styles.fullWidth : '',
    iconOnly ? styles.iconOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={loading ? loadingText : ariaLabel}
      {...props}
    >
      <span className={styles.label} aria-hidden={loading || undefined}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        {children}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </span>
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerRing} />
        </span>
      )}
    </button>
  );
});

export default Button;
