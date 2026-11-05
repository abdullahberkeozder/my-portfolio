type IconProps = { size?: number; className?: string };

function Icon({ children, size = 20, className = '' }: IconProps & { children: React.ReactNode }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export const IconClose = (props: IconProps) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const IconEdit = (props: IconProps) => <Icon {...props}><path d="m4 16-.7 4.7L8 20l10.6-10.6a2.2 2.2 0 0 0-3.1-3.1L4.9 16.9Z" /><path d="m14 7 3 3" /></Icon>;
export const IconLocation = (props: IconProps) => <Icon {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></Icon>;
export const IconCalendar = (props: IconProps) => <Icon {...props}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M7 3v4M17 3v4M3.5 9h17" /></Icon>;
export const IconLock = (props: IconProps) => <Icon {...props}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>;
export const IconShield = (props: IconProps) => <Icon {...props}><path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>;
