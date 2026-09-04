import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit } from 'next/font/google';
import './application.css';
import AppFooter from './components/AppFooter';
import ConsentBanner from './components/ConsentBanner';
import ProductFrame from './components/ProductFrame';
import { prejobChatEnabled } from './lib/prejobChat';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Orkestra | Sorunu anlat, doğru zanaatkarı bul',
  description: 'Ankara’nın 9 pilot ilçesinde ev hizmeti talebi oluşturun, uygun ustaları ve kapsamı karşılaştırın.',
  openGraph: {
    title: 'Orkestra | Başkentin Zanaat Platformu',
    description: 'Sorunu anlatın; doğru hizmeti, şeffaf kapsamı ve Ankara’daki başvurusu onaylanmış ustayı birlikte bulalım.',
    images: ['/orkestra-social-preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/orkestra-social-preview.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'build-commit': process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local-working-tree',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}>
        <a href="#main-content" className="skip-link">İçeriğe Atla</a>
        <ProductFrame conversations={prejobChatEnabled()}>
          {children}
        </ProductFrame>
        <AppFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
