import React from 'react';
import styles from './Card.module.css';

export type CardVariant = 'elevated' | 'flat' | 'interactive' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: React.ElementType;
}

export default function Card({
  variant = 'elevated',
  padding = 'md',
  as: Tag = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  const padMap: Record<CardPadding, string> = {
    none: styles.padNone,
    sm:   styles.padSm,
    md:   styles.padMd,
    lg:   styles.padLg,
  };

  const cls = [
    styles.card,
    styles[variant],
    padMap[padding],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
