type OrchestraLogoProps = {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
  variant?: 'emerald' | 'dark' | 'burgundy' | 'gold' | 'white' | 'pistachio';
};

const variantColors: Record<NonNullable<OrchestraLogoProps['variant']>, string> = {
  emerald: '#0d7a5f',
  pistachio: '#e3fed3',
  dark: '#182608',
  burgundy: '#3D0F19',
  gold: '#eab308',
  white: '#ffffff',
};

/** Six equal modules form a house, a local network and an assembled team. */
export default function OrchestraLogo({
  size = 36,
  className = '',
  color,
  variant = 'emerald',
}: OrchestraLogoProps) {
  const fill = color ?? variantColors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`orchestra-directional-logo ${className}`}
      aria-hidden="true"
    >
      <g fill={fill} className="orchestra-modules">
        <rect className="orchestra-module module-apex" x="34" y="0" width="20" height="20" />
        <polygon className="orchestra-module module-left-roof" points="24,16 38,30 24,44 10,30" />
        <polygon className="orchestra-module module-right-roof" points="64,16 78,30 64,44 50,30" />
        <rect className="orchestra-module module-left-base" x="4" y="44" width="20" height="20" />
        <rect className="orchestra-module module-center-base" x="34" y="44" width="20" height="20" />
        <rect className="orchestra-module module-right-base" x="64" y="44" width="20" height="20" />
      </g>
    </svg>
  );
}
