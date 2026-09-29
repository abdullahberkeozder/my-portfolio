import React from 'react';
import styles from './Timeline.module.css';

export type TimelineState = 'past' | 'current' | 'future' | 'success' | 'danger';

export interface TimelineItem {
  id: string;
  state?: TimelineState;
  icon?: React.ReactNode;
  step?: number;
  label: React.ReactNode;
  meta?: React.ReactNode;
  detail?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <ol className={[styles.timeline, className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item.id} className={[styles.item, item.state ? styles[item.state] : styles.future].filter(Boolean).join(' ')}>
          <div className={styles.nodeCol}>
            <div className={styles.node} aria-hidden="true">
              {item.icon ?? (item.state === 'past' || item.state === 'success' ? <CheckIcon /> : (item.step ?? null))}
            </div>
            <div className={styles.connector} aria-hidden="true" />
          </div>
          <div className={styles.content}>
            <div className={styles.label}>{item.label}</div>
            {item.meta && <div className={styles.meta}>{item.meta}</div>}
            {item.detail && <div className={styles.detail}>{item.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
