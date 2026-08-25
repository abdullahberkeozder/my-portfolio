type NeighborhoodBondProps = {
  className?: string;
  decorative?: boolean;
  label?: string;
};

export default function NeighborhoodBond({
  className = '',
  decorative = true,
  label = 'Ankara Usta Mahalle Bağı',
}: NeighborhoodBondProps) {
  return (
    <span
      className={`neighborhood-bond ${className}`.trim()}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    />
  );
}
