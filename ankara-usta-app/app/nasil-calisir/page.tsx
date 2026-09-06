'use client';

import React from 'react';
import Link from 'next/link';
import styles from './howItWorks.module.css';

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
    color: '#b87c14',
    title: '4. Platform İçi İş Geçmişi',
    text: 'Tamamlanan işler, doğrulanmış değerlendirmeler ve moderasyon kararları platform kayıtlarından üretilir.',
  },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = React.useState<'customer' | 'trade'>('customer');
  const steps = activeTab === 'customer' ? customerSteps : tradeSteps;

  return (
    <main className="account-shell how-it-works-page">
      <div className={styles.container}>
        {/* Intro */}
        <header className={styles.header}>
          <span className={styles.kicker}>
            ŞEFFAF SÜREÇ & GÜVEN REHBERİ
          </span>
          <h1 className={styles.title}>
            Sorundan tamamlanan işe,<br />adım adım güvenli yolculuk.
          </h1>
          <p className={styles.desc}>
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
        <section id="dogrulama" className={styles.verificationSection}>
          <span className={styles.verifKicker}>
            BAŞVURU VE BELGE DOĞRULAMASI
          </span>
          <h2 className={styles.verifTitle}>
            Usta onayı ne anlama gelir?
          </h2>
          <p className={styles.verifDesc}>
            Başvuru onayı ile belge doğrulaması aynı şey değildir. Yalnızca kanıtı kontrol edilen alanlar profilde ayrı olarak gösterilir.
          </p>
          <div className={styles.verifList}>
            {verificationItems.map((item, i) => (
              <div
                key={i}
                className={styles.verifCard}
                style={{ borderLeftColor: item.color }}
              >
                <strong className={styles.verifCardTitle}>
                  {item.title}
                </strong>
                <p className={styles.verifCardText}>
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
