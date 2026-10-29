import Link from 'next/link';
import OrchestraLogo from './components/OrchestraLogo';
import OrkestraWordmark from './components/OrkestraWordmark';

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  borderRadius: '20px',
  border: '1.5px solid var(--border-default)',
  background: '#fff',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'border-color 150ms ease, background 150ms ease',
};

export default function NotFound() {
  return (
    <main className="account-shell not-found-page">
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <div className="system-state-brand">
          <OrchestraLogo size={44} />
          <OrkestraWordmark />
        </div>
        <span
          style={{
            display: 'block',
            marginTop: '24px',
            color: 'var(--action-primary)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.09em',
          }}
        >
          404 — SAYFA BULUNAMADI
        </span>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            color: 'var(--text-primary)',
            margin: '12px 0 16px',
            letterSpacing: '-0.025em',
            fontWeight: 700,
          }}
        >
          Aradığınız sayfa veya hizmet bulunamadı
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Ulaşmak istediğiniz sayfa taşınmış, silinmiş ya da adresi yanlış yazılmış olabilir.
          Ankara’daki doğrulanmış ustaları doğrudan arayabilir veya harita üzerinden keşfedebilirsiniz.
        </p>

        {/* Quick Search Recovery Bar */}
        <form
          action="/ustalar"
          method="GET"
          style={{
            margin: '0 auto 20px',
            maxWidth: '460px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            name="service"
            placeholder="Hizmet veya arıza arayın (örn. Kombi, musluk)..."
            aria-label="Hizmet ara"
            style={{
              flex: 1,
              height: '46px',
              padding: '0 16px',
              borderRadius: 'var(--radius-control)',
              border: '1.5px solid var(--border-default)',
              background: '#ffffff',
              fontSize: '14px',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              height: '46px',
              padding: '0 20px',
              borderRadius: 'var(--radius-control)',
              background: 'var(--action-primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Usta Bul
          </button>
        </form>

        {/* Popular Category Recovery Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '36px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Hızlı erişim:
          </span>
          <Link href="/ustalar?service=tesisat" style={chipStyle}>
            Su Tesisatı
          </Link>
          <Link href="/ustalar?service=elektrik" style={chipStyle}>
            Elektrik
          </Link>
          <Link href="/ustalar?service=mobilya-montaj" style={chipStyle}>
            Mobilya Montajı
          </Link>
          <Link href="/ustalar?service=boya-badana" style={chipStyle}>
            Boya & Badana
          </Link>
        </div>

        {/* Primary Navigation Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/concepts/harita"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 24px',
              height: '46px',
              borderRadius: 'var(--radius-control)',
              background: 'var(--action-primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Ankara Usta Haritası →
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 22px',
              height: '46px',
              borderRadius: 'var(--radius-control)',
              border: '1.5px solid var(--border-default)',
              background: '#ffffff',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/yardim"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 20px',
              height: '46px',
              borderRadius: 'var(--radius-control)',
              border: '1.5px solid var(--border-default)',
              background: '#ffffff',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Yardım
          </Link>
        </div>
      </div>
    </main>
  );
}
