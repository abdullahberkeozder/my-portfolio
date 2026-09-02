'use client';

import React from 'react';
import Link from 'next/link';
import AppHeader from '../components/AppHeader';

const customerSteps = [
  {
    num: 1,
    title: 'Sorununuzu Anlatın',
    text: 'Akıllı sınıflandırma motorumuz ihtiyacınızı analiz eder; standart paket, teklif karşılaştırma veya yerinde keşif modelini belirler.',
  },
  {
    num: 2,
    title: 'Doğrulanmış Teklifleri İnceleyin',
    text: 'İlçenizdeki onaylı ustalar detaylı teklif gönderir. Fiyat, malzeme, iş süresi ve garanti maddelerini yan yana karşılaştırın.',
  },
  {
    num: 3,
    title: 'İş Günlüğü ile Takip & Onay',
    text: 'Süreç boyunca tüm adımlar dijital iş günlüğüne kaydedilir. Siz onay vermeden iş tamamlanmış sayılmaz.',
  },
];

const tradeSteps = [
  {
    num: 1,
    title: 'Başvurunuzu Tamamlayın',
    text: 'Uzmanlık alanlarınızı, çalışma bölgelerinizi ve mesleki belgenizi yükleyin. Operasyon ekibi inceleyerek onaylar.',
  },
  {
    num: 2,
    title: 'Uygun Talepleri Görün',
    text: 'Onaylandıktan sonra bölgenizdeki ve uzmanlık alanınızdaki taleplere teklif verebilirsiniz. Fiyat ve kapsam sizin belirlenir.',
  },
  {
    num: 3,
    title: 'Dijital Fişle Çalışın',
    text: 'İş fişi işin başında oluşturulur; tüm değişiklikler kayıt altında tutulur. Tamamlanan her iş değerlendirme profilinizi güçlendirir.',
  },
];

const verificationItems = [
  {
    color: 'var(--brand-cobalt)',
    title: '1. Hesap ve Başvuru Kontrolü',
    text: 'Başvuru sahibinin hesabı, iletişim bilgileri, hizmet seçimi ve çalışma bölgeleri kontrol edilir. Onaylanmayan usta teklif veremez.',
  },
  {
    color: 'var(--brand-cobalt)',
    title: '2. Belge Türüne Özel İnceleme',
    text: 'Mesleki belge, kimlik, adres veya referans kanıtı kendi türüne göre incelenir. Bir belgenin onayı, diğer alanları kapsamaz.',
  },
  {
    color: 'var(--brand-cobalt)',
    title: '3. Ayrı ve Açıklanabilir Rozetler',
    text: 'Telefon, adres, belge ve referans kontrolleri birbirinden bağımsız gösterilir. Kanıtsız alana genel doğrulama iddiası kullanılmaz.',
  },
  {
    color: '#714d00',
    title: '4. Platform İçi İş Geçmişi',
    text: 'Tamamlanan işler, doğrulanmış değerlendirmeler ve moderasyon kararları platform kayıtlarından üretilir.',
  },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = React.useState<'customer' | 'trade'>('customer');
  const steps = activeTab === 'customer' ? customerSteps : tradeSteps;

  return (
    <main className="account-shell how-it-works-page">
      <AppHeader role="visitor" />

      <div style={{ maxWidth: '960px', margin: '48px auto 80px', padding: '0 20px' }}>

        {/* Intro */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ color: 'var(--brand-cobalt)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ŞEFFAF SÜREÇ & GÜVEN REHBERİ
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--text-primary)', margin: '12px 0 16px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Sorundan tamamlanan işe,<br />adım adım güvenli yolculuk.
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
            Orkestra; belirsiz fiyatları, telefon trafiğini ve usta arayışındaki endişeleri ortadan kaldırmak için tasarlandı.
          </p>
        </header>

        {/* Tab group */}
        <div className="how-tab-group" role="tablist" aria-label="Kullanıcı rolü">
          <button
            className={`how-tab-btn${activeTab === 'customer' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'customer'}
            onClick={() => setActiveTab('customer')}
            id="tab-customer"
            aria-controls="panel-customer"
          >
            👤 Müşteriler İçin
          </button>
          <button
            className={`how-tab-btn${activeTab === 'trade' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'trade'}
            onClick={() => setActiveTab('trade')}
            id="tab-trade"
            aria-controls="panel-trade"
          >
            🔧 Ustalar İçin
          </button>
        </div>

        {/* Steps panel */}
        <section
          id={activeTab === 'customer' ? 'panel-customer' : 'panel-trade'}
          role="tabpanel"
          aria-labelledby={activeTab === 'customer' ? 'tab-customer' : 'tab-trade'}
          className="how-step-grid"
        >
          {steps.map((step) => (
            <div key={step.num} className="how-step-card">
              <div className="how-step-num">{step.num}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-text">{step.text}</p>
            </div>
          ))}
        </section>

        {/* Verification section */}
        <section
          id="dogrulama"
          style={{ padding: '36px', background: 'white', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
        >
          <span style={{ color: 'var(--brand-cobalt)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            BAŞVURU VE BELGE DOĞRULAMASI
          </span>
          <h2 style={{ fontSize: '22px', color: 'var(--text-primary)', margin: '10px 0 8px', letterSpacing: '-0.02em' }}>
            Usta onayı ne anlama gelir?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Başvuru onayı ile belge doğrulaması aynı şey değildir. Yalnızca kanıtı kontrol edilen alanlar profilde ayrı olarak gösterilir.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {verificationItems.map((item, i) => (
              <div
                key={i}
                style={{ padding: '16px 20px', background: 'var(--brand-parchment)', borderRadius: 'var(--radius-control)', borderLeft: `4px solid ${item.color}` }}
              >
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {item.title}
                </strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.55 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA band */}
        <div className="how-cta-band">
          <h2>Hazır olduğunuzda başlayın.</h2>
          <Link href="/#services" className="how-cta-primary">
            Hemen Usta Bul
          </Link>
          <Link href="/usta-basvurusu" className="how-cta-secondary">
            Usta Olarak Katıl
          </Link>
        </div>
      </div>
    </main>
  );
}
