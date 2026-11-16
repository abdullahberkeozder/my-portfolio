'use client';

import React from 'react';
import { MacThemeToggle } from './MacThemeToggle';

export interface AquariumToggleProps {
  /** If true, sizes the toggle to fit compactly in navigation bars */
  compact?: boolean;
  /** Custom width in CSS px for compact mode (default: 80px) */
  compactWidth?: number;
  /** Extra container styling */
  className?: string;
}

export const AquariumToggle = React.memo<AquariumToggleProps>(function AquariumToggle({
  compact = false,
  className = '',
}) {
  return <MacThemeToggle size={compact ? 'compact' : 'default'} className={className} />;
});
