type Props = {
  size?: number;
  textColor?: string;
  markColor?: string;
  inverse?: boolean;
};

export default function TaskrabbitBrandLogo({
  size = 32,
  textColor = '#201914',
  markColor = '#9C724A',
  inverse = false,
}: Props) {
  const foreground = inverse ? '#FAF7F2' : textColor;
  const brandMark = inverse ? '#D4AF37' : markColor;
  return (
    <span
      aria-label="Orkestra"
      role="img"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: foreground, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" fill="none">
        <circle cx="10" cy="10" r="7" fill={brandMark} />
        <circle cx="22" cy="10" r="7" fill={brandMark} opacity=".82" />
        <circle cx="10" cy="22" r="7" fill={brandMark} opacity=".82" />
        <circle cx="22" cy="22" r="7" fill={brandMark} />
      </svg>
      <span style={{ fontSize: Math.max(18, Math.round(size * 0.68)), fontFamily: 'var(--font-outfit), sans-serif' }}>orkestra</span>
    </span>
  );
}

