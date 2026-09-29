import React from 'react';
import styles from './Avatar.module.css';

export type AvatarSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type AvatarStatus = 'online' | 'busy' | 'offline';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;           // For initials fallback
  size?: AvatarSize;
  verified?: boolean;
  status?: AvatarStatus;
  className?: string;
}

/** Derive up to 2 initials from a name */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const CheckIcon = () => (
  <svg width="60%" height="60%" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  verified = false,
  status,
  className = '',
}: AvatarProps) {
  const cls = [
    styles.wrapper,
    styles[size],
    status ? styles[status] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls}>
      {src ? (
        <img
          className={styles.image}
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          width={96}
          height={96}
          loading="lazy"
        />
      ) : (
        <span className={styles.initials} aria-label={name}>
          {name ? initials(name) : '?'}
        </span>
      )}
      {verified && (
        <span className={styles.verifiedBadge} aria-label="Doğrulanmış usta">
          <CheckIcon />
        </span>
      )}
      {status && (
        <span className={styles.statusDot} role="status" aria-label={status} />
      )}
    </span>
  );
}
