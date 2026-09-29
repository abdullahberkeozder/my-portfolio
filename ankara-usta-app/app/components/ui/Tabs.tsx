'use client';

import React, { useState } from 'react';
import styles from './Tabs.module.css';

/* ── Types ── */
export type TabsVariant = 'underline' | 'pill';

interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  variant?: TabsVariant;
  className?: string;
  onChange?: (id: string) => void;
  /** Controlled mode */
  activeTab?: string;
}

export default function Tabs({
  items,
  defaultTab,
  variant = 'underline',
  className = '',
  onChange,
  activeTab: controlledTab,
}: TabsProps) {
  const [internal, setInternal] = useState<string>(defaultTab ?? items[0]?.id ?? '');
  const active = controlledTab ?? internal;

  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  const activeItem = items.find((i) => i.id === active);

  return (
    <div className={[styles.tabs, styles[variant], className].filter(Boolean).join(' ')}>
      <div className={styles.list} role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={item.id === active}
            aria-controls={`tabpanel-${item.id}`}
            id={`tab-${item.id}`}
            className={[styles.tab, item.id === active ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => !item.disabled && select(item.id)}
            disabled={item.disabled}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            {item.label}
            {item.badge !== undefined && (
              <span className={styles.tabBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
            )}
          </button>
        ))}
      </div>
      {activeItem && (
        <div
          id={`tabpanel-${active}`}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className={styles.panel}
          key={active}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
