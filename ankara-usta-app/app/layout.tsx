import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ankara Usta | Sorunu anlat, doğru ustayı bul',
  description: 'Ankara’da doğrulanmış yerel ustalarla şeffaf kapsam, teklif ve iş takibi.',
  openGraph: {
    title: 'Ankara Usta | İşin kanıtıyla',
    description: 'Sorunu anlatın; doğru hizmeti, kapsamı ve Ankara’daki uygun ustayı birlikte bulalım.',
    images: ['/ankara-usta-social-preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/ankara-usta-social-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
