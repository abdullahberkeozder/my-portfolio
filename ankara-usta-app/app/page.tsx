'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { serviceCategories, services, servicesByCategory } from './data/serviceTaxonomy';
import { getServiceSafetyGuidance, getCalibratedServiceScope } from './data/serviceGuidance';
import { isCorePilotService } from './data/pilotCoverage';
import { ClassificationResult, classifyService } from './lib/classifyService';
import RequestWizard from './components/RequestWizard';
import OrchestraLogo from './components/OrchestraLogo';
import { useModalDialog } from './hooks/useModalDialog';
import Button from './components/Button';
import FlatRateServices from './components/FlatRateServices';
import { Avatar, RatingStars } from './components/ui';
import matchStyles from './components/serviceMatch.module.css';
import styles from './home.module.css';
import { trackFunnel } from './lib/analytics';

type FeaturedProfessional = {
  userId: string;
  displayName: string;
  bio: string | null;
  city: string | null;
};

const REVIEWS = [
  { id: 'r1', name: 'Seda K.',  service: 'Musluk Değişimi', text: 'Çok hızlı geldi, temiz çalıştı. Tavsiyelere uydu, hiç sorun çıkarmadı.' },
  { id: 'r2', name: 'Murat T.', service: 'TV Duvar Montajı', text: 'Duvar beton ama hiç sorun çıkarmadan halletti. Kesinlikle tavsiye ederim.' },
  { id: 'r3', name: 'Ayşe B.',  service: 'Tek Oda Boya',    text: 'Fiyat makul, iş kalitesi çok iyiydi. Tekrar çalışırım kesinlikle.' },
  { id: 'r4', name: 'Can D.',   service: 'Elektrik Arızası', text: 'Akşam saatlerinde bile geldi. Hızlı ve profesyonel bir hizmet aldım.' },
] as const;

/* Ankara skyline SVG motifi */
function AnkaraSkyline() {
  return (
    <svg
      className={styles.skylineSvg}
      viewBox="0 0 1200 140"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0"   y="110" width="80"  height="30" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="90"  y="90"  width="60"  height="50" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="160" y="70"  width="100" height="70" fill="rgba(255,255,255,.04)" rx="3"/>
      {/* Atakule */}
      <rect x="270" y="10"  width="22"  height="130" fill="rgba(255,255,255,.06)" rx="3"/>
      <polygon points="274,10 288,10 281,0" fill="rgba(255,255,255,.06)"/>
      <rect x="260" y="110" width="42" height="30" fill="rgba(255,255,255,.05)" rx="2"/>
      {/* Orta bloklar */}
      <rect x="305" y="55"  width="90"  height="85" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="405" y="40"  width="130" height="100" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="545" y="75"  width="70"  height="65" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="625" y="85"  width="180" height="55" fill="rgba(255,255,255,.03)" rx="3"/>
      <rect x="815" y="50"  width="95"  height="90" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="920" y="90"  width="80"  height="50" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="1010" y="70" width="100" height="70" fill="rgba(255,255,255,.04)" rx="3"/>
      <rect x="1120" y="95" width="80"  height="45" fill="rgba(255,255,255,.03)" rx="3"/>
      {/* Ground */}
      <rect x="0" y="135" width="1200" height="5" fill="rgba(255,255,255,.08)"/>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [featuredPros, setFeaturedPros] = useState<FeaturedProfessional[]>([]);

  useEffect(() => {
    let active = true;
    void fetch('/api/tradespeople/featured')
      .then(async res => {
        if (!res.ok) throw new Error('Usta verisi alınamadı');
        return res.json() as Promise<{ professionals: FeaturedProfessional[] }>;
      })
      .then(data => {
        if (active && data?.professionals) {
          setFeaturedPros(data.professionals);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const [wizardServiceId, setWizardServiceId] = useState<string | null>(null);
  const [remoteDraft, setRemoteDraft] = useState<Parameters<typeof RequestWizard>[0]['remoteDraft']>();
  const classificationDialogRef = useModalDialog<HTMLElement>(dialog, () => setDialog(false));

  const selectedClassificationService = services.find(item => item.id === selectedServiceId);
  const selectedSafetyGuidance = selectedClassificationService
    ? getServiceSafetyGuidance(selectedClassificationService)
    : undefined;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId  = params.get('draftId');
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
        return response.json() as Promise<{request: {id:string;service_id:string;target_professional_id?:string|null;routing_mode?:string;answers:Record<string,string>;district:string|null;neighborhood:string|null;preferred_timing:string|null;idempotency_key:string}}>;
      })
      .then(({request}) => {
        if (!active) return;
        if (request.target_professional_id) {
          router.replace(`/ustalar/${encodeURIComponent(request.target_professional_id)}/talep?service=${encodeURIComponent(request.service_id)}&draftId=${encodeURIComponent(request.id)}`);
          return;
        }
        if(request.routing_mode && request.routing_mode!=='open')return;
        if(request.service_id!==serviceId)return;
        const definition = services.find(item => item.id === serviceId);
        if (!definition) return;
        setRemoteDraft({answers:request.answers??{},district:request.district??'',neighborhood:request.neighborhood??'',timing:request.preferred_timing??'Bu hafta',step:0,idempotencyKey:request.idempotency_key,requestId:request.id,updatedAt:Date.now()});
        setWizardServiceId(serviceId);
      })
      .catch(() => { if (active) setRemoteDraft(undefined); });
    return () => { active = false; };
  }, [router]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    const result = classifyService(query);
    trackFunnel('service_search', { candidateCount: result.candidates.length });
    setClassification(result);
    setSelectedServiceId(result.candidates[0]?.service.id ?? null);
    setDialog(true);
  }

  function startClassification(rawQuery: string) {
    setQuery(rawQuery);
    const result = classifyService(rawQuery);
    trackFunnel('service_selected');
    setClassification(result);
    setSelectedServiceId(result.candidates[0]?.service.id ?? null);
    setDialog(true);
  }

  function continueToWizard() {
    if (!selectedServiceId) return;
    setDialog(false);
    trackFunnel('wizard_started', { serviceId: selectedServiceId });
    setWizardServiceId(selectedServiceId);
  }

  return (
    <main className={styles.home}>

      {/* ── HERO ──────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCanvas} aria-hidden="true">
          <div className={styles.gridDots} />
          <AnkaraSkyline />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.emblem}>
            <OrchestraLogo size={52} variant="primary" />
          </div>

          <h1 id="hero-title" className={styles.title}>
            İşini anlat.<br />
            <span className={styles.titleAccent}>Doğru ustayla</span> buluş.
          </h1>

          <p className={styles.intro}>
            Evde yapılacak bir iş mi var? Ankara&apos;da hizmetini bul,
            kapsamı belirle, teklifleri karşılaştır.
          </p>

          <form className={styles.search} role="search" onSubmit={submitSearch}>
            <label htmlFor="service-search-input" className={styles.searchLabel}>
              İhtiyacınızı yazın
            </label>
            <div className={styles.searchGlass}>
              <input
                id="service-search-input"
                className={styles.searchInput}
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Örn. mutfak musluğum su kaçırıyor"
                required
                maxLength={500}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchBtn} aria-label="Hizmet bul">
                Hizmet bul →
              </button>
            </div>
          </form>

          <div className={styles.suggestions} aria-label="Hızlı arama etiketleri">
            {['Musluk Değişimi', 'Tek Oda Boya', 'Avize Montajı', 'Elektrik Arızası', 'Ev Temizliği'].map(hint => (
              <button
                key={hint}
                type="button"
                onClick={() => startClassification(hint)}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GÜVEN BANDI ───────────────────────────── */}
      <div className={styles.trustBand} aria-label="Platform güven göstergeleri">
        <div className={styles.trustInner}>
          {([
            ['5',     'Öncelikli Pilot İlçe'],
            ['26',    'Standart Kapsamlı Hizmet'],
            ['%100',  'Belge Doğrulamalı Usta'],
            ['3',     'Net Teklif Karşılaştırma'],
          ] as const).map(([num, label]) => (
            <div key={label} className={styles.trustStat}>
              <span className={styles.trustNum}>{num}</span>
              <span className={styles.trustLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HİZMET KATALOĞU ───────────────────────── */}
      <section className={styles.catalog} id="services" tabIndex={-1} aria-labelledby="catalog-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2 id="catalog-title">Hizmetleri keşfedin</h2>
            <p>Bir kategori açın, ihtiyacınıza uygun hizmeti seçin.</p>
          </div>

          <div className={styles.categories}>
            {serviceCategories.map(category => (
              <details key={category.id} className={styles.category} name="service-category">
                <summary>
                  <span className={styles.categoryIcon} aria-hidden="true">{category.icon}</span>
                  <span className={styles.categoryMeta}>
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.categoryDesc}>{category.description[0]}</span>
                  </span>
                  <span className={styles.categoryCount}>{servicesByCategory(category.id).length}</span>
                  <span className={styles.categoryChevron} aria-hidden="true">›</span>
                </summary>
                <ul className={styles.serviceList}>
                  {servicesByCategory(category.id).map(service => (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => {
                          trackFunnel('wizard_started', { serviceId: service.id });
                          setRemoteDraft(undefined);
                          setWizardServiceId(service.id);
                        }}
                      >
                        {service.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── SABİT PAKET HİZMETLER (TASKRABBIT MODELİ) ── */}
      <section className={styles.flatRateSection}>
        <div className={styles.sectionInner}>
          <FlatRateServices
            onSelectService={serviceId => {
              trackFunnel('wizard_started', { serviceId, source: 'flat_rate_package' });
              setRemoteDraft(undefined);
              setWizardServiceId(serviceId);
            }}
          />
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ─────────────────────────── */}
      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2 id="process-title">Talebinizden işin tamamlanmasına</h2>
            <p>Ustayı siz seçin, anlaştığınız kapsamı birlikte takip edin.</p>
          </div>
          <ol className={styles.steps}>
            {([
              ['📋', 'İhtiyacı ve kapsamı belirleyin', 'Hizmeti seçin; konum, zaman ve işin ayrıntılarını ekleyin. Göndermeden önce özetinizi kontrol edin.'],
              ['⚖️', 'En fazla 3 teklifi kıyaslayın',   'İşçilik, malzeme, süre ve garanti şartlarını yan yana inceleyin. Karar vermeden önce ustayla konuşun.'],
              ['✅', 'İş günlüğüyle takip edin',        'Kabul ettiğiniz teklif sözleşmeye dönüşsün. Öncesi/sonrası kanıtlar ve dijital işçilik belgesiyle iş tamamlansın.'],
            ] as const).map(([, title, desc], index) => (
              <li key={title} className={styles.step}>
                <div className={styles.stepOrb} aria-hidden="true">
                  {index + 1}
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── ÖNCÜ USTALAR ──────────────────────────── */}
      <section className={styles.proSection} aria-labelledby="pros-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionHeading}>
              <h2 id="pros-title">Öne Çıkan Ustalar</h2>
              <p>Ankara pilotunda başvurusu onaylı ve mesleki belgesi teyitli ustalar.</p>
            </div>
            <Link href="/ustalar" className={styles.seeAllProsBtn}>
              Tüm Doğrulanmış Ustalar →
            </Link>
          </div>
          <div className={styles.proScroll} role="list">
            {featuredPros.length > 0 ? (
              featuredPros.map(pro => (
                <Link
                  key={pro.userId}
                  href={`/ustalar/${encodeURIComponent(pro.userId)}`}
                  className={styles.proCard}
                  role="listitem"
                >
                  <div className={styles.proAvatarWrap}>
                    <Avatar name={pro.displayName} size="lg" verified={true} />
                  </div>
                  <span className={styles.proName}>{pro.displayName}</span>
                  {pro.bio && <span className={styles.proBioSnippet}>{pro.bio}</span>}
                  <span className={styles.proDistrict}>{pro.city || 'Ankara'}</span>
                  <span className={styles.proBadgeVerified}>🛡️ Doğrulanmış Usta</span>
                </Link>
              ))
            ) : (
              <div className={styles.proPilotNotice}>
                <div className={styles.pilotBadge}>🚀 Ankara Pilot Aşaması</div>
                <h3 className={styles.pilotTitle}>Doğrulama Süreci Devam Ediyor</h3>
                <p className={styles.pilotText}>
                  Orkestra&apos;da hiçbir zaman sahte veya simüle usta profili listelenmez (<strong>TRUST-01</strong>).
                  Mesleki yeterlilik ve kimlik belgeleri incelenen ilk ustalarımız onaylandıkça burada yer alacaktır.
                </p>
                <div className={styles.pilotActions}>
                  <Link href="/usta/basvuru" className={styles.pilotJoinBtn}>
                    Usta Olarak Başvur →
                  </Link>
                  <Link href="/ustalar" className={styles.pilotExploreBtn}>
                    Usta Dizinini İncele
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MÜŞTERİ YORUMLARI ─────────────────────── */}
      <section className={styles.reviewSection} aria-labelledby="reviews-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2 id="reviews-title">Müşteri Yorumları</h2>
            <p>Gerçek kullanıcı deneyimlerinden seçmeler.</p>
          </div>
          <div className={styles.reviews}>
            {REVIEWS.map(review => (
              <blockquote key={review.id} className={styles.reviewCard}>
                <RatingStars rating={5} size="sm" aria-label="5 üzerinden 5 yıldız" className={styles.reviewStars} />
                <p className={styles.reviewText}>{review.text}</p>
                <footer className={styles.reviewFooter}>
                  <Avatar name={review.name} size="sm" />
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewName}>{review.name}</span>
                    <span className={styles.reviewService}>{review.service}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── HİZMET SINIFLANDIRMA DİYALOĞU ────────── */}
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
            <span className={matchStyles.eyebrow}>HİZMET EŞLEŞTİRME</span>
            <h2 id="dialog-title">İhtiyacınızı Doğru Anladık mı?</h2>
            <p className={matchStyles.query}>&ldquo;{classification.query}&rdquo;</p>
            {classification.candidates.length > 0 ? (
              <>
                <div className={matchStyles.hero}>
                  <div className={matchStyles.meta}>
                    <span className={matchStyles.confidence}>
                      {selectedServiceId !== classification.candidates[0]?.service.id
                        ? 'Alternatif hizmet'
                        : classification.confidence === 'high'
                          ? '✓ Güçlü Eşleşme'
                          : classification.confidence === 'medium'
                            ? '● Muhtemel Eşleşme'
                            : '○ Birlikte Netleştirelim'}
                    </span>
                    <span className={matchStyles.category}>
                      {serviceCategories.find(c => c.id === selectedClassificationService?.categoryId)?.name}
                    </span>
                  </div>
                  <h3 className={matchStyles.serviceTitle}>
                    {selectedClassificationService?.name}
                    {selectedClassificationService && isCorePilotService(selectedClassificationService.id) && (
                      <span className="service-pilot-badge">Öncelikli Pilot</span>
                    )}
                  </h3>
                  <p className={matchStyles.rationale}>
                    {classification.candidates.find(candidate => candidate.service.id === selectedServiceId)?.explanation}
                  </p>
                </div>

                <div className={matchStyles.actions}>
                  <Button variant="primary" type="button" disabled={!selectedServiceId} onClick={continueToWizard}>
                    Bu Hizmetle Devam Et →
                  </Button>
                </div>

                {selectedClassificationService && (() => {
                  const scope = getCalibratedServiceScope(selectedClassificationService.id);
                  return (
                    <details className={matchStyles.details}>
                      <summary className={matchStyles.summary}>
                        <span>Kapsam hakkında</span>
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
                    <span className={matchStyles.alternativesLabel}>Diğer Olası Hizmetler:</span>
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
              </>
            ) : (
              <div className={matchStyles.empty}>
                <p>Bu açıklamaya uygun bir hizmet bulamadık. Açıklamanızı değiştirebilir veya kategorilerden hizmet seçebilirsiniz.</p>
                <Button type="button" onClick={() => setDialog(false)}>Aramayı düzenle</Button>
                <a className={styles.browseLink} href="#services" onClick={() => setDialog(false)}>Kategorilerden hizmet seç</a>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── TALEP SİHİRBAZI ───────────────────────── */}
      {wizardServiceId && (() => {
        const wizardService = services.find(s => s.id === wizardServiceId);
        if (!wizardService) return null;
        return (
          <RequestWizard
            service={wizardService}
            remoteDraft={remoteDraft}
            onClose={() => setWizardServiceId(null)}
          />
        );
      })()}

    </main>
  );
}
