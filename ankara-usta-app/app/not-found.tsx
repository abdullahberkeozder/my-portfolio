import Link from 'next/link';
import OrchestraLogo from './components/OrchestraLogo';
import OrkestraWordmark from './components/OrkestraWordmark';

export default function NotFound() {
  return (
    <main className="account-shell not-found-page">

      <div style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div className="system-state-brand"><OrchestraLogo size={44} /><OrkestraWordmark /></div>
        <span style={{ display: 'block', marginTop: '24px', color: 'var(--action-primary)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em' }}>
          404 — SAYFA BULUNAMADI
        </span>
        <h1 style={{ fontSize: '36px', color: 'var(--text-primary)', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>
          Aradığınız iş veya sayfa mevcut değil
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
          Ulaşmak istediğiniz sayfa taşınmış, silinmiş ya da adresi yanlış yazılmış olabilir. Ankara’daki güvenilir ustaları keşfetmek için ana sayfaya dönebilirsiniz.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="dialog-primary" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', height: '48px', borderRadius: 'var(--radius-control)', background: 'var(--action-primary)', color: '#fff', fontWeight: 700 }}>
            Ana Sayfaya Dön
          </Link>
          <Link href="/yardim" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', height: '48px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-default)', background: '#fff', color: 'var(--text-primary)', fontWeight: 700 }}>
            Yardım Merkezi
          </Link>
        </div>
      </div>
    </main>
  );
}
