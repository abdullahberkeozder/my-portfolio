import React from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import OrchestraLogo from '../components/OrchestraLogo';

export const metadata = {
  title: 'Nasıl Çalışır & Zanaatkar Doğrulama Rehberi | Orkestra',
  description: 'Orkestra platformunda hizmet alma adımları, usta başvuru incelemesi ve belge bazlı doğrulama bilgileri.',
};

export default function HowItWorksPage() {
  return (
    <main className="account-shell how-it-works-page">
      <AppHeader role="visitor" />

      <div style={{ maxWidth: '960px', margin: '48px auto 80px', padding: '0 20px' }}>
        {/* Intro */}
        <header style={{ marginBottom: '48px', textAlign: 'center' }}>
          <span style={{ color: 'var(--action-primary)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em' }}>
            ŞEFFAF SÜREÇ & GÜVEN REHBERİ
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', color: 'var(--text-primary)', margin: '14px 0', letterSpacing: '-0.02em' }}>
            Sorundan tamamlanan işe,<br />adım adım güvenli yolculuk.
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.6 }}>
            Orkestra; belirsiz fiyatları, telefon trafiğini ve usta arayışındaki endişeleri ortadan kaldırmak için tasarlandı.
          </p>
        </header>


        {/* Customer Steps */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '24px', borderBottom: '2px solid var(--surface-brand-soft)', paddingBottom: '12px' }}>
            Müşteriler İçin Hizmet Akışı
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <article style={{ padding: '24px', background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-brand-soft)', color: 'var(--action-primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                1
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 10px' }}>Sorununuzu Anlatın</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                Akıllı sınıflandırma motorumuz ihtiyacınızı analiz eder; standart paket, teklif karşılaştırma veya yerinde keşif modelini belirler.
              </p>
            </article>

            <article style={{ padding: '24px', background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-info)', color: 'var(--action-info)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                2
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 10px' }}>Doğrulanmış Teklifleri İnceleyin</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                İlçenizdeki uygun ve onaylı ustalar detaylı teklif iletir. Fiyat, malzeme kapsamı, iş süresi ve garanti maddelerini karşılaştırın.
              </p>
            </article>

            <article style={{ padding: '24px', background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-brand-soft)', color: 'var(--action-primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>
                3
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 10px' }}>İş Günlüğü ile Takip & Onay</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                Süreç boyunca yapılan her işlem, ek talep ve fotoğraf dijital iş günlüğüne işlenir. Siz onay vermeden iş tamamlanmış sayılmaz.
              </p>
            </article>
          </div>
        </section>

        {/* Evidence-based tradesperson review */}
        <section id="dogrulama" style={{ padding: '36px', background: 'var(--surface-page)', borderRadius: 'var(--radius-surface)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <OrchestraLogo size={32} variant="emerald" />
            <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', margin: 0 }}>
              Başvuru İncelemesi ve Belge Bazlı Doğrulama
            </h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
            Usta başvurusu onayı ile belge doğrulaması aynı şey değildir. Operasyon ekibi başvuruyu inceler; yalnız kanıtı kontrol edilen alanlar profilde ayrı doğrulama bilgisi olarak gösterilir.
          </p>

          <div style={{ display: 'grid', gap: '18px' }}>
            <div style={{ padding: '20px', background: '#fff', borderRadius: 'var(--radius-control)', borderLeft: '4px solid var(--action-primary)' }}>
              <b style={{ display: 'block', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                1. Hesap ve Başvuru Kontrolü
              </b>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                Başvuru sahibinin hesabı, iletişim bilgileri, hizmet seçimi ve çalışma bölgeleri kontrol edilir. Başvurusu onaylanmayan usta teklif veremez.
              </p>
            </div>

            <div style={{ padding: '20px', background: '#fff', borderRadius: 'var(--radius-control)', borderLeft: '4px solid var(--action-info)' }}>
              <b style={{ display: 'block', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                2. Belge Türüne Özel İnceleme
              </b>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                Yüklenen mesleki belge, kimlik, adres veya referans kanıtı kendi türüne göre incelenir. Bir belgenin onaylanması diğer alanların da doğrulandığı anlamına gelmez.
              </p>
            </div>

            <div style={{ padding: '20px', background: '#fff', borderRadius: 'var(--radius-control)', borderLeft: '4px solid var(--action-primary)' }}>
              <b style={{ display: 'block', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                3. Ayrı ve Açıklanabilir Rozetler
              </b>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                Telefon, adres, mesleki belge ve referans kontrolleri birbirinden ayrı gösterilir. Kanıtı bulunmayan bir alan için genel doğrulama iddiası kullanılmaz.
              </p>
            </div>

            <div style={{ padding: '20px', background: '#fff', borderRadius: 'var(--radius-control)', borderLeft: '4px solid var(--status-warning, #714d00)' }}>
              <b style={{ display: 'block', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                4. Platform İçi İş Geçmişi
              </b>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                Tamamlanan işler, doğrulanmış değerlendirmeler ve moderasyon kararları platform kayıtlarından üretilir. Süresi dolan belgeler yeniden incelemeye alınabilir.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/#services" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 28px', height: '48px', borderRadius: 'var(--radius-control)', background: 'var(--action-primary)', color: '#fff', fontWeight: 700 }}>
            Hemen Usta Bul
          </Link>
          <Link href="/usta-basvurusu" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 28px', height: '48px', borderRadius: 'var(--radius-control)', border: '1px solid var(--action-primary)', background: '#fff', color: 'var(--action-primary)', fontWeight: 700 }}>
            Usta Olarak Katıl
          </Link>
        </div>
      </div>
    </main>
  );
}
