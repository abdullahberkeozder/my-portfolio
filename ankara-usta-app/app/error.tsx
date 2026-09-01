'use client';

import Link from 'next/link';
import AppHeader from './components/AppHeader';
import Button from './components/Button';
import NeighborhoodBond from './components/NeighborhoodBond';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <AppHeader />
      <main className="system-state-shell">
        <section className="system-state-card" role="alert">
          <NeighborhoodBond variant="brand" className="system-state-mark" />
          <span>BAĞLANTI KESİLDİ</span>
          <h1>Bu alan şu anda yüklenemedi</h1>
          <p>Kaydettiğiniz bilgiler korunur. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.</p>
          <div className="system-state-actions">
            <Button type="button" onClick={reset}>Yeniden dene</Button>
            <Link href="/">Ana sayfaya dön</Link>
          </div>
        </section>
      </main>
    </>
  );
}
