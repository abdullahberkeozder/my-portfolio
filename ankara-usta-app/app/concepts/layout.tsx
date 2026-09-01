import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concepts | Ankara Usta',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConceptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
