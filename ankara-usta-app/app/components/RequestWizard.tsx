'use client';

import { ChangeEvent, useEffect, useState, useCallback, useRef } from 'react';
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
import { normalizeRequestTiming, requestTimings, requestTimingLabel } from '../domain/requestTiming';
import { trackFunnel } from '../lib/analytics';
import {WizardLocationStep,WizardMediaStep,WizardQuestionStep,WizardSummaryStep} from './wizard/WizardStepScreens';
import AccountDraftBoundary, {type DraftScope} from './AccountDraftBoundary';
import WizardPendingDialog from './WizardPendingDialog';
import {requestDraftKind, requestResumePath, requestRoutingSchema, type RequestTarget} from '../domain/requestRouting';
import styles from './requestWizardV6.module.css';

type Props = { service: Service; onClose: () => void; remoteDraft?: LocalDraft; targetProfessional?: RequestTarget };
type LocalDraft = {
  answers: Record<string, string>;
  district: string;
  neighborhood: string;
  timing: string;
  step: number;
  questionIndex?: number;
  pendingMediaCount?: number;
  idempotencyKey: string;
  requestId?: string;
  updatedAt: number;
  routingMode?: 'open' | 'direct';
  targetProfessionalId?: string;
};
type ApiBody = { error?: string; request?: { id: string } };

export function readLocalDraft(storageKey: string, storage:Storage = localStorage): LocalDraft | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const saved = storage.getItem(storageKey);
    if (!saved) return undefined;
    const draft = JSON.parse(saved) as LocalDraft;
    if (!draft || !draft.answers || typeof draft.answers !== 'object' || Array.isArray(draft.answers) ||
      !Object.values(draft.answers).every(value => typeof value === 'string') ||
      !Number.isInteger(draft.step) || draft.step < 0 || draft.step > 3 ||
      typeof draft.idempotencyKey !== 'string') return undefined;
    if (!draft.updatedAt || Date.now() - draft.updatedAt > 7 * 24 * 60 * 60 * 1000) {
      storage.removeItem(storageKey);
      return undefined;
    }
    return draft;
  } catch {
    return undefined;
  }
}

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

const deliveryLabels = {
  package: 'Paket Hizmet',
  quote: 'Teklif Modeli',
  inspection: 'Keşif Modeli'
};

export default function RequestWizard(props:Props) {
  return <AccountDraftBoundary key={requestDraftKind(props.service.id,props.targetProfessional?.id)} kind={requestDraftKind(props.service.id,props.targetProfessional?.id)} ttl={7*86400000}
    renderPending={content=><WizardPendingDialog serviceName={props.service.name} onClose={props.onClose}>{content}</WizardPendingDialog>}>
    {scope=><ScopedRequestWizard {...props} scope={scope}/>}
  </AccountDraftBoundary>;
}

function ScopedRequestWizard({ service, onClose, remoteDraft, scope, targetProfessional }: Props & {scope:DraftScope}) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const definition = getWizardDefinition(service.id);
  const storageKey = scope.key;
  const [initialDraft] = useState(() => (!scope.discardRemote && !scope.preferLocal ? remoteDraft : undefined) ?? readLocalDraft(storageKey,scope.storage));
  const routingMode = targetProfessional ? 'direct' as const : 'open' as const;
  const targetProfessionalId = targetProfessional?.id;
  const savedRouting = requestRoutingSchema.safeParse(initialDraft ?? {});
  const routingConflict = Boolean(initialDraft && (!savedRouting.success || savedRouting.data.targetProfessionalId !== targetProfessionalId));
  const dialogRef = useModalDialog<HTMLElement>(!routingConflict, onClose);
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft?.answers ?? {});
  const [files, setFiles] = useState<File[]>([]);
  const [district, setDistrict] = useState(initialDraft?.district ?? '');
  const [neighborhood, setNeighborhood] = useState(initialDraft?.neighborhood ?? '');
  const [timing, setTiming] = useState(() => {
    try { return normalizeRequestTiming(initialDraft?.timing ?? 'this_week'); }
    catch { return 'this_week' as const; }
  });
  const [idempotencyKey] = useState(() => initialDraft?.idempotencyKey ?? crypto.randomUUID());
  const [requestId, setRequestId] = useState<string | undefined>(initialDraft?.requestId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  const resumePath = requestResumePath(service.id,targetProfessionalId);
  const [mediaMessage, setMediaMessage] = useState('');
  const [requestedQuestionIndex, setQuestionIndex] = useState(() => {
    if (Number.isInteger(initialDraft?.questionIndex) && initialDraft!.questionIndex! >= 0) return initialDraft!.questionIndex!;
    const initialQuestions = getVisibleWizardQuestions(definition, initialDraft?.answers ?? {});
    const firstUnanswered = initialQuestions.findIndex(question => !initialDraft?.answers?.[question.id]);
    return firstUnanswered === -1 ? Math.max(initialQuestions.length - 1, 0) : firstUnanswered;
  });

  const questions = getVisibleWizardQuestions(definition, answers);
  const questionIndex = Math.min(requestedQuestionIndex, Math.max(questions.length - 1, 0));
  const category = serviceCategories.find(item => item.id === service.categoryId);
  const result = targetProfessional ? {
    eyebrow: 'USTAYA ÖZEL TALEP', title: `${targetProfessional.name} için talep özeti`,
    copy: 'Ustalar arasında yalnızca seçtiğiniz usta görebilir. Ustanın yanıt süresi gönderimden itibaren 48 saattir; bu bir hizmet veya randevu garantisi değildir. Yanıt gelmezse talebiniz kendiliğinden diğer ustalara açılmaz.',
    cta: 'Bu ustaya talebi gönder',
  } : resultContent[service.deliveryModel];
  const activeQuestion = questions[questionIndex];
  const activeQuestionId = activeQuestion?.id;
  const activeAnswer = activeQuestion?.options.includes(answers[activeQuestion.id]) ? answers[activeQuestion.id] : undefined;
  const questionCount = questions.length;
  const locationComplete = Boolean(district && ankaraNeighborhoods[district]?.includes(neighborhood) && (!targetProfessional || targetProfessional.districts.includes(district)));
  const availableNeighborhoods = district ? ankaraNeighborhoods[district] ?? [] : [];
  const safetyGuidance = getWizardSafetyGuidance(service.id, answers);
  const scopeComplete = questions.every(question => question.options.includes(answers[question.id]));
  const stepLabels = ['Kapsam', 'Görseller', 'Konum ve zaman', 'Özet'];

  useEffect(() => {
    if (formRef.current) formRef.current.scrollTop = 0;
    formRef.current?.querySelector<HTMLElement>('#wizard-title')?.focus({preventScroll:true});
  }, [step, questionIndex]);

  useEffect(() => {
    if (routingConflict) return;
    const draft: LocalDraft = {
      routingMode, targetProfessionalId,
      answers,
      district,
      neighborhood,
      timing,
      step,
      questionIndex,
      pendingMediaCount: files.length || initialDraft?.pendingMediaCount || 0,
      idempotencyKey,
      requestId,
      updatedAt: Date.now(),
    };
    try { scope.storage.setItem(storageKey, JSON.stringify(draft)); }
    catch { /* The auth handoff explicitly checks storage before leaving. */ }
  }, [answers, district, idempotencyKey, neighborhood, requestId, step, storageKey, timing, questionIndex, files.length, initialDraft?.pendingMediaCount, scope.storage, routingMode, targetProfessionalId, routingConflict]);

  function filesChanged(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;
    if (selectedFiles.some(file => !['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type))) {
      event.target.value = '';
      setMediaMessage('JPG, PNG, WebP veya MP4 biçiminde dosya seçin.');
      return;
    }
    const oversized = selectedFiles.find(file => file.size > 52_428_800);
    if (oversized) {
      event.target.value = '';
      setMediaMessage(`${oversized.name} 50 MB sınırını aşıyor. Daha küçük bir dosya seçin.`);
      return;
    }
    setMediaMessage('');
    setFiles(current => [...current, ...selectedFiles.filter(file => !current.some(existing =>
      existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified))]);
    event.target.value = '';
  }

  const saveDraft = useCallback(async (showAuthError = false) => {
    // Guests may complete the wizard locally; membership is required only to persist/publish.
    if (scope.guest) return undefined;
    if (routingConflict) throw new Error('Taslağın seçili ustası değişmiş. Taslağı kapatıp doğru profilden devam edin.');
    const response = await fetch('/api/requests/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routingMode, targetProfessionalId,
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
      if (showAuthError) {
        setNeedsAuth(true);
        setMessage(
          'Yanıtlarınız saklandı. Giriş veya kayıt sonrasında bu adıma döneceksiniz; talebiniz otomatik gönderilmeyecek.'
        );
      }
      return undefined;
    }
    if (!response.ok) throw new Error(body.error ?? 'Taslak kaydedilemedi.');
    setNeedsAuth(false);
    if (!body.request) throw new Error('Sunucu geçerli bir taslak döndürmedi.');
    setRequestId(body.request.id);
    return body.request.id;
  }, [answers, district, idempotencyKey, neighborhood, service.id, timing, routingMode, targetProfessionalId, routingConflict, scope.guest]);

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
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof Element && e.target.closest('button, a, input, textarea, select, [contenteditable="true"]'))) return;

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
    if (!scopeComplete || !locationComplete) {
      setMessage('Kapsam sorularını ve ustanın çalıştığı bölgedeki konumunuzu tamamlayın.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const targetRequestId = await saveDraft(true);
      if (!targetRequestId) return;
      await uploadFiles(targetRequestId);

      const response = await fetch(`/api/requests/${targetRequestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey }),
      });
      const body = (await response.json()) as ApiBody;
      if (response.status === 401) {
        setNeedsAuth(true);
        setMessage('Oturumunuz sona erdi. Giriş yaptıktan sonra aynı adımdan devam edebilirsiniz.');
        return;
      }
      if (!response.ok) throw new Error(body.error ?? 'Talep gönderilemedi.');
      try { scope.storage.removeItem(storageKey); } catch { /* Submission already succeeded. */ }
      trackFunnel('wizard_completed', {serviceId:service.id, deliveryModel:service.deliveryModel});
      router.push('/taleplerim');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Talep gönderilemedi.');
    } finally {
      setBusy(false);
    }
  }

  if (routingConflict) return <WizardPendingDialog serviceName={service.name} onClose={onClose}><p role="alert">Taslağın hedefi bu usta ile eşleşmiyor. Güvenliğiniz için taslak değiştirilmedi.</p></WizardPendingDialog>;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={step === 0 ? service.name : undefined}
        aria-labelledby={step !== 0 ? 'wizard-title' : undefined}
        onClick={event => event.stopPropagation()}
      >
        <header className={styles.topbar}>
          <div className={styles.serviceContext}>
            <span>{category?.name ?? 'Hizmet talebi'}</span>
            <strong>{service.name}</strong>
          </div>
          <button data-dialog-initial-focus className={styles.close} onClick={onClose} aria-label="Kapat">×</button>
        </header>

        <div className={styles.viewport}>
          <div className={styles.form} ref={formRef}>
            {targetProfessional && <p className="account-message">Seçili usta: <strong>{targetProfessional.name}</strong> · Başka ustalara gönderilmez.</p>}
            <div className={styles.progress} role="status" aria-label={`Talep aşaması: ${stepLabels[step]}`}>
              <span>{stepLabels[step]}</span>
              <span>{step === 0 ? `Soru ${questionIndex + 1}` : `${step + 1} / ${stepLabels.length}`}</span>
            </div>

            {step === 0 && (
              <WizardQuestionStep key={activeQuestionId} kicker={`Soru ${questionIndex + 1} / ${questions.length}`} title={activeQuestion?.label??'Kapsam sorusu'}>

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
                    disabled={!activeQuestion || !activeAnswer}
                    onClick={continueFromQuestion}
                    type="button"
                  >
                    {questionIndex === questions.length - 1 ? 'Görsel ekleme adımına geç' : 'Sonraki soruya geç'}
                  </Button>
                </div>
                {questionIndex === 0 && <p className="wizard-account-note" role="note">
                  Taslağınız bu cihazda korunur. Göndermeden önce giriş yapmanız istenir.
                </p>}
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
                  <strong>Fotoğraf veya video seçin</strong>
                  <small>JPG, PNG, WebP veya MP4 · Dosya başına maks. 50 MB</small>
                  {files.length > 0 && (
                    <span className="upload-file-success">
                      ✓ {files.length} dosya seçildi · Gönderirken yüklenecek
                    </span>
                  )}
                </label>

                {files.length > 0 && <ul className="wizard-selected-files">
                  {files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                    <span>{file.name}</span>
                    <button type="button" onClick={() => setFiles(current => current.filter((_, i) => i !== index))}
                      aria-label={`${file.name} dosyasını kaldır`}>Kaldır</button>
                  </li>)}
                </ul>}

                {mediaMessage && <p className="wizard-inline-error" role="alert">{mediaMessage}</p>}

                <p className="media-privacy-note" role="note">
                  Yüklemeler herkese açık değildir ve hesabınızın özel alanında tutulur. Fotoğraf eklemeden de devam edebilirsiniz.
                </p>

                <div className="wizard-actions-bottom">
                  <Button variant="outline" onClick={() => setStep(0)} type="button">
                    Kapsama dön
                  </Button>
                  <Button variant="primary" onClick={() => setStep(2)} type="button">
                    Konum ve zamanı ekle
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
                        {ankaraDistricts.filter(item => !targetProfessional || targetProfessional.districts.includes(item)).map(item => (
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
                      {(Object.keys(requestTimings) as Array<keyof typeof requestTimings>).map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`timing-pill ${timing === t ? 'active' : ''}`}
                          aria-pressed={timing === t}
                          onClick={() => setTiming(t)}
                        >
                          {requestTimingLabel(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bottom">
                  <Button variant="outline" onClick={() => setStep(1)} type="button">
                    Görsellere dön
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!locationComplete}
                    onClick={() => setStep(3)}
                    type="button"
                  >
                    Talep kapsamını kontrol et
                  </Button>
                </div>
              </WizardLocationStep>
            )}

            {step === 3 && (
              <WizardSummaryStep kicker={result.eyebrow} title={result.title} description={result.copy}>
                <p className="account-message">{targetProfessional ? `Talebin muhatabı: ${targetProfessional.name}.` : 'Uygun ustalardan teklif alınır.'} Talep size bağlıdır; yetkili operasyon ekibi gerektiğinde inceleyebilir.</p>
                {Boolean(initialDraft?.pendingMediaCount) && files.length === 0 && (
                  <p className="account-message" role="status">Önceki seçiminizdeki dosyalar henüz eklenmedi. <button type="button" onClick={() => setStep(1)}>Görsellere dön ve yeniden ekle</button></p>
                )}

                <dl className={styles.summary} aria-label="Talep kapsamı">
                  <div>
                    <dt>Hizmet</dt><dd>{service.name} <small>{deliveryLabels[service.deliveryModel]}</small></dd>
                  </div>
                  {questions.map((question, index) => <div key={question.id}>
                    <dt>{question.label}</dt><dd>{answers[question.id] || 'Yanıtlanmadı'} <button type="button" onClick={() => { setQuestionIndex(index); setStep(0); }}>Değiştir</button></dd>
                  </div>)}
                  <div>
                    <dt>Konum</dt><dd>{district}, {neighborhood} <button type="button" onClick={() => setStep(2)}>Değiştir</button></dd>
                  </div>
                  <div>
                    <dt>Zamanlama</dt><dd>{requestTimingLabel(timing)} <button type="button" onClick={() => setStep(2)}>Değiştir</button></dd>
                  </div>
                  <div>
                    <dt>Görseller</dt><dd>{files.length ? `${files.length} dosya` : 'Eklenmedi'} <button type="button" onClick={() => setStep(1)}>Değiştir</button></dd>
                  </div>
                </dl>

                {(message || scope.guest || needsAuth) && (
                  <p className="account-message" role={message ? 'alert' : 'status'}>
                    {message || 'Talebinizi göndermek için giriş yapın veya üye olun. Yanıtlarınız ve seçtiğiniz usta korunur; dönüşte bu özeti kontrol edip kendiniz gönderirsiniz.'} {(scope.guest || needsAuth) && <Link className="dialog-primary" href={`/giris?next=${encodeURIComponent(resumePath)}`} onClick={event => {
                      try {
                        scope.storage.setItem(storageKey, JSON.stringify({answers,district,neighborhood,timing,step,questionIndex,idempotencyKey,requestId,routingMode,targetProfessionalId,updatedAt:Date.now(),pendingMediaCount:files.length}));
                        if(scope.guest)sessionStorage.setItem('orkestra:draft-handoff',storageKey);
                      } catch {
                        event.preventDefault();
                        setMessage('Tarayıcı taslağı saklayamıyor. Bu sayfayı açık tutup ayrı sekmede giriş yapın, ardından burada yeniden gönderin.');
                      }
                    }}>Giriş yap / kayıt ol ve devam et</Link>}
                    {(scope.guest || needsAuth) && files.length > 0 && ' Seçtiğiniz dosyaları dönüşte yeniden eklemeniz gerekecek; yanıtlarınız korunur.'}
                  </p>
                )}

                <div className="wizard-actions">
                  <Button variant="outline" onClick={() => setStep(2)} type="button">
                    Konumu düzenle
                  </Button>
                  {!scope.guest && !needsAuth && <Button
                    variant="primary"
                    loading={busy}
                    onClick={() => void submitRequest()}
                    type="button"
                  >
                    {result.cta}
                  </Button>}
                </div>
              </WizardSummaryStep>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
