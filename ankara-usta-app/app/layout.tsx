import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit, Newsreader, JetBrains_Mono } from 'next/font/google';
import './application.css';
// Keep the landing module in the root server CSS graph. The landing page is a
// client component (it owns search/wizard state); importing the module only
// from that client boundary can otherwise leave a short unstyled first paint
// during a hard refresh in dev and in Vite-based production previews.
import homeStyles from './home.module.css';
import AppFooter from './components/AppFooter';
import ConsentBanner from './components/ConsentBanner';
import ProductFrame from './components/ProductFrame';
import { prejobChatEnabled } from './lib/prejobChat';
import { getRobotsMetadata } from './lib/seoMetadata';

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

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
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
  robots: getRobotsMetadata(),
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${newsreader.variable} ${jetbrainsMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">İçeriğe Atla</a>
        <span className={homeStyles.home} aria-hidden="true" hidden />
        <ProductFrame conversations={prejobChatEnabled()}>
          {children}
        </ProductFrame>
        <AppFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
