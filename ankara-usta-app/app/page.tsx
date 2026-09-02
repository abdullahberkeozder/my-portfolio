'use client';

import { FormEvent, useEffect, useState } from 'react';
import { serviceCategories, services, servicesByCategory } from './data/serviceTaxonomy';
import { getServiceSafetyGuidance, packageScopePreview } from './data/serviceGuidance';
import { ClassificationResult, classifyService } from './lib/classifyService';
import RequestWizard from './components/RequestWizard';
import OrchestraLogo from './components/OrchestraLogo';
import AppHeader from './components/AppHeader';
import { useModalDialog } from './hooks/useModalDialog';
import Button from './components/Button';
import { trackFunnel } from './lib/analytics';

export default function Home() {
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [wizardServiceId, setWizardServiceId] = useState<string | null>(null);
  const [remoteDraft, setRemoteDraft] = useState<Parameters<typeof RequestWizard>[0]['remoteDraft']>();
  const classificationDialogRef = useModalDialog<HTMLElement>(dialog, () => setDialog(false));

  const selectedClassificationService = services.find(item => item.id === selectedServiceId);
  const selectedSafetyGuidance = selectedClassificationService
    ? getServiceSafetyGuidance(selectedClassificationService)
    : undefined;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draftId');
    const serviceId = params.get('service');
    if (!draftId || !serviceId) return;
    let active = true;
    void fetch(`/api/requests/${encodeURIComponent(draftId)}`)
      .then(async response => {
        if (!response.ok) throw new Error('Taslak yüklenemedi.');
        return response.json() as Promise<{request: {id:string;answers:Record<string,string>;district:string|null;neighborhood:string|null;preferred_timing:string|null;idempotency_key:string}}>;
      })
      .then(({request}) => {
        if (!active) return;
        const definition = services.find(item => item.id === serviceId);
        if (!definition) return;
        setRemoteDraft({answers:request.answers??{},district:request.district??'',neighborhood:request.neighborhood??'',timing:request.preferred_timing??'Bu hafta',step:0,idempotencyKey:request.idempotency_key,requestId:request.id,updatedAt:Date.now()});
        setWizardServiceId(serviceId);
      })
      .catch(() => { if (active) setRemoteDraft(undefined); });
    return () => { active = false; };
  }, []);


  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    const result = classifyService(query);
    trackFunnel('service_search', {candidateCount: result.candidates.length});
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
    trackFunnel('wizard_started', {serviceId:selectedServiceId});
    setWizardServiceId(selectedServiceId);
  }

  return (
    <main className="app-shell landing-page">
      <AppHeader role="visitor" />

      {/* Yellow brand opening with a focused service search. */}
      <section className="orkestra-hero-zone" aria-labelledby="hero-title">
        <div className="orkestra-hero-inner">
          <div className="orkestra-hero-emblem">
            <OrchestraLogo size={96} variant="primary" />
          </div>

          <div className="orkestra-hero-heading-stage">
            <h1 id="hero-title" className="orkestra-hero-title">
              İşini anlat.<br />Doğru ustayla buluş.
            </h1>
          </div>
          <p className="orkestra-hero-tagline">
            Evde yapılacak bir iş mi var? Ankara’da hizmetini bul, kapsamı belirle, teklifleri karşılaştır.
          </p>

          {/* Global Search Shell */}
          <form className="orkestra-search-shell" role="search" onSubmit={submitSearch}>
            <label htmlFor="service-search-input" className="sr-only">
              İhtiyacınızı yazın
            </label>
            <input
              id="service-search-input"
              className="orkestra-search-input"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Hangi iş için yardıma ihtiyacın var?"
            />
            <button type="submit" className="orkestra-search-btn" aria-label="Hizmet bul">
              Hizmet bul →
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="orkestra-chips-row" aria-label="Hızlı arama etiketleri">
            {['Musluk Değişimi', 'Tek Oda Boya', 'Avize Montajı', 'Priz Tamiri', 'Mobilya Kurulumu', 'TV Duvar Montajı'].map(hint => (
              <button
                type="button"
                className="orkestra-chip-pill"
                onClick={() => startClassification(hint)}
                key={hint}
              >
                {hint}
              </button>
            ))}
          </div>
          <a className="orkestra-hero-scroll" href="#services" aria-label="Hizmetleri incele">↓</a>
        </div>
      </section>

      {/* 2. Orbital Ensemble Section (Image 2 Style) */}
      <section className="orkestra-ensemble-section" id="services" tabIndex={-1} aria-labelledby="ensemble-title">
        <div className="ensemble-inner">
          <div className="ensemble-statement">
            <span className="ensemble-kicker">EVDEKİ İŞLER, BİR ARADA</span>
            <h2 id="ensemble-title" className="ensemble-title">
              Küçük bir tamir.<br />Büyük bir rahatlık.
            </h2>
            <p className="ensemble-desc">
              Montaj, tesisat, boya veya temizlik. İhtiyacına uygun hizmeti seç; yapılacak işi birlikte netleştirelim.
            </p>
          </div>

          <div className="ensemble-grid">
            {serviceCategories.map((category, idx) => {
              const catServices = servicesByCategory(category.id);
              const numStr = (idx + 1).toString().padStart(2, '0');
              return (
                <article key={category.id} className="ensemble-card">
                  <div>
                    <span className="ensemble-card-num">{numStr} / KATEGORİ</span>
                    <h3 className="ensemble-card-title">{category.name}</h3>
                    <p className="ensemble-card-text">
                      {catServices.map(s => s.name).slice(0, 3).join(', ')} ve {catServices.length} uzmanlık alanı.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ensemble-card-btn"
                    onClick={() => startClassification(catServices[0]?.name || category.name)}
                  >
                    <span>Talep Başlat</span>
                    <span>→</span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Trust & Guarantee Strip */}
      <section className="tr-section guarantee-section" aria-labelledby="guarantee-title">
        <div className="guarantee-header-row">
          <div className="guarantee-header-left">
            <span className="guarantee-kicker">KORUMA & ŞEFFAFLIK</span>
            <h2 id="guarantee-title" className="guarantee-title">Memnuniyetiniz, güvencemiz.</h2>
            <p className="guarantee-subtitle">Talep kapsamı, teklifler, onaylar ve iş kayıtları aynı süreç içinde izlenebilir.</p>
          </div>
        </div>
        <div className="guarantee-grid">
          <article className="guarantee-card">
            <div className="guarantee-card-badge">01</div>
            <h3>Şeffaf Kapsam ve Dijital Fiş</h3>
            <p>Seçtiğiniz seçenekler doğrulanabilir dijital talep fişine dönüşür; dahil ve hariç kapsam net olarak kayıt altına alınır.</p>
          </article>
          <article className="guarantee-card">
            <div className="guarantee-card-badge">02</div>
            <h3>Kontrol Edilen Usta Başvuruları</h3>
            <p>Usta başvuruları operasyon ekibi tarafından incelenir; yalnız kontrolü tamamlanan belge türleri ayrı doğrulama bilgisi olarak gösterilir.</p>
          </article>
          <article className="guarantee-card">
            <div className="guarantee-card-badge">03</div>
            <h3>Müşteri Onaylı İş Günlüğü</h3>
            <p>İşin kapsamı, değişiklikleri ve görsel kayıtları müşteri kabulüyle birlikte dijital iş günlüğünde tutulur.</p>
          </article>
        </div>
      </section>

      {/* 5. How it Works Section */}
      <section className="how-section studio-how-section" aria-labelledby="how-it-works-title">
        <div className="how-card studio-how-card">
          <span className="how-kicker">3 ADIMDA KOLAY SÜREÇ</span>
          <h2 id="how-it-works-title">Evinizdeki işi nasıl çözeriz?</h2>
          <ol className="how-steps-list">
            <li className="how-step-item">
              <span className="step-num-pill">1</span>
              <div className="step-text-wrap">
                <strong>Sorunu anlatın veya seçin</strong>
                <p>26 uzmanlık alanından birini arayın; sorularla işin kapsamı netleşsin.</p>
              </div>
            </li>
            <li className="how-step-item">
              <span className="step-num-pill">2</span>
              <div className="step-text-wrap">
                <strong>Başvurusu onaylanmış zanaatkarla eşleşin</strong>
                <p>Hizmet modeline göre net paket kapsamı, karşılaştırılabilir teklif veya yerinde keşif planlayın.</p>
              </div>
            </li>
            <li className="how-step-item">
              <span className="step-num-pill">3</span>
              <div className="step-text-wrap">
                <strong>Dijital iş fişiyle onaylayın</strong>
              <p>İş dijital günlüğe kaydedilsin; kapsam değişiklikleri ve müşteri kabulü sonradan incelenebilsin.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="how-photo">
          <div className="how-bond-signature">
            <OrchestraLogo size={42} variant="primary" />
            <div className="how-signature-text">
              <strong>Kayıtlı iş kapsamı</strong>
              <span>Talep, değişiklik ve müşteri onayı aynı akışta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Classification Match Dialog */}
      {dialog && classification && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setDialog(false)}>
          <section
            ref={classificationDialogRef}
            tabIndex={-1}
            className="request-dialog classification-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={event => event.stopPropagation()}
          >
            <button data-dialog-initial-focus className="dialog-close" onClick={() => setDialog(false)} aria-label="Kapat">×</button>
            <span className="account-eyebrow">HİZMET EŞLEŞTİRME</span>
            <h2 id="dialog-title">İhtiyacınızı Doğru Anladık mı?</h2>
            <p className="query-echo">“{classification.query}”</p>
            {classification.candidates.length > 0 ? (
              <>
                <div className="progressive-match-hero">
                  <div className="match-hero-top">
                    <span className={`confidence confidence-${classification.confidence}`}>
                      {classification.confidence === 'high' ? '✓ Güçlü Eşleşme' : classification.confidence === 'medium' ? '● Muhtemel Eşleşme' : '○ Birlikte Netleştirelim'}
                    </span>
                    <span className="match-category-tag">
                      {serviceCategories.find(c => c.id === selectedClassificationService?.categoryId)?.name}
                    </span>
                  </div>
                  <h3 className="match-service-headline">{selectedClassificationService?.name}</h3>
                  <p className="match-single-rationale">
                    {classification.candidates.find(candidate => candidate.service.id === selectedServiceId)?.explanation}
                  </p>
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="match-actions-stack">
                  <Button variant="primary" type="button" disabled={!selectedServiceId} onClick={continueToWizard}>
                    Bu Hizmetle Devam Et →
                  </Button>
                  <button
                    type="button"
                    className="match-discovery-btn"
                    onClick={() => {
                      if (!selectedServiceId) return;
                      setDialog(false);
                      setWizardServiceId(selectedServiceId);
                    }}
                  >
                    Emin Değilim, Keşif Talep Et
                  </button>
                </div>

                {/* Scope Guidance accordion */}
                {selectedClassificationService && (
                  <details className="match-scope-details">
                    <summary className="scope-details-summary">
                      <span>Dahil & Hariç Kapsam Detayları</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <div className="scope-details-content">
                      <div className="scope-col-included">
                        <strong>✓ Dahil Olanlar</strong>
                        <ul>
                          {packageScopePreview.included.map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="scope-col-excluded">
                        <strong>✕ Dahil Olmayanlar</strong>
                        <ul>
                          {packageScopePreview.excluded.map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      {selectedSafetyGuidance && (
                        <div className="scope-safety-alert">
                          <strong>Önemli Güvenlik Notu ({selectedSafetyGuidance.title}):</strong> {selectedSafetyGuidance.body}
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Alternative Candidates */}
                {classification.candidates.length > 1 && (
                  <div className="match-alternatives-zone">
                    <span className="alternatives-label">Diğer Olası Hizmetler:</span>
                    <div className="alternatives-chips">
                      {classification.candidates.slice(1, 4).map(candidate => (
                        <button
                          type="button"
                          key={candidate.service.id}
                          className={`alt-chip ${selectedServiceId === candidate.service.id ? 'active' : ''}`}
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
              <div className="no-match-state">
                <p>Sorunuza uygun otomatik hizmet eşleştiremedik. Lütfen aşağıdaki kategorilerden birini seçin:</p>
                <div className="manual-categories">
                  {serviceCategories.map(category => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => {
                        const first = servicesByCategory(category.id)[0];
                        if (first) {
                          setSelectedServiceId(first.id);
                          setDialog(false);
                          setWizardServiceId(first.id);
                        }
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Progressive Step Wizard Dialog */}
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
