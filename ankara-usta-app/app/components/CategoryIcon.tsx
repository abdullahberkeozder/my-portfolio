import React from 'react';

export interface CategoryIconProps extends React.SVGProps<SVGSVGElement> {
  categoryId: string;
  size?: number | string;
  className?: string;
}

export function CategoryIcon({
  categoryId,
  size = 24,
  className = '',
  ...props
}: CategoryIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: `category-icon category-icon-${categoryId} ${className}`.trim(),
    'aria-hidden': true,
    ...props,
  };

  switch (categoryId) {
    case 'montaj':
      return (
        <svg {...commonProps}>
          {/* Architectural Isometric Modular Joinery & Precision Dovetail Cube */}
          <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" strokeWidth="1.75" />
          <path d="M12 2.5V12M12 12L20.5 7.4M12 12L3.5 7.4" strokeWidth="1.5" />
          <path d="M12 12V21.5" strokeWidth="1.5" />
          <circle cx="12" cy="7.2" r="1.2" fill="currentColor" />
          <circle cx="7.8" cy="14.4" r="1.2" fill="currentColor" />
          <circle cx="16.2" cy="14.4" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'elektrik':
      return (
        <svg {...commonProps}>
          {/* Precision Energy Flux & High-Voltage Circuit Geometric Node */}
          <path d="M13 2.5L4.5 13H11.5L10.5 21.5L19.5 11H12.5L13 2.5Z" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="8.5" strokeDasharray="2 3" strokeWidth="1.2" opacity="0.4" />
        </svg>
      );

    case 'tesisat':
      return (
        <svg {...commonProps}>
          {/* Laminar Flow Fluid Teardrop & Concentric Pressure Valve Coupling */}
          <path d="M12 2.8C12 2.8 5.5 10.2 5.5 14.5C5.5 18.09 8.41 21 12 21C15.59 21 18.5 18.09 18.5 14.5C18.5 10.2 12 2.8 12 2.8Z" strokeWidth="1.75" />
          <path d="M9 14.5C9 16.16 10.34 17.5 12 17.5" strokeWidth="1.6" />
          <circle cx="12" cy="14.5" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'boya-tadilat':
      return (
        <svg {...commonProps}>
          {/* Architectural Drafting Roller & Precise 45-Degree Paint Stroke Ribbon */}
          <rect x="3.5" y="3.5" width="14" height="5.5" rx="1.75" strokeWidth="1.75" />
          <path d="M17.5 6.25H19.5C20.33 6.25 21 6.92 21 7.75V10.5C21 11.33 20.33 12 19.5 12H11C10.17 12 9.5 12.67 9.5 13.5V19.5" strokeWidth="1.75" />
          <path d="M8 19.5H11" strokeWidth="2" strokeLinecap="round" />
          <path d="M5.5 13.5L3.5 15.5" strokeWidth="1.5" opacity="0.6" />
          <path d="M7 16.5L5 18.5" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );

    case 'kaynak-demir':
      return (
        <svg {...commonProps}>
          {/* Structural I-Beam Girder with 4-Point Radiant Arc Welding Starburst */}
          <path d="M4 4.5H20M4 19.5H20" strokeWidth="2" />
          <path d="M12 4.5V19.5" strokeWidth="2" />
          <path d="M4 8.5H7.5M16.5 8.5H20" strokeWidth="1.4" opacity="0.6" />
          <path d="M4 15.5H7.5M16.5 15.5H20" strokeWidth="1.4" opacity="0.6" />
          {/* Radiant Spark Center */}
          <path d="M12 9.5L12.8 11.2L14.5 12L12.8 12.8L12 14.5L11.2 12.8L9.5 12L11.2 11.2Z" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'temizlik':
      return (
        <svg {...commonProps}>
          {/* Luxury Astronomical 4-Point Sparkle Crystal Cluster */}
          <path d="M11 2.5C11 6.5 7.5 10 3.5 10C7.5 10 11 13.5 11 17.5C11 13.5 14.5 10 18.5 10C14.5 10 11 6.5 11 2.5Z" strokeWidth="1.75" fill="rgba(13,122,95,0.08)" />
          <path d="M18 14.5C18 16.5 16.2 18 14.5 18C16.2 18 18 19.5 18 21.5C18 19.5 19.8 18 21.5 18C19.8 18 18 16.5 18 14.5Z" strokeWidth="1.4" fill="currentColor" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
  }
}

