'use client';

import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Service, serviceCategories } from '../data/serviceTaxonomy';
import { getWizardDefinition } from '../data/wizardDefinitions';
import { ankaraDistricts, ankaraNeighborhoods } from '../data/ankaraLocations';
import { getWizardSafetyGuidance } from '../data/wizardSafety';
import { getVisibleWizardQuestions, pruneWizardAnswers } from '../domain';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { useModalDialog } from '../hooks/useModalDialog';
import Button from './Button';
import WorkReceipt from './WorkReceipt';
import { CategoryIcon } from './CategoryIcon';
import { trackFunnel } from '../lib/analytics';
import {WizardLocationStep,WizardMediaStep,WizardQuestionStep,WizardSummaryStep} from './wizard/WizardStepScreens';

type Props = { service: Service; onClose: () => void; remoteDraft?: LocalDraft };
type LocalDraft = {
  answers: Record<string, string>;
  district: string;
  neighborhood: string;
  timing: string;
  step: number;
  idempotencyKey: string;
  requestId?: string;
  updatedAt: number;
};
type ApiBody = { error?: string; request?: { id: string } };

function readLocalDraft(storageKey: string): LocalDraft | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return undefined;
    const draft = JSON.parse(saved) as LocalDraft;
    if (!draft.updatedAt || Date.now() - draft.updatedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(storageKey);
      return undefined;
    }
    return draft;
  } catch {
    return undefined;
  }
}

const deliveryLabels = {
  package: 'Paket Hizmet',
  quote: 'Teklif Modeli',
  inspection: 'Keşif Modeli'
};

const resultContent = {
  package: {
    eyebrow: 'PAKET HİZMET',
    title: 'Standart kapsamlı talep',
    copy: 'Kapsamınız standart bir işe karşılık geliyor. Talebiniz, seçtiğiniz zaman tercihiyle uygun ve başvurusu onaylanmış hizmet verenlere iletilecek.',
    cta: 'Talebi ve Fişi Onayla',
  },
  quote: {
    eyebrow: 'TEKLİF MODELİ',
    title: 'Karşılaştırılabilir teklifler alın',
    copy: 'Talebiniz aynı kapsam fişiyle uygun ustalara iletilecek. İşçilik, malzeme, süre ve hariç kapsam alanlarını yan yana karşılaştırabileceksiniz.',
    cta: 'Teklif Talebini Başlat',
  },
  inspection: {
    eyebrow: 'KEŞİF MODELİ',
    title: 'Önce uzman değerlendirmesi gerekli',
    copy: 'Fiyat ve uygulama yöntemi yerinde incelemeye bağlı. Talebiniz keşif yapabilen uygun ustalarla eşleştirilecek.',
    cta: 'Keşif Talebini Gönder',
  },
};

export default function RequestWizard({ service, onClose, remoteDraft }: Props) {
  const router = useRouter();
  const dialogRef = useModalDialog<HTMLElement>(true, onClose);
  const definition = getWizardDefinition(service.id);
  const storageKey = `ankara-usta:draft:${service.id}`;
  const [initialDraft] = useState(() => remoteDraft ?? readLocalDraft(storageKey));
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft?.answers ?? {});
  const [files, setFiles] = useState<File[]>([]);
  const [district, setDistrict] = useState(initialDraft?.district ?? '');
  const [neighborhood, setNeighborhood] = useState(initialDraft?.neighborhood ?? '');
  const [timing, setTiming] = useState(initialDraft?.timing ?? 'Bu hafta içinde');
  const [idempotencyKey] = useState(() => initialDraft?.idempotencyKey ?? crypto.randomUUID());
  const [requestId, setRequestId] = useState<string | undefined>(initialDraft?.requestId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [mediaMessage, setMediaMessage] = useState('');
  const [showMobileReceipt, setShowMobileReceipt] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(() => {
    const initialQuestions = getVisibleWizardQuestions(definition, initialDraft?.answers ?? {});
    const firstUnanswered = initialQuestions.findIndex(question => !initialDraft?.answers?.[question.id]);
    return firstUnanswered === -1 ? Math.max(initialQuestions.length - 1, 0) : firstUnanswered;
  });

  const questions = getVisibleWizardQuestions(definition, answers);
  const category = serviceCategories.find(item => item.id === service.categoryId);
  const result = resultContent[service.deliveryModel];
  const activeQuestion = questions[questionIndex];
  const activeQuestionId = activeQuestion?.id;
  const activeAnswer = activeQuestionId ? answers[activeQuestionId] : undefined;
  const questionCount = questions.length;
  const locationComplete = Boolean(district && neighborhood.trim());
  const availableNeighborhoods = district ? ankaraNeighborhoods[district] ?? [] : [];
  const safetyGuidance = getWizardSafetyGuidance(service.id, answers);
  const scopeComplete = questions.every(question => Boolean(answers[question.id]));
  const totalProgressSteps = questions.length + 3;
  const currentProgressStep = step === 0 ? questionIndex + 1 : questions.length + step;
  const progressContext = step === 0
    ? `Kapsam sorusu ${questionIndex + 1} / ${questions.length}`
    : ['Görseller', 'Konum ve zaman', 'Talep özeti'][step - 1];

  useEffect(() => {
    const draft: LocalDraft = {
      answers,
      district,
      neighborhood,
      timing,
      step,
      idempotencyKey,
      requestId,
      updatedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [answers, district, idempotencyKey, neighborhood, requestId, step, storageKey, timing]);

  function filesChanged(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const oversized = selectedFiles.find(file => file.size > 52_428_800);
    if (oversized) {
      event.target.value = '';
      setFiles([]);
      setMediaMessage(`${oversized.name} 50 MB sınırını aşıyor. Daha küçük bir dosya seçin.`);
      return;
    }
    setMediaMessage('');
    setFiles(selectedFiles);
  }

  const saveDraft = useCallback(async (showAuthError = false) => {
    const response = await fetch('/api/requests/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey,
        serviceId: service.id,
        answers,
        district: district || undefined,
        neighborhood: neighborhood || undefined,
        preferredTiming: timing,
      }),
    });
    const body = (await response.json()) as ApiBody;
    if (response.status === 401) {
      if (showAuthError)
        setMessage(
          'Talebi göndermek için önce müşteri hesabınıza giriş yapın.'
        );
      return undefined;
    }
    if (!response.ok) throw new Error(body.error ?? 'Taslak kaydedilemedi.');
    if (!body.request) throw new Error('Sunucu geçerli bir taslak döndürmedi.');
    setRequestId(body.request.id);
    return body.request.id;
  }, [answers, district, idempotencyKey, neighborhood, service.id, timing]);

  const continueFromScope = useCallback(async () => {
    setStep(1);
    try {
      await saveDraft(false);
    } catch {
      /* Local draft remains available offline */
    }
  }, [saveDraft]);

  function continueFromQuestion() {
    if (!activeQuestionId || !activeAnswer) return;
    if (questionIndex < questionCount - 1) {
      setQuestionIndex(current => current + 1);
      return;
    }
    void continueFromScope();
  }

  function handleSelectOption(option: string) {
    if (!activeQuestionId) return;
    setAnswers(current => pruneWizardAnswers(definition, { ...current, [activeQuestionId]: option }));
  }


  useEffect(() => {
    if (step !== 0 || !activeQuestion) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= activeQuestion.options.length) {
        const selectedOpt = activeQuestion.options[num - 1];
        setAnswers(current => pruneWizardAnswers(definition, { ...current, [activeQuestion.id]: selectedOpt }));
      } else if (e.key === 'Enter' && activeAnswer) {

        e.preventDefault();
        if (questionIndex < questionCount - 1) setQuestionIndex(current => current + 1);
        else void continueFromScope();
      } else if (e.key === 'Backspace' && questionIndex > 0) {
        e.preventDefault();
        setQuestionIndex(curr => curr - 1);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, activeQuestion, activeAnswer, questionIndex, questionCount, definition, continueFromScope]);

  async function uploadFiles(targetRequestId: string) {
    if (!files.length) return;
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Medya yüklemek için oturum açmalısınız.');

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fingerprintSource = new TextEncoder().encode(`${file.name}:${file.size}:${file.lastModified}`);
      const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', fingerprintSource)))
        .map(value => value.toString(16).padStart(2, '0')).join('').slice(0, 32);
      const storagePath = `${user.id}/${targetRequestId}/${fingerprint}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('request-media')
        .upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadError && !uploadError.message.toLocaleLowerCase('tr-TR').includes('already exists')) throw uploadError;

      try {
        const response = await fetch(`/api/requests/${targetRequestId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({storagePath, originalName: file.name, contentType: file.type, byteSize: file.size}),
        });
        const body = (await response.json()) as { error?: string; correlationId?: string };
        if (!response.ok) throw new Error(`${body.error ?? 'Medya kaydı tamamlanamadı.'}${body.correlationId ? ` (${body.correlationId})` : ''}`);
      } catch (error) {
        if (!uploadError) await supabase.storage.from('request-media').remove([storagePath]);
        throw error;
      }
    }
  }

  async function submitRequest() {
    setBusy(true);
    setMessage('');
    try {
      const targetRequestId = (await saveDraft(true)) ?? requestId;
      if (!targetRequestId) return;
      await uploadFiles(targetRequestId);

      const response = await fetch(`/api/requests/${targetRequestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey }),
      });
      const body = (await response.json()) as ApiBody;
      if (!response.ok) throw new Error(body.error ?? 'Talep gönderilemedi.');
      localStorage.removeItem(storageKey);
      trackFunnel('wizard_completed', {serviceId:service.id, deliveryModel:service.deliveryModel});
      router.push('/taleplerim');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Talep gönderilemedi.');
    } finally {
      setBusy(false);
    }
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="dialog-backdrop wizard-backdrop frosted-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="request-dialog wizard-dialog swiss-monolith-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={step === 0 ? service.name : undefined}
        aria-labelledby={step !== 0 ? 'wizard-title' : undefined}
        onClick={event => event.stopPropagation()}
      >
        <button
          data-dialog-initial-focus
          className="dialog-close swiss-close-btn"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>

        <div
          className="wizard-progress"
          role="progressbar"
          aria-label="Talep adımları"
          aria-valuemin={1}
          aria-valuemax={totalProgressSteps}
          aria-valuenow={currentProgressStep}
          aria-valuetext={`${progressContext}, toplam ${totalProgressSteps} adım`}
        >
          <span style={{ width: `${(currentProgressStep / totalProgressSteps) * 100}%` }} />
        </div>

        <div className="wizard-progress-context" aria-hidden="true">
          <span>{progressContext}</span>
          <b>{currentProgressStep} / {totalProgressSteps}</b>
        </div>

        <div className="mobile-receipt-toggle-bar">
          <button
            type="button"
            className="receipt-toggle-btn"
            onClick={() => setShowMobileReceipt(v => !v)}
            aria-expanded={showMobileReceipt}
          >
            <span className="receipt-toggle-icon">🧾</span>
            <span className="receipt-toggle-text">
              Talep özeti ({answeredCount} seçim)
            </span>
            <small className="receipt-toggle-hint">
              {showMobileReceipt ? 'Özeti gizle ↑' : 'Özeti göster ↓'}
            </small>
          </button>
        </div>

        {showMobileReceipt && (
          <div className="mobile-receipt-drawer animate-slide-down">
            <WorkReceipt
              service={service}
              answers={answers}
              questions={questions}
              district={district}
              neighborhood={neighborhood}
              timing={timing}
              filesCount={files.length}
              idempotencyKey={idempotencyKey}
              step={step}
              isCompact
              calm
            />
          </div>
        )}

        <div className="wizard-split-layout">
          <div className="wizard-form-side">
            <div className="wizard-step-nav-bar">
              <div className="wizard-category-pill">
                {category && <CategoryIcon categoryId={category.id} size={15} />}
                <span>{category?.name}</span>
              </div>
              <div className="wizard-progress-pills" role="group" aria-label="Talep adımları">
                {['Kapsam', 'Görseller', 'Konum & Tarih', 'Onay'].map((stepLabel, idx) => (
                  <button
                    key={stepLabel}
                    type="button"
                    className={`step-pill-indicator ${idx === step ? 'active' : idx < step ? 'done' : ''}`}
                    aria-current={idx === step ? 'step' : undefined}
                    aria-label={`${idx + 1}. adım: ${stepLabel}${idx < step ? ', tamamlandı' : idx === step ? ', mevcut adım' : ''}`}
                    disabled={(idx > 0 && !scopeComplete) || (idx === 3 && !locationComplete)}
                    onClick={() => {
                      if (idx === 0) {
                        const firstUnanswered = questions.findIndex(question => !answers[question.id]);
                        setQuestionIndex(firstUnanswered === -1 ? Math.max(questions.length - 1, 0) : firstUnanswered);
                      }
                      setStep(idx);
                    }}
                  >
                    {idx < step ? '✓' : idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {step === 0 && (
              <WizardQuestionStep key={activeQuestionId} kicker={`SORU ${questionIndex + 1} / ${questions.length}`} title={activeQuestion?.label??'Kapsam sorusu'} note={questionIndex === 0 && <p className="wizard-account-note" role="note">
                    Hesabınız yoksa da başlayabilirsiniz. Yanıtlarınız bu cihazda taslak olarak korunur; yalnız gönderirken giriş yapmanız gerekir.
                  </p>}>

                <div className="wizard-zero-scroll-choices">
                  {activeQuestion && (
                    <fieldset key={activeQuestion.id} className="wizard-choice-fieldset">
                      <legend className="sr-only">{activeQuestion.label}</legend>
                      {activeQuestion.options.map((option, idx) => {
                        const isChecked = answers[activeQuestion.id] === option;
                        return (
                          <label
                            key={option}
                            className={`swiss-option-card ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleSelectOption(option)}
                          >
                            <input
                              type="radio"
                              name={activeQuestion.id}
                              value={option}
                              aria-label={option}
                              checked={isChecked}
                              onChange={() => handleSelectOption(option)}
                            />
                            <div className="option-inner-wrap">
                              <span className="option-key-badge font-mono" aria-hidden="true">[{idx + 1}]</span>
                              <span className="option-label-text">{option}</span>
                            </div>
                            {isChecked && <span className="option-check-badge">✓ Seçildi</span>}
                          </label>

                        );
                      })}
                    </fieldset>
                  )}
                </div>

                {safetyGuidance && (
                  <aside className={`wizard-safety-guidance is-${safetyGuidance.level}`} role="alert">
                    <strong>{safetyGuidance.title}</strong>
                    <p>{safetyGuidance.instruction}</p>
                  </aside>
                )}

                <div className="wizard-actions-bottom">
                  {questionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setQuestionIndex(current => current - 1)}
                      type="button"
                    >
                      ← Önceki Soru
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    disabled={!activeQuestion || !answers[activeQuestion.id]}
                    onClick={continueFromQuestion}
                    type="button"
                  >
                    {questionIndex === questions.length - 1 ? 'Görsellere devam et →' : 'Sonraki soru →'}
                  </Button>
                </div>
              </WizardQuestionStep>
            )}

            {step === 1 && (
              <WizardMediaStep kicker="GÖRSELLER" title="İsterseniz fotoğraf veya video ekleyin" description="Bu adım isteğe bağlıdır. Görseller ustanın işi daha net anlamasını ve doğru fiyat vermesini sağlar.">

                <label className="frosted-upload-zone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    multiple
                    onChange={filesChanged}
                  />
                  <div className="upload-zone-icon">📷</div>
                  <strong>Dosya seçin veya buraya sürükleyin</strong>
                  <small>JPG, PNG, WebP veya MP4 · Dosya başına maks. 50 MB</small>
                  {files.length > 0 && (
                    <span className="upload-file-success">
                      ✓ {files.length} dosya talebe eklendi
                    </span>
                  )}
                </label>

                {mediaMessage && <p className="wizard-inline-error" role="alert">{mediaMessage}</p>}

                <p className="media-privacy-note" role="note">
                  Yüklemeler herkese açık değildir ve hesabınızın özel alanında tutulur. Fotoğraf eklemeden de devam edebilirsiniz.
                </p>

                <div className="wizard-actions-bottom">
                  <Button variant="outline" onClick={() => setStep(0)} type="button">
                    ← Geri
                  </Button>
                  <Button variant="primary" onClick={() => setStep(2)} type="button">
                    Konum ve Tarih →
                  </Button>
                </div>
              </WizardMediaStep>
            )}

            {step === 2 && (
              <WizardLocationStep kicker="KONUM VE ZAMAN" title="İş nerede ve ne zaman yapılacak?" description="Açık adresiniz teklif onaylanana kadar gizli tutulur; yalnızca ilçe ve mahalle bilgisi paylaşılır.">

                <div className="swiss-location-form">
                  <div className="form-row-2col">
                    <label className="swiss-field">
                      <span>İlçe Seçin</span>
                      <select value={district} onChange={event => { setDistrict(event.target.value); setNeighborhood(''); }}>
                        <option value="">İlçe seçin</option>
                        {ankaraDistricts.map(item => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label className="swiss-field">
                      <span>Mahalle / Semt</span>
                      <select
                        value={neighborhood}
                        onChange={event => setNeighborhood(event.target.value)}
                        disabled={!district}
                      >
                        <option value="">{district ? 'Mahalle seçin' : 'Önce ilçe seçin'}</option>
                        {availableNeighborhoods.map(item => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="timing-choice-group">
                    <span className="timing-label">Tercih Edilen Zaman:</span>
                    <div className="timing-pills-row">
                      {['Mümkün olan en kısa sürede', 'Bu hafta içinde', 'Tarih konusunda esneğim'].map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`timing-pill ${timing === t ? 'active' : ''}`}
                          aria-pressed={timing === t}
                          onClick={() => setTiming(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bottom">
                  <Button variant="outline" onClick={() => setStep(1)} type="button">
                    ← Geri
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!locationComplete}
                    onClick={() => setStep(3)}
                    type="button"
                  >
                    Fişi İncele ve Tamamla →
                  </Button>
                </div>
              </WizardLocationStep>
            )}

            {step === 3 && (
              <WizardSummaryStep kicker={result.eyebrow} title={result.title} description={result.copy}>

                <div className="confirmation-meta-box">
                  <div className="meta-highlight-row">
                    <span>Hizmet Türü:</span>
                    <strong>{service.name} ({deliveryLabels[service.deliveryModel]})</strong>
                  </div>
                  <div className="meta-highlight-row">
                    <span>Bölge:</span>
                    <strong>{district}, {neighborhood}</strong>
                  </div>
                  <div className="meta-highlight-row">
                    <span>İş Güvencesi:</span>
                    <strong className="text-emerald">✓ Dijital İş Fişi ve Kayıtlı Kapsam</strong>
                  </div>
                </div>

                {message && (
                  <p className="account-message" role="alert" aria-live="assertive">
                    {message} {message.includes('giriş') && <Link href="/giris">Giriş sayfasına git</Link>}
                  </p>
                )}

                <div className="wizard-actions">
                  <Button variant="outline" onClick={() => setStep(2)} type="button">
                    ← Düzenle
                  </Button>
                  <Button
                    variant="primary"
                    loading={busy}
                    onClick={() => void submitRequest()}
                    type="button"
                  >
                    {result.cta}
                  </Button>
                </div>
              </WizardSummaryStep>
            )}
          </div>

          {/* Right Side: Live Animated Work Receipt */}
          <div className="wizard-receipt-side">
            <div className="receipt-sticky-wrapper">
              <WorkReceipt
                service={service}
                answers={answers}
                questions={questions}
                district={district}
                neighborhood={neighborhood}
                timing={timing}
                filesCount={files.length}
                idempotencyKey={idempotencyKey}
                step={step}
                calm
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
