import Link from 'next/link';
import AppHeader from './AppHeader';

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; items?: string[] }>;
};

export default function InfoPage({ eyebrow, title, intro, sections }: InfoPageProps) {
  return (
    <main className="account-shell info-page">
      <AppHeader role="visitor" />
      <div style={{ maxWidth: '820px', margin: '40px auto 80px', padding: '0 20px' }}>
        <Link className="account-back" href="/" style={{ marginBottom: '24px', display: 'inline-block' }}>
          ← Ana Sayfaya Dön
        </Link>
        <article>
          <span className="info-eyebrow">{eyebrow}</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--text-primary)', margin: '14px 0 18px', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '36px' }}>
            {intro}
          </p>
          {sections.map(section => (
            <section key={section.title} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                {section.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                {section.body}
              </p>
              {section.items && (
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {section.items.map(item => (
                    <li key={item} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <nav className="info-actions" aria-label="Sonraki adımlar" style={{ marginTop: '48px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/#services" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', height: '46px', borderRadius: 'var(--radius-control)', background: 'var(--action-primary)', color: '#fff', fontWeight: 700 }}>
              Hizmet Ara
            </Link>
            <Link href="/giris" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', height: '46px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-default)', background: '#fff', color: 'var(--text-primary)', fontWeight: 700 }}>
              Hesabına Git
            </Link>
          </nav>
        </article>
      </div>
    </main>
  );
}
