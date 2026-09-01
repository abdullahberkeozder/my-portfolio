import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inspiration | Ankara Usta',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InspirationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
