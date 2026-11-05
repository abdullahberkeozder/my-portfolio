type OrchestraLogoProps = {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
  variant?: 'primary' | 'inverse';
};

// Baked coordinates for the 4 Birlik lobes around center (50, 50).
// Pre-computed so no CSS transform or browser transform-origin can distort the unity.
const NORTH_LOBE =
  'M43 12C32 7 16 17 10 30C4 43 9 52 20 49C34 45 48 34 49 24C50 18 48 14 43 12Z';
const EAST_LOBE =
  'M88 43C93 32 83 16 70 10C57 4 48 9 51 20C55 34 66 48 76 49C82 50 86 48 88 43Z';
const SOUTH_LOBE =
  'M57 88C68 93 84 83 90 70C96 57 91 48 80 51C66 55 52 66 51 76C50 82 52 86 57 88Z';
const WEST_LOBE =
  'M12 57C7 68 17 84 30 90C43 96 52 91 49 80C45 66 34 52 24 51C18 50 14 52 12 57Z';

/**
 * Orkestra "Birlik" Mark (Seçenek A: Çapraz Birlik - Mavi & Yeşil)
 * 4 fluid interlocking lobes representing customer and craftsperson unity:
 * - North & South: Cobalt Blue (#1246B5)
 * - East & West: Forest Emerald Green (#0E6F47)
 */
export default function OrchestraLogo({
  size = 36,
  className = '',
  color,
  accentColor,
  variant = 'primary',
}: OrchestraLogoProps) {
  const isInverse = variant === 'inverse';

  // Base fill for North & South (Customer / Platform)
  const primaryFill =
    color ?? (isInverse ? '#FFFFFF' : 'var(--brand-cobalt, #1246B5)');

  // Accent fill for East & West (Usta / Craftsperson)
  const secondaryFill =
    accentColor ??
    (color ? color : isInverse ? '#FFFFFF' : 'var(--tr-forest-green, #0E6F47)');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`orchestra-directional-logo ${className}`}
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'hidden', display: 'block' }}
    >
      <g className="orchestra-modules">
        <path
          className="birlik-lobe module-north"
          d={NORTH_LOBE}
          fill={primaryFill}
        />
        <path
          className="birlik-lobe module-east"
          d={EAST_LOBE}
          fill={secondaryFill}
        />
        <path
          className="birlik-lobe module-south"
          d={SOUTH_LOBE}
          fill={primaryFill}
        />
        <path
          className="birlik-lobe module-west"
          d={WEST_LOBE}
          fill={secondaryFill}
        />
      </g>
    </svg>
  );
}
