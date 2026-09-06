'use client';

import { FormEvent, useEffect, useState } from 'react';
import {useRouter} from 'next/navigation';
import { serviceCategories, services, servicesByCategory } from './data/serviceTaxonomy';
import { getServiceSafetyGuidance, packageScopePreview } from './data/serviceGuidance';
import { ClassificationResult, classifyService } from './lib/classifyService';
import RequestWizard from './components/RequestWizard';
import OrchestraLogo from './components/OrchestraLogo';
import { useModalDialog } from './hooks/useModalDialog';
import Button from './components/Button';
import matchStyles from './components/serviceMatch.module.css';
import styles from './home.module.css';
import { trackFunnel } from './lib/analytics';

export default function Home() {
  const router=useRouter();
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
    if (params.get('resume') === '1' && serviceId && services.some(service => service.id === serviceId)) {
      queueMicrotask(() => {setRemoteDraft(undefined);setWizardServiceId(serviceId);});
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
    <main className={styles.home}>


      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <div className={styles.emblem}>
            <OrchestraLogo size={48} variant="primary" />
          </div>

          <div>
            <h1 id="hero-title" className={styles.title}>
              İşini anlat.<br />Doğru ustayla buluş.
            </h1>
          </div>
          <p className={styles.intro}>
            Evde yapılacak bir iş mi var? Ankara’da hizmetini bul, kapsamı belirle, teklifleri karşılaştır.
          </p>

          {/* Global Search Shell */}
          <form className={styles.search} role="search" onSubmit={submitSearch}>
            <label htmlFor="service-search-input">
              İhtiyacınızı yazın
            </label>
            <div className={styles.searchControls}>
            <input
              id="service-search-input"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Örn. mutfak musluğum su kaçırıyor"
              required
              maxLength={500}
            />
            <button type="submit" aria-label="Hizmet bul">
              Hizmet bul →
            </button>
            </div>
          </form>

          {/* Quick Search Chips */}
          <div className={styles.suggestions} aria-label="Hızlı arama etiketleri">
            {['Musluk Değişimi', 'Tek Oda Boya', 'Avize Montajı'].map(hint => (
              <button
                type="button"
                onClick={() => startClassification(hint)}
                key={hint}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.catalog} id="services" tabIndex={-1} aria-labelledby="ensemble-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2 id="ensemble-title">
              Hizmetleri keşfedin
            </h2>
            <p>
              Bir kategori açın, ihtiyacınıza uygun hizmeti seçin.
            </p>
          </div>

          <div className={styles.categories}>
            {serviceCategories.map(category => (
              <details key={category.id} className={styles.category} name="service-category">
                <summary>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>{servicesByCategory(category.id).length} hizmet</span>
                  <span className={styles.categoryIndicator} aria-hidden="true">+</span>
                </summary>
                <ul className={styles.serviceList}>
                  {servicesByCategory(category.id).map(service => (
                    <li key={service.id}><button type="button" onClick={() => {
                      trackFunnel('wizard_started', { serviceId: service.id });
                      setRemoteDraft(undefined);
                      setWizardServiceId(service.id);
                    }}>{service.name} <span aria-hidden="true">→</span></button></li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="guarantee-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2 id="guarantee-title">Talebinizden işin tamamlanmasına</h2>
            <p>Ustayı siz seçin, anlaştığınız kapsamı birlikte takip edin.</p>
          </div>
          <ol className={styles.steps}>
            <li>
              <h3>Yapılacak işi anlatın</h3>
              <p>Hizmeti seçin; konum, zaman ve işin ayrıntılarını ekleyin. Göndermeden önce özetinizi kontrol edin.</p>
            </li>
            <li>
              <h3>Teklifleri karşılaştırın</h3>
              <p>Fiyatı ve kapsamı inceleyin. Karar vermeden önce ustayla ayrıntıları konuşun.</p>
            </li>
            <li>
              <h3>Anlaşın ve işi takip edin</h3>
              <p>Kabul ettiğiniz teklif, mesajlar ve iş kayıtları aynı yerde kalsın. İş tamamlandığında değerlendirin.</p>
            </li>
          </ol>
        </div>
      </section>



      {/* Classification Match Dialog */}
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
            <p className={matchStyles.query}>“{classification.query}”</p>
            {classification.candidates.length > 0 ? (
              <>
                <div className={matchStyles.hero}>
                  <div className={matchStyles.meta}>
                    <span className={matchStyles.confidence}>
                      {selectedServiceId !== classification.candidates[0]?.service.id ? 'Alternatif hizmet' : classification.confidence === 'high' ? '✓ Güçlü Eşleşme' : classification.confidence === 'medium' ? '● Muhtemel Eşleşme' : '○ Birlikte Netleştirelim'}
                    </span>
                    <span className={matchStyles.category}>
                      {serviceCategories.find(c => c.id === selectedClassificationService?.categoryId)?.name}
                    </span>
                  </div>
                  <h3 className={matchStyles.serviceTitle}>{selectedClassificationService?.name}</h3>
                  <p className={matchStyles.rationale}>
                    {classification.candidates.find(candidate => candidate.service.id === selectedServiceId)?.explanation}
                  </p>
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className={matchStyles.actions}>
                  <Button variant="primary" type="button" disabled={!selectedServiceId} onClick={continueToWizard}>
                    Bu Hizmetle Devam Et →
                  </Button>

                </div>

                {/* Scope Guidance accordion */}
                {selectedClassificationService && (
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
                        <ul>
                          {packageScopePreview.included.map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={matchStyles.scopeColumn}>
                        <strong>✕ Dahil Olmayanlar</strong>
                        <ul>
                          {packageScopePreview.excluded.map((item: string) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      {selectedSafetyGuidance && (
                        <div className={matchStyles.safety}>
                          <strong>Önemli Güvenlik Notu ({selectedSafetyGuidance.title}):</strong> {selectedSafetyGuidance.body}
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Alternative Candidates */}
                {classification.candidates.length > 1 && (
                  <div className={matchStyles.alternatives}>
                    <span className={matchStyles.alternativesLabel}>Diğer Olası Hizmetler:</span>
                    <div className={matchStyles.chips}>
                      {classification.candidates.filter(candidate => candidate.service.id !== selectedServiceId).slice(0, 3).map(candidate => (
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
