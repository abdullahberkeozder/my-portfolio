'use client';

import { FormEvent, useEffect, useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { services, serviceCategories, servicesByCategory } from './data/serviceTaxonomy';
import { getServiceSafetyGuidance, getCalibratedServiceScope } from './data/serviceGuidance';
import { ClassificationResult, classifyService } from './lib/classifyService';
import RequestWizard from './components/RequestWizard';
import ProgressiveImage from './components/ProgressiveImage';
import DiscoveryWorkDetail from './components/DiscoveryWorkDetail';
import { useSavedDiscovery } from './hooks/useSavedDiscovery';
import { useModalDialog } from './hooks/useModalDialog';
import Button from './components/Button';
import matchStyles from './components/serviceMatch.module.css';
import styles from './home.module.css';
import { trackFunnel } from './lib/analytics';
import { discoveryHref } from './lib/discoveryContract';
import { ankaraDistricts } from './data/ankaraLocations';

interface DiscoveryWork {
  id: string;
  serviceId: string;
  category: 'montaj' | 'tesisat' | 'boya' | 'elektrik' | 'temizlik' | 'kaynak';
  categoryLabel: string;
  title: string;
  image: string;
  artisanName: string;
  artisanDistrict: string;
  materials: string[];
}

const DISCOVERY_WORKS: DiscoveryWork[] = [
  {
    id: 'work-1',
    serviceId: 'raf-tablo-montaji',
    category: 'montaj',
    categoryLabel: 'Montaj',
    title: 'Duvar rafı montajı',
    image: '/images/discovery/duvar-rafi-montaji.jpg',
    artisanName: 'Murat Usta',
    artisanDistrict: 'Çankaya',
    materials: ['40mm Masif Meşe', 'Gizli Çelik Ankraj', 'Lazer Terazi: ±0.5mm'],
  },
  {
    id: 'work-2',
    serviceId: 'musluk-degisimi',
    category: 'tesisat',
    categoryLabel: 'Tesisat',
    title: 'Mutfak bataryası değişimi',
    image: '/images/discovery/mutfak-bataryasi-degisimi.jpg',
    artisanName: 'Selim Usta',
    artisanDistrict: 'Yenimahalle',
    materials: ['Döküm Pirinç Gövde', '304 Paslanmaz Fleks', 'TS EN 817 Sızdırmazlık'],
  },
  {
    id: 'work-3',
    serviceId: 'tek-oda-boya',
    category: 'boya',
    categoryLabel: 'Boya',
    title: 'Salon boyama',
    image: '/images/discovery/salon-boyama.jpg',
    artisanName: 'Derya Usta',
    artisanDistrict: 'Etimesgut',
    materials: ['Silikonlu Mat İç Cephe', 'Hassas Maskeleme', 'Kraft Zemin Koruması'],
  },
  {
    id: 'work-4',
    serviceId: 'kornis-perde-montaji',
    category: 'montaj',
    categoryLabel: 'Montaj',
    title: 'Korniş montajı',
    image: '/images/discovery/kornis-montaji.jpg',
    artisanName: 'Emre Usta',
    artisanDistrict: 'Keçiören',
    materials: ['Ekstrüzyon 3 Ray Alüminyum', 'Çelik Kanatlı Dübel', 'Lazer Aks Doğrulama'],
  },
  {
    id: 'work-5',
    serviceId: 'avize-montaji',
    category: 'elektrik',
    categoryLabel: 'Elektrik',
    title: 'Avize montajı',
    image: '/images/discovery/avize-montaji.jpg',
    artisanName: 'Cem Usta',
    artisanDistrict: 'Mamak',
    materials: ['Topraklı Güvenlik Klemensi', 'Döküm Çelik Tavan Mapası', 'Dijital Faz/Yük Testi'],
  },
  {
    id: 'work-6',
    serviceId: 'ev-temizligi',
    category: 'temizlik',
    categoryLabel: 'Temizlik',
    title: 'Mutfak temizliği',
    image: '/images/discovery/mutfak-temizligi.jpg',
    artisanName: 'Ece Hanım',
    artisanDistrict: 'Gölbaşı',
    materials: ['Gıda Temas Onaylı Solüsyon', 'Yüksek Emişli Mikrofiber', 'Paslanmaz Çelik Buhar'],
  },
];

const CATEGORY_TABS = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'montaj', label: 'Montaj' },
  { id: 'tesisat', label: 'Tesisat' },
  { id: 'boya', label: 'Boya' },
  { id: 'elektrik', label: 'Elektrik' },
  { id: 'temizlik', label: 'Temizlik' },
  { id: 'kaynak', label: 'Kaynak' },
] as const;

const CATEGORY_PRIMARY_SERVICES: Record<string, string> = {
  montaj: 'mobilya-kurulumu',
  tesisat: 'musluk-degisimi',
  boya: 'tek-oda-boya',
  elektrik: 'elektrik-arizasi',
  temizlik: 'ev-temizligi',
  kaynak: 'bahce-kapisi',
};

const WORK_IDS = DISCOVERY_WORKS.map(work => work.id);

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const [wizardServiceId, setWizardServiceId] = useState<string | null>(null);
  const [remoteDraft, setRemoteDraft] = useState<Parameters<typeof RequestWizard>[0]['remoteDraft']>();
  const classificationDialogRef = useModalDialog<HTMLElement>(dialog, () => setDialog(false));

  /* V8.1 Sosyal Keşif Durumları */
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('tumu');
  const [isCategoryPending, startCategoryTransition] = useTransition();
  const { savedIds, ready: savesReady, notice: saveNotice, toggle: toggleSaved } = useSavedDiscovery(WORK_IDS);
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeWork, setActiveWork] = useState<DiscoveryWork | null>(null);
  const [wizardReferenceWork, setWizardReferenceWork] = useState<DiscoveryWork | null>(null);
  const lastDiscoveryTriggerRef = useRef<HTMLElement | null>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const selectedClassificationService = services.find(item => item.id === selectedServiceId);
  const selectedSafetyGuidance = selectedClassificationService
    ? getServiceSafetyGuidance(selectedClassificationService)
    : undefined;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draftId');
    const serviceId = params.get('service');
    if (params.get('resume') === '1' && serviceId && services.some(service => service.id === serviceId)) {
      queueMicrotask(() => { setRemoteDraft(undefined); setWizardServiceId(serviceId); });
      return;
    }
    if (!draftId || !serviceId) return;
    let active = true;
    void fetch(`/api/requests/${encodeURIComponent(draftId)}`)
      .then(async response => {
        if (!response.ok) throw new Error('Taslak yüklenemedi.');
        return response.json() as Promise<{
          request: {
            id: string;
            service_id: string;
            target_professional_id?: string | null;
            routing_mode?: string;
            answers: Record<string, string>;
            district: string | null;
            neighborhood: string | null;
            preferred_timing: string | null;
            idempotency_key: string;
          };
        }>;
      })
      .then(({ request }) => {
        if (!active) return;
        if (request.target_professional_id) {
          router.replace(
            `/ustalar/${encodeURIComponent(request.target_professional_id)}/talep?service=${encodeURIComponent(
              request.service_id
            )}&draftId=${encodeURIComponent(request.id)}`
          );
          return;
        }
        if (request.routing_mode && request.routing_mode !== 'open') return;
        if (request.service_id !== serviceId) return;
        const definition = services.find(item => item.id === serviceId);
        if (!definition) return;
        setRemoteDraft({
          answers: request.answers ?? {},
          district: request.district ?? '',
          neighborhood: request.neighborhood ?? '',
          timing: request.preferred_timing ?? 'Bu hafta',
          step: 0,
          idempotencyKey: request.idempotency_key,
          requestId: request.id,
          updatedAt: Date.now(),
        });
        setWizardServiceId(serviceId);
      })
      .catch(() => { if (active) setRemoteDraft(undefined); });
    return () => { active = false; };
  }, [router]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const result = classifyService(query);
      trackFunnel('service_search', { candidateCount: result.candidates.length });
      setClassification(result);
      setSelectedServiceId(result.candidates[0]?.service.id ?? null);
      setDialog(true);
    } finally {
      setSearching(false);
    }
  }

  function startClassification(rawQuery: string) {
    setQuery(rawQuery);
    const result = classifyService(rawQuery);
    trackFunnel('service_selected');
    setClassification(result);
    setSelectedServiceId(result.candidates[0]?.service.id ?? null);
    setDialog(true);
  }

  function handleDirectService(serviceId: string, fallbackQuery?: string) {
    const targetService = services.find(s => s.id === serviceId);
    if (targetService) {
      trackFunnel('wizard_started', { serviceId, source: 'home_directory' });
      setRemoteDraft(undefined);
      setWizardServiceId(serviceId);
    } else if (fallbackQuery) {
      startClassification(fallbackQuery);
    }
  }

  function openDirectory() {
    const el = document.getElementById('services');
    const details = el?.querySelector('details');
    if (details) details.open = true;
    const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  }

  function scrollTabsRight() {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: 160, behavior: 'instant' });
    }
  }

  function continueToWizard() {
    if (!selectedServiceId) return;
    setDialog(false);
    trackFunnel('wizard_started', { serviceId: selectedServiceId });
    setWizardServiceId(selectedServiceId);
  }

  const filteredWorks = DISCOVERY_WORKS.filter(work =>
    (activeCategoryTab === 'tumu' || work.category === activeCategoryTab) &&
    (!savedOnly || savedIds.includes(work.id)));

  return (
    <main className={`${styles.home} landing-shell`}>

      <div className={`${styles.container} landing-container`}>

        {/* ── 1. HERO ALANI (SAF MİMARÎ: MERKEZİ BAŞLIK, ARAMA & 4K ATELİER SAHNESİ) ── */}
        <section className={`${styles.hero} landing-hero`} aria-labelledby="hero-title">
          <div className={styles.heroBackgroundWrap} aria-hidden="true">
            <Image
              src="/images/hero-glass-materials-v4.jpg"
              alt=""
              fill
              priority
              unoptimized
              className={styles.heroBackgroundImage}
              sizes="(max-width: 1240px) 100vw, 1240px"
            />
            <div className={styles.heroBackdropOverlay} />
          </div>

          <div className={`${styles.heroContent} landing-hero-content`}>
            <h1 id="hero-title" className={`${styles.heroTitle} landing-hero-title`}>
              Evin için bir fikir.<br />İşin için bir usta.
            </h1>

            <form className={`${styles.heroSearch} landing-search`} role="search" onSubmit={submitSearch}>
              <label htmlFor="service-search-input" className={styles.searchLabel}>
                Ne yaptırmak istiyorsun?
              </label>

              <div className={`${styles.searchRow} landing-search-row`}>
                <div className={`${styles.searchInputWrap} landing-search-input-wrap`}>
                  <svg
                    className={styles.searchIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="service-search-input"
                    className={`${styles.searchInput} landing-search-input`}
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Örn. banyo tadilatı, korniş, parke ustası..."
                    aria-label="İhtiyacınızı yazın"
                    required
                    maxLength={500}
                    autoComplete="off"
                  />
                </div>

                <div className={styles.searchDivider} aria-hidden="true" />

                <div className={styles.searchDistrictWrap}>
                  <svg
                    className={styles.districtIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <select
                    id="service-district-select"
                    className={styles.searchDistrictSelect}
                    value={selectedDistrict}
                    onChange={event => setSelectedDistrict(event.target.value)}
                    aria-label="Ankara İlçesi Seçin"
                  >
                    <option value="">Tüm Ankara</option>
                    {ankaraDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className={`${styles.searchBtn} landing-search-button`}
                  aria-label={searching ? 'Aranıyor…' : 'Hizmet bul'}
                  disabled={searching}
                >
                  <svg
                    className={styles.btnSearchIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className={styles.searchBtnTextDesktop}>{searching ? 'Aranıyor…' : 'Hizmet bul'}</span>
                  <span className={styles.searchBtnTextMobile}>{searching ? '…' : 'Bul'}</span>
                </button>
              </div>

              {/* Restrained example line matching View B editorial entrance */}
              <div className={styles.searchExamples} aria-label="Hızlı arama etiketleri">
                <span className={styles.searchExamplesLabel}>Örnek arananlar:</span>
                {[
                  { label: 'Musluk Değişimi', query: 'Musluk Değişimi' },
                  { label: 'Salon Boyama', query: 'Tek Oda Boya' },
                  { label: 'Korniş Montajı', query: 'Korniş Montajı' },
                  { label: 'Avize Montajı', query: 'Avize Montajı' },
                ].map((chip, idx, arr) => (
                  <span key={chip.label} className={styles.exampleItem}>
                    <button
                      type="button"
                      className={styles.exampleBtn}
                      onClick={() => startClassification(chip.query)}
                    >
                      {chip.label}
                    </button>
                    {idx < arr.length - 1 && <span className={styles.exampleSep} aria-hidden="true">,</span>}
                  </span>
                ))}
              </div>
            </form>

          </div>
        </section>

        {/* ── 2. İŞLERİ KEŞFET (SAF SOSYAL ZANAAT VE PORTFOLYO AKIŞI) ── */}
        <section className={`${styles.discoverySection} landing-discovery`} id="kesfet" aria-labelledby="discovery-title" aria-busy={isCategoryPending}>
          {saveNotice && <p role="status">{saveNotice}</p>}
          <div className={styles.discoveryHeader}>
            <h2 id="discovery-title" className={styles.discoveryTitle}>
              Evine fikir bul
            </h2>
            <p className={styles.discoverySubtitle}>
              Örnek uygulamalar. Fotoğraflar ve usta bilgileri temsilidir.
            </p>
          </div>

          {/* Kategori Filtreleme Sekmeleri */}
          <div className={`${styles.categoryTabsOuter} landing-category-tabs-outer`}>
            <div
              ref={tabsScrollRef}
              className={`${styles.categoryTabs} landing-category-tabs`}
              role="group"
              aria-label="İş Kategorileri"
            >
              {savedIds.length > 0 && (
                <button
                  type="button"
                  aria-pressed={savedOnly}
                  className={`${styles.categoryTab} ${styles.categoryTabSaved} ${savedOnly ? styles.categoryTabActive : ''}`}
                  onClick={() =>
                    startCategoryTransition(() => {
                      setSavedOnly(prev => !prev);
                      if (!savedOnly) setActiveCategoryTab('tumu');
                    })
                  }
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    aria-hidden="true"
                    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: '-1px' }}
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Kaydettiklerim ({savedIds.length})</span>
                </button>
              )}

              {CATEGORY_TABS.map(tab => {
                const isActive = !savedOnly && tab.id === activeCategoryTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isActive}
                    className={`${styles.categoryTab} ${isActive ? styles.categoryTabActive : ''}`}
                    onClick={() =>
                      startCategoryTransition(() => {
                        setSavedOnly(false);
                        setActiveCategoryTab(tab.id);
                      })
                    }
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.tabsScrollArrow}
              onClick={scrollTabsRight}
              aria-label="Diğer kategorileri göster"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* 6'lı İş Kartları Izgarası (View B: Editoryal Vitrin Bento Izgarası) */}
          <div
            key={activeCategoryTab}
            className={`${styles.cardsGrid} ${activeCategoryTab === 'tumu' && !savedOnly ? styles.cardsGridBento : styles.cardsGridFiltered} landing-cards-grid`}
          >
            {filteredWorks.map((work, index) => {
              const isSaved = savedIds.includes(work.id);
              const isLead = activeCategoryTab === 'tumu' && !savedOnly && index === 0;

              return (
                <article
                  key={work.id}
                  className={`${styles.card} ${isLead ? styles.cardLead : ''} landing-card`}
                >
                  <button
                    type="button"
                    className={`${styles.cardPrimary} landing-card-image-wrap`}
                    onClick={(event) => {
                      lastDiscoveryTriggerRef.current = event.currentTarget;
                      setActiveWork(work);
                    }}
                    aria-label={`${work.title} detayını incele`}
                  >
                    <div className={`${styles.cardImageWrap} ${isLead ? styles.cardLeadImageWrap : ''}`}>
                      <ProgressiveImage
                        src={work.image}
                        alt={work.title}
                        width={isLead ? 800 : 540}
                        height={isLead ? 600 : 400}
                        unoptimized
                        className={`${styles.cardImg} landing-card-image`}
                      />
                    </div>
                  </button>

                  <div className={styles.cardMeta}>
                    <div className={styles.cardMetaContent}>
                      <h3 className={`${styles.cardTitle} ${isLead ? styles.cardLeadTitle : ''}`}>
                        {work.title}
                      </h3>
                      <p className={styles.artisanMeta}>
                        {work.artisanName} · {work.artisanDistrict} (temsili)
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`${styles.bookmarkBtn} ${isSaved ? styles.bookmarkBtnSaved : ''}`}
                      onClick={() => toggleSaved(work.id)}
                      disabled={!savesReady}
                      aria-pressed={isSaved}
                      aria-label={isSaved ? `${work.title} favorilerden çıkar` : `${work.title} favorilere ekle`}
                      title={isSaved ? 'Kaydedildi' : 'Listeme ekle'}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isSaved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredWorks.length === 0 && (
            <div className={styles.emptyCategoryNotice}>
              <p>{savedOnly ? 'Burada henüz kaydettiğin bir fikir yok.' : 'Bu kategoride henüz örnek uygulama yok. Hizmetleri inceleyebilirsin.'}</p>
              <button
                type="button"
                className={styles.emptyResetBtn}
                onClick={() => startCategoryTransition(() => { setActiveCategoryTab('tumu'); setSavedOnly(false); })}
              >
                Tüm fikirleri göster
              </button>
            </div>
          )}

          {/* Daha Fazla İş / Harita Köprüsü */}
          <div className={styles.moreWorksWrap}>
            <button
              type="button"
              className={styles.moreWorksBtn}
              onClick={openDirectory}
            >
              Tüm hizmetleri gör
            </button>
            <a
              className={styles.mapBridge}
              href={activeCategoryTab !== 'tumu' && CATEGORY_PRIMARY_SERVICES[activeCategoryTab]
                ? discoveryHref({ service: CATEGORY_PRIMARY_SERVICES[activeCategoryTab], view: 'split', sort: 'recommended' })
                : discoveryHref({ view: 'split', sort: 'recommended' })}
              onClick={() => trackFunnel('discovery_map_opened')}
            >
              {activeCategoryTab === 'tumu'
                ? 'Tüm ustaları haritada gör'
                : `${CATEGORY_TABS.find(t => t.id === activeCategoryTab)?.label ?? ''} ustalarını haritada gör`}
            </a>
          </div>

        </section>

        {/* ── 3. HİZMET DİZİNİ (TEST VE ERİŞİLEBİLİRLİK SÖZLEŞMESİ) ─── */}
        <section className={styles.servicesDirectory} id="services" tabIndex={-1} aria-labelledby="directory-title">
          <h2 id="directory-title" className="sr-only">Hizmet Seçimi</h2>
          <details className={styles.directoryDetails} name="service-category">
            <summary className={styles.directorySummary}>
              <span>Tüm hizmet kategorileri ve kapsamları ({serviceCategories.length} kategori)</span>
              <svg className={styles.disclosureChevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div className={styles.directoryGrid}>
              {serviceCategories.map(cat => {
                const catServices = servicesByCategory(cat.id);
                return (
                  <div key={cat.id} className={styles.directoryCatBlock}>
                    <h3 className={styles.directoryCatTitle}>{cat.name}</h3>
                    <ul className={styles.directoryList}>
                      {catServices.map(service => (
                        <li key={service.id}>
                          <button
                            type="button"
                            className={styles.directoryServiceBtn}
                            onClick={() => handleDirectService(service.id, service.aliases?.[0])}
                          >
                            <span>{service.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </details>
        </section>

        {/* Tasarım Taslağı İmzası */}
        <div className={styles.draftFooterNotice}>
          <span>Görseller örnek uygulamalardır.</span>
        </div>

      </div>

      {activeWork && <DiscoveryWorkDetail work={activeWork}
        serviceName={services.find(service => service.id === activeWork.serviceId)?.name ?? activeWork.title}
        returnFocusRef={lastDiscoveryTriggerRef}
        onClose={() => setActiveWork(null)}
        onRequest={(selectedWork) => {
          const chosen = (selectedWork ?? activeWork) as DiscoveryWork | null;
          setActiveWork(null);
          if (chosen) {
            setWizardReferenceWork(chosen);
            handleDirectService(chosen.serviceId, chosen.title);
          }
        }} />}

      {/* ── HİZMET SINIFLANDIRMA / ARAMA DİYALOĞU (TEST KONTROLÜ) ─── */}
      {dialog && classification && (
        <div className={matchStyles.backdrop} role="presentation" onClick={() => setDialog(false)}>
          <section
            ref={classificationDialogRef}
            tabIndex={-1}
            className={matchStyles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={event => event.stopPropagation()}
          >
            <button data-dialog-initial-focus className={matchStyles.close} onClick={() => setDialog(false)} aria-label="Kapat">×</button>
            <h2 id="dialog-title">{selectedClassificationService?.name ?? 'Hizmet bulamadık'}</h2>
            <p className={matchStyles.query}>&ldquo;{classification.query}&rdquo; için önerimiz</p>
            {classification.candidates.length > 0 ? (
              <>
                <div className={matchStyles.actions}>
                  <Button variant="primary" type="button" disabled={!selectedServiceId} onClick={continueToWizard}>
                    Devam et
                  </Button>
                </div>

                {selectedClassificationService && (() => {
                  const scope = getCalibratedServiceScope(selectedClassificationService.id);
                  return (
                    <details className={matchStyles.details}>
                      <summary className={matchStyles.summary}>
                        <span>Neler dahil?</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className={matchStyles.scope}>
                        <p className={matchStyles.scopeNote}>Bunlar genel kapsam başlıklarıdır. Kesin işçilik, malzeme ve hariç işler ustanın teklifinde netleşir.</p>
                        <div className={matchStyles.scopeColumn}>
                          <strong>✓ Dahil Olanlar</strong>
                          <ul>{scope.included.map((item: string) => <li key={item}>{item}</li>)}</ul>
                        </div>
                        <div className={matchStyles.scopeColumn}>
                          <strong>✕ Dahil Olmayanlar</strong>
                          <ul>{scope.excluded.map((item: string) => <li key={item}>{item}</li>)}</ul>
                        </div>
                        {selectedSafetyGuidance && (
                          <div className={matchStyles.safety}>
                            <strong>Önemli Güvenlik Notu ({selectedSafetyGuidance.title}):</strong> {selectedSafetyGuidance.body}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })()}

                {classification.candidates.length > 1 && (
                  <div className={matchStyles.alternatives}>
                    <span className={matchStyles.alternativesLabel}>Başka bir hizmet seçin</span>
                    <div className={matchStyles.chips}>
                      {classification.candidates
                        .filter(candidate => candidate.service.id !== selectedServiceId)
                        .slice(0, 3)
                        .map(candidate => (
                          <button
                            type="button"
                            key={candidate.service.id}
                            className={matchStyles.chip}
                            onClick={() => setSelectedServiceId(candidate.service.id)}
                          >
                            {candidate.service.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-default, #DCE2DF)' }}>
                  <a
                    href="#services"
                    style={{ fontSize: '0.9rem', color: '#0E6F47', fontWeight: 600, textDecoration: 'underline' }}
                    onClick={() => setDialog(false)}
                  >
                    Kategorilerden hizmet seç
                  </a>
                </div>
              </>
            ) : (
              <div className={matchStyles.empty}>
                <p>Bu açıklamaya uygun bir hizmet bulamadık. Açıklamanızı değiştirebilir veya kategorilerden hizmet seçebilirsiniz.</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                  <Button type="button" onClick={() => setDialog(false)}>Aramayı düzenle</Button>
                  <a
                    href="#services"
                    style={{ fontSize: '0.95rem', color: '#0E6F47', fontWeight: 600, textDecoration: 'underline' }}
                    onClick={() => setDialog(false)}
                  >
                    Kategorilerden hizmet seç
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── TALEP SİHİRBAZI (WIZARD MODALI) ───────────────────────── */}
      {wizardServiceId && (() => {
        const activeService = services.find(s => s.id === wizardServiceId);
        if (!activeService) return null;
        return (
          <RequestWizard
            service={activeService}
            onClose={() => {
              setWizardServiceId(null);
              setWizardReferenceWork(null);
            }}
            remoteDraft={remoteDraft}
            referenceWork={wizardReferenceWork ? {
              id: wizardReferenceWork.id,
              title: wizardReferenceWork.title,
              image: wizardReferenceWork.image,
              artisanName: wizardReferenceWork.artisanName,
              artisanDistrict: wizardReferenceWork.artisanDistrict,
            } : undefined}
          />
        );
      })()}

    </main>
  );
}
