import React from 'react';

export type BondVariant =
  | 'brand'
  | 'matching'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'decor';

type NeighborhoodBondProps = {
  variant?: BondVariant;
  className?: string;
  size?: number | string;
  decorative?: boolean;
  label?: string;
};

export default function NeighborhoodBond({
  variant = 'brand',
  className = '',
  size,
  decorative = true,
  label = 'Orkestra Mahalle Bağı',
}: NeighborhoodBondProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  const renderIcon = () => {
    switch (variant) {
      case 'verified':
        return (
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-verified">
            <defs>
              <linearGradient id="verifiedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d7a5f" />
                <stop offset="100%" stopColor="#146f93" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="20" height="20" rx="6" transform="rotate(45 14 14)" fill="url(#verifiedGrad)" />
            <path d="M9.5 14L12.5 17L18.5 11" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'matching':
        return (
          <svg viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-matching">
            {/* Customer ring (Emerald Green) */}
            <circle cx="16" cy="14" r="10" stroke="#0d7a5f" strokeWidth="3" fill="none" />
            {/* Tradesperson ring (Ankara Blue) */}
            <circle cx="28" cy="14" r="10" stroke="#166088" strokeWidth="3" fill="none" />
            {/* Interlocking central lens bridge */}
            <path d="M22 6.8C24.5 8.8 26 11.2 26 14C26 16.8 24.5 19.2 22 21.2C19.5 19.2 18 16.8 18 14C18 11.2 19.5 8.8 22 6.8Z" fill="#0d7a5f" fillOpacity="0.22" />
          </svg>
        );

      case 'in_progress':
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-in-progress">
            <circle cx="16" cy="16" r="13" stroke="#166088" strokeWidth="2.5" strokeDasharray="16 6" strokeLinecap="round" fill="none" />
            <circle cx="16" cy="16" r="5" fill="#0d7a5f" />
          </svg>
        );

      case 'completed':
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-completed">
            <circle cx="16" cy="16" r="14" stroke="#0d7a5f" strokeWidth="2.5" fill="#eaf5f0" />
            <path d="M10.5 16L14 19.5L21.5 12" stroke="#0d7a5f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'decor':
        return (
          <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-decor">
            <defs>
              <linearGradient id="heroHouseGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d7a5f" />
                <stop offset="100%" stopColor="#074e3c" />
              </linearGradient>
              <linearGradient id="heroHouseGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#166088" />
                <stop offset="100%" stopColor="#0f435f" />
              </linearGradient>
              <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d7a5f" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#166088" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0d7a5f" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Outer Calibration Ring */}
            <circle cx="140" cy="140" r="130" stroke="url(#heroRingGrad)" strokeWidth="4" strokeDasharray="10 8" />
            <circle cx="140" cy="140" r="118" stroke="#0d7a5f" strokeOpacity="0.08" strokeWidth="2" />

            {/* Precision Tick Marks */}
            <circle cx="140" cy="10" r="3" fill="#0d7a5f" fillOpacity="0.4" />
            <circle cx="270" cy="140" r="3" fill="#166088" fillOpacity="0.4" />
            <circle cx="140" cy="270" r="3" fill="#0d7a5f" fillOpacity="0.4" />
            <circle cx="10" cy="140" r="3" fill="#166088" fillOpacity="0.4" />

            {/* Solid Architectural Base Shadow */}
            <ellipse cx="140" cy="218" rx="85" ry="12" fill="#0d7a5f" fillOpacity="0.06" />

            {/* Architectural House / Workshop Structure */}
            {/* Left Building (Deep Emerald) */}
            <path d="M68 140L140 82L178 112V210H68V140Z" fill="url(#heroHouseGrad1)" />
            {/* Roof Peak highlight */}
            <path d="M60 144L140 78L220 144" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />

            {/* Right Tower / Module (Ankara Blue) */}
            <rect x="156" y="118" width="56" height="92" rx="4" fill="url(#heroHouseGrad2)" />

            {/* Windows / Precision Blueprint Panes */}
            <rect x="92" y="152" width="22" height="26" rx="3" fill="#ffffff" fillOpacity="0.95" />
            <rect x="172" y="136" width="24" height="24" rx="3" fill="#ffffff" fillOpacity="0.95" />
            <rect x="172" y="172" width="24" height="24" rx="3" fill="#ffffff" fillOpacity="0.95" />

            {/* Interlocking Ribbon Foundation (Mahalle Bağı) */}
            <path
              d="M78 208C98 198 120 196 140 208C160 220 182 220 202 208"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M78 208C98 198 120 196 140 208C160 220 182 220 202 208"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'brand':
      default:
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="bond-svg bond-svg-brand">
            <defs>
              <linearGradient id="brandLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d7a5f" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#166088" />
              </linearGradient>
            </defs>
            {/* Architectural House / Roof Silhouette */}
            <path d="M6 16L18 6L30 16" stroke="url(#brandLogoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Interlocking Infinite Craft Knot Foundation */}
            <path
              d="M10 21C8 19 6 22 6 25C6 28 9 30 12 30C15 30 17 27 18 25C19 23 21 20 24 20C27 20 30 22 30 25C30 28 28 30 25 30C22 30 20 27 18 25"
              stroke="url(#brandLogoGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center Anchor Point */}
            <circle cx="18" cy="15" r="2.2" fill="#166088" />
          </svg>
        );
    }
  };

  return (
    <span
      className={`neighborhood-bond bond-role-${variant} ${className}`.trim()}
      style={sizeStyle}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      {renderIcon()}
    </span>
  );
}
