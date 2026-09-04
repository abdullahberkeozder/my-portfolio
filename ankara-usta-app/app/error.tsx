'use client';

import Link from 'next/link';
import Button from './components/Button';
import OrchestraLogo from './components/OrchestraLogo';
import OrkestraWordmark from './components/OrkestraWordmark';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>

      <main className="system-state-shell">
        <section className="system-state-card" role="alert">
          <div className="system-state-brand"><OrchestraLogo size={44} /><OrkestraWordmark /></div>
          <span>SAYFA YÜKLENEMEDİ</span>
          <h1>Bu alan şu anda yüklenemedi</h1>
          <p>Yeniden deneyebilirsiniz. Bir işlem gönderdiyseniz tekrar göndermeden önce güncel kaydı kontrol edin.</p>
          <div className="system-state-actions">
            <Button type="button" onClick={reset}>Yeniden dene</Button>
            <Link href="/">Ana sayfaya dön</Link>
          </div>
        </section>
      </main>
    </>
  );
}
