import React from 'react';
import {
  REQUEST_STATUS_DICTIONARY,
  type RequestStatus,
  type StatusTone,
} from '../lib/requestStatusResolver';

export type RequestStatusType = RequestStatus | string;

export interface RequestStatusBadgeProps {
  status: RequestStatusType;
  quoteCount?: number;
  className?: string;
}

export const statusToneMap: Record<
  string,
  { label: string; tone: StatusTone; description?: string }
> = REQUEST_STATUS_DICTIONARY;

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
