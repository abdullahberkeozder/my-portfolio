import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ankaraNeighborhoods } from '../../../data/ankaraLocations';
import { getAllDistrictSlugs, getDistrictFromSlug } from '../../../data/districtSlugs';
import { FLAT_RATE_PACKAGES } from '../../../data/flatRatePackages';
import { getCalibratedServiceScope, getServiceSafetyGuidance } from '../../../data/serviceGuidance';
import { services } from '../../../data/serviceTaxonomy';
import styles from './localLanding.module.css';

type Props = {
  params: Promise<{
    district: string;
    service: string;
  }>;
};

export async function generateStaticParams() {
  const districtSlugs = getAllDistrictSlugs();
  const params: { district: string; service: string }[] = [];

  for (const districtSlug of districtSlugs) {
    for (const service of services) {
      params.push({
        district: districtSlug,
        service: service.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: districtSlug, service: serviceSlug } = await params;
  const districtName = getDistrictFromSlug(districtSlug);
  const service = services.find(s => s.slug === serviceSlug || s.id === serviceSlug);

  if (!districtName || !service) {
    return {
      title: 'Hizmet Bulunamadı | Orkestra',
    };
  }

  const title = `${districtName} ${service.name} Ustası | Fiyat ve Randevu · Orkestra`;
  const description = `Ankara ${districtName} bölgesinde doğrulanmış ${service.name} ustalarından en fazla 4 kör teklif alın. Sabit işçilik güvencesi, 48 saat düzeltme garantisi ve canlı sevk takibi.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ankarausta.com/ankara/${districtSlug}/${service.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ankarausta.com/ankara/${districtSlug}/${service.slug}`,
      siteName: 'Orkestra Ankara Usta',
      locale: 'tr_TR',
      type: 'website',
    },
  };
}

export default async function LocalServiceLandingPage({ params }: Props) {
  const { district: districtSlug, service: serviceSlug } = await params;
  const districtName = getDistrictFromSlug(districtSlug);
  const service = services.find(s => s.slug === serviceSlug || s.id === serviceSlug);

  if (!districtName || !service) {
    notFound();
  }

  const neighborhoods = ankaraNeighborhoods[districtName] ?? [];
  const calibratedScope = getCalibratedServiceScope(service.id);
  const safetyGuidance = getServiceSafetyGuidance(service);
  const matchingFlatRate = FLAT_RATE_PACKAGES.find(p => p.serviceId === service.id);

  const startWizardUrl = `/?service=${encodeURIComponent(service.id)}&district=${encodeURIComponent(districtName)}&resume=1`;

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Ana Sayfa',
            'item': 'https://ankarausta.com',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Ankara',
            'item': 'https://ankarausta.com/ankara',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': districtName,
            'item': `https://ankarausta.com/ankara/${districtSlug}`,
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': service.name,
            'item': `https://ankarausta.com/ankara/${districtSlug}/${service.slug}`,
          },
        ],
      },
      {
        '@type': 'Service',
        'serviceType': service.name,
        'provider': {
          '@type': 'LocalBusiness',
          'name': `Orkestra ${districtName} ${service.name} Hizmetleri`,
          'areaServed': {
            '@type': 'AdministrativeArea',
            'name': `${districtName}, Ankara`,
          },
        },
        'areaServed': `${districtName}, Ankara`,
        'description': `${districtName} ilçesinde doğrulanmış ${service.name} zanaatkârlarından kör teklif ve garantili işçilik hizmeti.`,
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `${districtName} genelinde usta ne kadar sürede adrese ulaşır?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `${districtName} pilot bölgesinde ustalarımız teklif kabulünün ardından randevu saatinde veya acil çağrılarda ortalama 20-30 dakika içinde adrese ulaşmaktadır. TaskRabbit modeli canlı sevk çipleri ile ustanın yola çıkışını anlık takip edebilirsiniz.`,
            },
          },
          {
            '@type': 'Question',
            'name': 'İş tamamlandıktan sonra garanti veriliyor mu?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Evet. Yapılan tüm işler platformumuzda Dijital İşçilik Belgesi ile kayıt altına alınır. Müşterilerimize teslimatta 48 saatlik düzeltme (rework) SLA döngüsü ve hizmet türüne göre 60 ile 180 gün arasında işçilik garantisi sağlanır.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Ödeme ne zaman ve nasıl yapılır?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Teklif kabul edildiğinde işçilik tutarı banka havuzunda güvenceye (Escrow) alınır. Tutar doğrudan ustaya gitmez. Usta işi teslim edip müşteri nihai onayı verene kadar havuzda bloke olarak güvende kalır.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className={styles.pageShell}>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <nav aria-label="Ekmek kırıntısı navigasyonu" className={styles.breadcrumbs}>
            <Link href="/">Ana Sayfa</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span>Ankara</span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span>{districtName}</span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span aria-current="page">{service.name}</span>
          </nav>

          <span className={styles.heroKicker}>
            📍 Ankara · {districtName} Bölgesi
          </span>

          <h1 className={styles.heroTitle}>
            {districtName} {service.name} Ustası
          </h1>

          <p className={styles.heroLead}>
            Ankara {districtName} ilçesinde mesleki belgesi teyit edilmiş ustalardan şeffaf, kör teklif alın.
            4 teklif sınırı ile rahatsız edilmeden kıyaslayın, 48 saat düzeltme garantisi ve emanet ödeme güvencesiyle tamamlatın.
          </p>

          <div className={styles.ctaRow}>
            <Link href={startWizardUrl} className={styles.primaryCta}>
              ⚡ {districtName}&apos;de Hemen Fiyat Al
            </Link>
            <Link href="/ustalar" className={styles.secondaryCta}>
              Doğrulanmış Ustaları Gör →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className={styles.contentBody}>
        <div className={`${styles.container} ${styles.gridContent}`}>
          {/* Main Column */}
          <div className={styles.mainCol}>
            {/* Features Triad (Armut + TaskRabbit + Bionluk) */}
            <section className={styles.card} aria-labelledby="features-title">
              <h2 id="features-title" className={styles.cardTitle}>
                Orkestra Modeli ile {districtName} Güvencesi
              </h2>
              <div className={styles.featuresGrid}>
                <div className={styles.featureBox}>
                  <div className={styles.featureIcon}>🎯</div>
                  <h3 className={styles.featureTitle}>En Fazla 4 Teklif</h3>
                  <p className={styles.featureDesc}>
                    Armut modeli teklif sınırı: Talebinize en fazla 4 uzman usta teklif verebilir. Telefonunuz spam çağrılarla dolmaz.
                  </p>
                </div>
                <div className={styles.featureBox}>
                  <div className={styles.featureIcon}>🚗</div>
                  <h3 className={styles.featureTitle}>Canlı Sevk Takibi</h3>
                  <p className={styles.featureDesc}>
                    TaskRabbit modeli: Ustanız &quot;Yoldayım (20-30 dk)&quot; veya &quot;Adresteyim&quot; durumunu tek tıkla bildirir.
                  </p>
                </div>
                <div className={styles.featureBox}>
                  <div className={styles.featureIcon}>🛡️</div>
                  <h3 className={styles.featureTitle}>48h Düzeltme SLA</h3>
                  <p className={styles.featureDesc}>
                    Bionluk modeli: İşi beğenmez veya eksik bulursanız 48 saatlik düzeltme hakkınız devreye girer, ödeme havuzda kalır.
                  </p>
                </div>
              </div>
            </section>

            {/* Neighborhoods Coverage */}
            <section className={styles.card} aria-labelledby="neighborhoods-title">
              <h2 id="neighborhoods-title" className={styles.cardTitle}>
                {districtName} Hizmet Verilen Mahalleler
              </h2>
              <p className={styles.featureDesc}>
                {districtName} sınırları içindeki tüm mahallelere aynı gün keşif veya randevulu montaj/onarım hizmeti sağlanmaktadır:
              </p>
              <div className={styles.neighborhoodBadgeGrid}>
                {neighborhoods.map(nb => (
                  <span key={nb} className={styles.neighborhoodBadge}>
                    📍 {nb}
                  </span>
                ))}
              </div>
            </section>

            {/* Standard Scope Inclusions & Exclusions */}
            {calibratedScope && (
              <section className={styles.card} aria-labelledby="scope-title">
                <h2 id="scope-title" className={styles.cardTitle}>
                  Standart İş Kapsamı ve Detaylar
                </h2>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Genellikle Dahil Olan İşlemler</h3>
                  <ul className={styles.scopeList}>
                    {calibratedScope.included.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>Hariç Tutulan / Ek Malzeme Gerektirebilecek Durumlar</h3>
                  <ul className={styles.scopeList}>
                    {calibratedScope.excluded.map((item, idx) => (
                      <li key={idx}>✕ {item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Safety Guidance if present */}
            {safetyGuidance && (
              <section className={styles.card} aria-labelledby="safety-title">
                <h2 id="safety-title" className={styles.cardTitle}>
                  Önemli Güvenlik Bilgisi: {safetyGuidance.title}
                </h2>
                <p className={styles.faqAnswer}>{safetyGuidance.body}</p>
              </section>
            )}

            {/* Local FAQs */}
            <section className={styles.card} aria-labelledby="faq-title">
              <h2 id="faq-title" className={styles.cardTitle}>
                Sıkça Sorulan Sorular ({districtName})
              </h2>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  {districtName} genelinde usta ne kadar sürede adrese gelir?
                </h3>
                <p className={styles.faqAnswer}>
                  Ustanız teklif kabulünün ardından kararlaştırılan randevu saatinde gelir. Acil servis kabul eden nöbetçi ustalarımız ise ortalama 20-30 dakika içinde adrese ulaşır.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  Ödeme ne zaman tahsil edilir?
                </h3>
                <p className={styles.faqAnswer}>
                  Teklif kabul edildiğinde işçilik tutarı banka havuzunda güvenceye alınır. Usta işi bitirip siz onaylayana kadar tutar ustaya aktarılmaz.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  Usta işi eksik bırakırsa ne olur?
                </h3>
                <p className={styles.faqAnswer}>
                  Bionluk modeli 48 saatlik düzeltme (rework) hakkınız mevcuttur. İş odasından eksikleri yazarak düzeltme isteyebilirsiniz; para havuzda güvende kalır.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Sticky Column */}
          <div className={styles.sideCol}>
            <div className={styles.sideStickyBox}>
              {matchingFlatRate ? (
                <div className={styles.packageHighlightCard}>
                  <span className={styles.packageBadge}>{matchingFlatRate.badge ?? 'Standart Sabit Paket'}</span>
                  <h3 className={styles.cardTitle}>{matchingFlatRate.title}</h3>
                  <div className={styles.packagePrice}>₺{matchingFlatRate.referencePriceTRY}</div>
                  <ul className={styles.packageList}>
                    {matchingFlatRate.included.slice(0, 3).map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                    <li>⏱️ Süre: {matchingFlatRate.estimatedDuration}</li>
                    <li>🛡️ {matchingFlatRate.warrantyDays} Gün İşçilik Garantisi</li>
                  </ul>
                  <Link href={startWizardUrl} className={styles.primaryCta}>
                    Hemen Rezervasyon Yap
                  </Link>
                </div>
              ) : (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Hızlı Fiyat Teklifi Al</h3>
                  <p className={styles.featureDesc}>
                    {districtName} için 2 dakikada talep oluşturun, doğrulanmış ustalardan net kör teklifler gelsin.
                  </p>
                  <Link href={startWizardUrl} className={styles.primaryCta}>
                    Talebi Başlat →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
