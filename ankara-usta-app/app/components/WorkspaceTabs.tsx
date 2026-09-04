'use client';
import { useId } from 'react';

export default function WorkspaceTabs<T extends string>({ items, active, onChange, label, panelId }: {
  items: { id: T; label: string }[]; active: T; onChange: (value: T) => void; label: string; panelId: string;
}) {
  const groupId = useId();
  return <nav className="workspace-tabs-nav" role="tablist" aria-label={label}>
    {items.map((item, index) => <button key={item.id} id={`${panelId}-tab-${item.id}`} type="button" role="tab"
      className={`ws-tab-btn ${active === item.id ? 'active' : ''}`} aria-selected={active === item.id}
      aria-controls={panelId} tabIndex={active === item.id ? 0 : -1} data-tab-group={groupId}
      onClick={() => onChange(item.id)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % items.length
          : event.key === 'ArrowLeft' ? (index + items.length - 1) % items.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); onChange(items[next].id);
        document.getElementById(`${panelId}-tab-${items[next].id}`)?.focus();
      }}>{item.label}</button>)}
  </nav>;
}
