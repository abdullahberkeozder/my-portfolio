import React from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-control)',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <span
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
