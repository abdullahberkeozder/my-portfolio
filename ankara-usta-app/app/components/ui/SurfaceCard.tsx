import { forwardRef, type HTMLAttributes } from 'react';

const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SurfaceCard({ className = '', ...props }, ref) {
  return <div ref={ref} className={`surface-card ${className}`.trim()} {...props} />;
});

export default SurfaceCard;
