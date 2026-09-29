import React from 'react';
import styles from './Badge.module.css';

export type BadgeColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'seal';
export type BadgeSize  = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
}

export default function Badge({
  color = 'neutral',
  size = 'sm',
  pill = false,
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const cls = [
    styles.badge,
    styles[color],
    styles[size],
    pill ? styles.pill : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls} {...props}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
