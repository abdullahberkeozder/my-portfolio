import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NovaBlog Enterprise | Spring AI & Next.js Showcase',
  description:
    'Full-Stack Enterprise Blog Platform - Spring Boot 4.1.1, Java 22 Virtual Threads, Spring AI Vektör Arama & Next.js 16. Geliştirici: Abdullah Berke Özder',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
