import React from 'react';

export type RequestStatusType =
  | 'draft'
  | 'submitted'
  | 'matching'
  | 'quotes_received'
  | 'provider_selected'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | string;

export interface RequestStatusBadgeProps {
  status: RequestStatusType;
  quoteCount?: number;
  className?: string;
}

export const statusToneMap: Record<
  string,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent' }
> = {
  draft: { label: 'Taslak', tone: 'warning' },
  submitted: { label: 'Gönderildi', tone: 'info' },
  matching: { label: 'Ustalar Aranıyor', tone: 'info' },
  quotes_received: { label: 'Teklifler Geldi', tone: 'success' },
  provider_selected: { label: 'Usta Seçildi', tone: 'accent' },
  completed: { label: 'Tamamlandı', tone: 'success' },
  cancelled: { label: 'İptal Edildi', tone: 'neutral' },
  expired: { label: 'Süresi Doldu', tone: 'danger' },
};

export default function RequestStatusBadge({
  status,
  quoteCount,
  className = '',
}: RequestStatusBadgeProps) {
  const config = statusToneMap[status] ?? { label: status, tone: 'neutral' };
  const label =
    status === 'quotes_received' && typeof quoteCount === 'number' && quoteCount > 0
      ? `${quoteCount} Teklif Geldi`
      : config.label;

  return (
    <span
      className={`req-status-badge req-status-${config.tone} req-status-${status} ${className}`.trim()}
      role="status"
      aria-label={`Talep durumu: ${label}`}
      data-testid="request-status-badge"
    >
      {status === 'matching' && <span className="req-status-pulse" aria-hidden="true" />}
      {label}
    </span>
  );
}
