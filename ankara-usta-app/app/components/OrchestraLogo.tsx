type OrchestraLogoProps = {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
  variant?: 'primary' | 'inverse' | 'emerald' | 'dark' | 'burgundy' | 'gold' | 'white' | 'pistachio';
};

/** Preserved five-circle mark. Primary is cobalt; inverse is yellow. */
export default function OrchestraLogo({
  size = 36,
  className = '',
  color,
  accentColor,
  variant = 'primary',
}: OrchestraLogoProps) {
  const inverse = ['inverse', 'white', 'pistachio'].includes(variant);
  const fill = color ?? (inverse ? 'var(--brand-yellow, #FFDD00)' : 'var(--brand-cobalt, #1246B5)');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`orchestra-directional-logo ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g fill={fill} className="orchestra-modules">
        <circle className="orchestra-module module-north" cx="48" cy="20" r="17" />
        <circle className="orchestra-module module-west" cx="20" cy="48" r="17" />
        <circle className="orchestra-module module-south" cx="48" cy="76" r="17" />
        <circle className="orchestra-module module-east" cx="76" cy="48" r="17" fill={accentColor ?? fill} />
        <circle className="orchestra-module module-core" cx="48" cy="48" r="12" fill={fill} />
      </g>
    </svg>
  );
}
