import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motif Lab | Orkestra',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MotifLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
