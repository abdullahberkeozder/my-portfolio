import Link from 'next/link';
import styles from './yardim.module.css';

export const metadata = {
  title: 'Yardım ve Süreç Rehberi | Orkestra',
  description: 'Orkestra platformunda talep oluşturma, usta tekliflerini değerlendirme, dijital iş günlüğü ve uyuşmazlık kayıt süreci rehberi.',
};

const PILLARS = [
  {
    id: 'saha-whatsapp',
    badge: 'Canlı Saha Desteği',
    title: 'WhatsApp Saha Koordinasyonu',
    desc: 'Ankara 9 pilot ilçesinde (+90 312 800 06 06) üzerinden hızlı lojistik takip ve usta yönlendirmesi.',
    target: '#bilgi-5',
    actionText: 'Saha Desteğine Ulaş',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    id: 'is-gunlugu',
    badge: 'Kayıtlı Sözleşme',
    title: 'Şeffaf Kapsam & İş Günlüğü',
    desc: 'Onaylanan teklif sözleşmeye dönüşür; malzeme, süre ve fotoğraflar dijital iş günlüğüne işlenir.',
    target: '#bilgi-2',
    actionText: 'İş Günlüğünü İncele',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'moderasyon-cozum',
    badge: 'Kayıt Bütünlüğü',
    title: 'Moderasyon İncelemesi',
    desc: 'Uyuşmazlık halinde karşılıklı kanıt sunumu ve tarafsız moderatör incelemesiyle sistem içi çözüm.',
    target: '#bilgi-3',
    actionText: 'Çözüm Sürecini Gör',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const SECTIONS = [
  {
    id: 'bilgi-1',
    heading: '1. Talep Oluşturma ve Hizmet Seçimi',
    body: 'İhtiyacınızı kendi cümlelerinizle arama kutusuna yazarak ya da hizmet kataloğundan seçerek başlayabilirsiniz. Sistem, Ankara ilçeniz ve probleminizin niteliğine göre uygun hizmet kategorisini ve kapsam sorularını belirler.',
    items: [
      'Teklif Karşılaştırma: Ustalar, belirttiğiniz detaylara göre işçilik ücreti, malzeme, tahmini süre ve garanti şartlarını içeren tekliflerini iletir.',
      'Keşif ve Tespit: Kapsamı yerinde incelenmesi gereken durumlar için taraflar randevu saati belirler.',
      'Şeffaf Kapsam: Her hizmette nelerin dahil, nelerin hariç olduğu açık sorularla netleştirilir; sürpriz ek masrafların önüne geçilir.',
    ],
  },
  {
    id: 'bilgi-2',
    heading: '2. Teklif Kabulü ve Dijital İş Günlüğü',
    body: 'Gelen teklifleri inceleyip bir ustanın teklifini kabul ettiğinizde, sistem üzerinde taraflara özel iş kaydı açılır. Açık adres ve doğrudan iletişim bilgileri yalnızca bu aşamadan sonra işin yürütülmesi amacıyla paylaşılır.',
    items: [
      'Tarihli Kayıtlar: Randevu zamanı, malzeme listesi ve yapılan müdahaleler iş sayfasına kaydedilir.',
      'Kapsam Değişikliği: İş sırasında ek onarım veya malzeme gerekirse, ustanın teklif ettiği kapsam değişikliği müşteri tarafından onaylanmadan geçerlilik kazanmaz.',
    ],
  },
  {
    id: 'bilgi-3',
    heading: '3. Uyuşmazlık Kaydı ve Moderasyon İncelemesi',
    body: 'İşin kararlaştırılan kapsama uymaması, taahhüt edilen sürede tamamlanmaması veya usta ile mutabakat sağlanamaması halinde iş detay ekranından "Uyuşmazlık Bildirimi" oluşturulabilir.',
    items: [
      'Karşılıklı Kanıt Sunumu: Taraflar açıklama, fotoğraf ve belgelerini uyuşmazlık dosyasına ekler.',
      'Kayıt Bütünlüğü: Platform; dijital iş günlüğü, onaylanmış kapsam maddeleri ve tarafların yazılı beyanlarını tarafsız bir inceleme zemini olarak saklar.',
      'Pilot Moderasyon Değerlendirmesi: Yetkili platform yöneticileri uyuşmazlık dosyasını inceleyerek taraflarla iletişime geçer ve sistem içi çözüm sürecini yürütür.',
    ],
  },
  {
    id: 'bilgi-4',
    heading: '4. Pilot Destek ve Geri Bildirim',
    body: 'Orkestra kontrollü pilot döneminde platform kullanımına ilişkin soru, öneri ve destek taleplerinizi destek@ankarausta.app adresine iletebilirsiniz. Pilot döneminde talepler sırayla incelenerek en kısa sürede dönüş sağlanır.',
  },
  {
    id: 'bilgi-5',
    heading: '5. Ankara 9 Pilot İlçe Saha Operasyonu ve WhatsApp Destek Hattı',
    body: 'Orkestra; Çankaya, Yenimahalle, Keçiören, Mamak, Altındağ, Etimesgut, Sincan, Gölbaşı ve Pursaklar olmak üzere Ankara’nın 9 pilot ilçesinde canlı saha koordinasyonu yürütür. Saha sorularınız, acil durumlar ve usta yönlendirmeleri için WhatsApp Destek Hattı (+90 312 800 06 06) üzerinden koordinasyon ekibimize anında ulaşabilirsiniz.',
    items: [
      'Canlı Saha Çalışma Saatleri: Hafta içi 08:30 – 19:00, Cumartesi 09:00 – 17:00.',
      'Acil Nöbetçi Ekip: Pazar günleri sıhhi tesisat ve elektrik acil durumları için nöbetçi saha zanaatkâr ekipleri görev başındadır.',
      'Zanaat Merkezleri Transit SLA: Siteler (Mobilya & Ahşap), Ostim/İvedik (Metal & Mekanik) ve Rüzgarlı (Tesisat) merkezlerinden pilot ilçelere ortalama 20–30 dakikada lojistik sevk takibi sağlanır.',
    ],
  },
];

export default function HelpPage() {
  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <Link className={styles.backLink} href="/">
          ← Ana sayfaya dön
        </Link>

        {/* ── ÜST BAŞLIK ALANI ─────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden="true" />
            YARDIM VE SÜREÇ REHBERİ
          </div>
          <h1 className={styles.title}>
            Hizmet sürecinin her adımında şeffaf ve kayıtlı ilerleyin.
          </h1>
          <p className={styles.intro}>
            Talep oluşturma, usta tekliflerini karşılaştırma, iş günlüğü takibi ve olası aksaklıklarda kayıt oluşturma adımlarına dair rehber.
          </p>
        </header>

        {/* ── APPLE SUPPORT 3 SÜTUNLU DESTEK KARTLARI ──────────── */}
        <section className={styles.pillarsGrid} aria-label="Temel Destek Kanalları">
          {PILLARS.map(pillar => (
            <div key={pillar.id} className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarIconWrap}>{pillar.icon}</div>
                <span className={styles.pillarBadge}>{pillar.badge}</span>
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
              <a href={pillar.target} className={styles.pillarAction}>
                <span>{pillar.actionText}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </section>

        {/* ── HIZLI REHBER İÇİNDEKİLER MENÜSÜ ──────────────────── */}
        <nav className={styles.tocNav} aria-label="Rehber başlıkları">
          <div className={styles.tocTitle}>Bu Sayfadaki Konular</div>
          <ul className={styles.tocList}>
            {SECTIONS.map((sec, idx) => (
              <li key={sec.id} className={styles.tocItem}>
                <a href={`#${sec.id}`}>
                  {idx + 1}. {sec.heading.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── AYRINTILI BİLGİ KARTLARI (TEST SÖZLEŞMESİNE UYGUN) ─ */}
        <div className={styles.sectionsStack}>
          {SECTIONS.map(section => (
            <section
              id={section.id}
              key={section.id}
              tabIndex={-1}
              className={styles.sectionCard}
            >
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
              {section.items && (
                <ul className={styles.itemsList}>
                  {section.items.map(item => (
                    <li key={item} className={styles.itemEntry}>
                      <span className={styles.itemCheck} aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* ── ALT DESTEK VE DÖNÜŞÜM ALANI ─────────────────────── */}
        <section className={styles.bottomSupport} aria-label="Doğrudan Destek Alın">
          <div className={styles.supportContent}>
            <h3 className={styles.supportTitle}>Sorunuzun yanıtını bulamadınız mı?</h3>
            <p className={styles.supportDesc}>
              Orkestra saha koordinasyon ekibi Ankara 9 pilot ilçesinde telefon ve WhatsApp üzerinden sorularınızı yanıtlamaya hazırdır.
            </p>
          </div>
          <div className={styles.supportActions}>
            <a
              href="https://wa.me/903128000606"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportPrimaryBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              WhatsApp Saha Hattı
            </a>
            <Link href="/#services" className={styles.supportSecondaryBtn}>
              Hizmetleri Keşfet
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
