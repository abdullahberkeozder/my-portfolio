'use client';

import { ChangeEvent, useEffect, useState, useCallback, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Service, serviceCategories } from '../data/serviceTaxonomy';
import { getWizardDefinition } from '../data/wizardDefinitions';
import { ankaraDistricts, ankaraNeighborhoods } from '../data/ankaraLocations';
import { getWizardSafetyGuidance } from '../data/wizardSafety';
import { getVisibleWizardQuestions, pruneWizardAnswers } from '../domain';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { useModalDialog } from '../hooks/useModalDialog';
import Button from './Button';
import HoldToConfirmButton from './HoldToConfirmButton';
import { normalizeRequestTiming, requestTimings, requestTimingLabel } from '../domain/requestTiming';
import { trackFunnel } from '../lib/analytics';
import {WizardLocationStep,WizardMediaStep,WizardQuestionStep,WizardSummaryStep} from './wizard/WizardStepScreens';
import AccountDraftBoundary, {type DraftScope} from './AccountDraftBoundary';
import WizardPendingDialog from './WizardPendingDialog';
import WizardSuccessReceipt from './wizard/WizardSuccessReceipt';
import WizardStepSkeleton from './skeletons/WizardStepSkeleton';
import {requestDraftKind, requestResumePath, requestRoutingSchema, type RequestTarget} from '../domain/requestRouting';
import styles from './requestWizard.module.css';
import AnkaraInteractiveMap from './map/AnkaraInteractiveMap';
import { IconClose, IconEdit, IconLocation, IconCalendar, IconLock, IconShield } from './WizardSummaryIcons';

export type WizardReferenceWork = {
  id: string;
  title: string;
  image: string;
  artisanName?: string;
  artisanDistrict?: string;
};

type Props = {
  service: Service;
  onClose: () => void;
  remoteDraft?: LocalDraft;
  targetProfessional?: RequestTarget;
  initialDistrict?: string;
  referenceWork?: WizardReferenceWork;
};
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

export default function RequestWizard(props:Props) {
  return <AccountDraftBoundary key={requestDraftKind(props.service.id,props.targetProfessional?.id)} kind={requestDraftKind(props.service.id,props.targetProfessional?.id)} ttl={7*86400000}
    renderPending={content=><WizardPendingDialog serviceName={props.service.name} onClose={props.onClose}>{content}</WizardPendingDialog>}>
    {scope=><ScopedRequestWizard {...props} scope={scope}/>}
  </AccountDraftBoundary>;
}



function ScopedRequestWizard({ service, onClose, remoteDraft, scope, targetProfessional, initialDistrict, referenceWork }: Props & {scope:DraftScope}) {
  const formRef = useRef<HTMLDivElement>(null);
  const definition = getWizardDefinition(service.id);
  const storageKey = scope.key;
  const [initialDraft] = useState(() => (!scope.discardRemote && !scope.preferLocal ? remoteDraft : undefined) ?? readLocalDraft(storageKey,scope.storage));
  const [dismissedReferenceKey, setDismissedReferenceKey] = useState<string>();
  const referenceKey = referenceWork ? `${referenceWork.image}:${referenceWork.title}` : undefined;
  const activeReferenceWork = referenceWork && referenceKey !== dismissedReferenceKey ? referenceWork : undefined;

  const routingMode = targetProfessional ? 'direct' as const : 'open' as const;
  const targetProfessionalId = targetProfessional?.id;
  const savedRouting = requestRoutingSchema.safeParse(initialDraft ?? {});
  const routingConflict = Boolean(initialDraft && (!savedRouting.success || savedRouting.data.targetProfessionalId !== targetProfessionalId));
  const dialogRef = useModalDialog<HTMLElement>(!routingConflict, onClose);
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft?.answers ?? {});
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [district, setDistrict] = useState(initialDraft?.district ?? initialDistrict ?? '');
  const [neighborhood, setNeighborhood] = useState(initialDraft?.neighborhood ?? '');
  const [locationMode, setLocationMode] = useState<'map' | 'list'>('list');
  const [locationMessage, setLocationMessage] = useState('');
  const [timing, setTiming] = useState(() => {
    try { return normalizeRequestTiming(initialDraft?.timing ?? 'this_week'); }
    catch { return 'this_week' as const; }
  });
  const [idempotencyKey] = useState(() => initialDraft?.idempotencyKey ?? crypto.randomUUID());
  const [requestId, setRequestId] = useState<string | undefined>(initialDraft?.requestId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string>();
  const [isStepPending, startStepTransition] = useTransition();
  const resumePath = requestResumePath(service.id,targetProfessionalId,district);
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
  const activeQuestion = questions[questionIndex];
  const activeQuestionId = activeQuestion?.id;
  const activeAnswer = activeQuestion?.options.includes(answers[activeQuestion.id]) ? answers[activeQuestion.id] : undefined;
  const questionCount = questions.length;
  const locationComplete = Boolean(district && ankaraNeighborhoods[district]?.includes(neighborhood) && (!targetProfessional || targetProfessional.districts.includes(district)));
  const availableNeighborhoods = district ? ankaraNeighborhoods[district] ?? [] : [];
  const safetyGuidance = getWizardSafetyGuidance(service.id, answers);
  const scopeComplete = questions.every(question => question.options.includes(answers[question.id]));
  const stepLabels = ['Kapsam', 'Görseller', 'Konum ve zaman', 'Özet'];

  const totalQuestions = Math.max(questions.length, 1);
  const totalSubSteps = totalQuestions + 3;
  const progressPercent = submittedRequestId
    ? 100
    : step === 0
    ? Math.min(Math.round(((questionIndex + 1) / totalSubSteps) * 100), 95)
    : step === 1
    ? Math.min(Math.round(((totalQuestions + 1) / totalSubSteps) * 100), 95)
    : step === 2
    ? Math.min(Math.round(((totalQuestions + 2) / totalSubSteps) * 100), 95)
    : 100;

  const transitionToStep = useCallback((nextStep: number) => {
    startStepTransition(() => setStep(nextStep));
  }, []);


  useEffect(() => {
    if (formRef.current?.parentElement) formRef.current.parentElement.scrollTop = 0;
    formRef.current?.querySelector<HTMLElement>('#wizard-title')?.focus({preventScroll:true});
  }, [step, questionIndex]);


  useEffect(() => {
    if (routingConflict || submittedRequestId) return;
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
  }, [answers, district, idempotencyKey, neighborhood, requestId, step, storageKey, timing, questionIndex, files.length, initialDraft?.pendingMediaCount, scope.storage, routingMode, targetProfessionalId, routingConflict, submittedRequestId]);

  // Ortak doğrulama — hem <input> hem drag-drop kullanır
  function validateAndAddFiles(incoming: File[]) {
    if (!incoming.length) return;
    if (incoming.some(f => !['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(f.type))) {
      setMediaMessage('JPG, PNG, WebP veya MP4 biçiminde dosya seçin.');
      return;
    }
    const oversized = incoming.find(f => f.size > 52_428_800);
    if (oversized) {
      setMediaMessage(`${oversized.name} 50 MB sınırını aşıyor. Daha küçük bir dosya seçin.`);
      return;
    }
    setMediaMessage('');
    setFiles(curr => [...curr, ...incoming.filter(f => !curr.some(ex =>
      ex.name === f.name && ex.size === f.size && ex.lastModified === f.lastModified))]);
  }

  function filesChanged(event: ChangeEvent<HTMLInputElement>) {
    validateAndAddFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  }

  // Önizleme URL'leri — files her değiştiğinde yeniden üret

  useEffect(() => {
    const urls = files.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
    const timer = setTimeout(() => {
      setPreviewUrls(urls);
    }, 0);
    return () => {
      clearTimeout(timer);
      urls.forEach(u => { if (u) URL.revokeObjectURL(u); });
    };
  }, [files]);
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
    transitionToStep(1);
    try {
      await saveDraft(false);
    } catch {
      /* Local draft remains available offline */
    }
  }, [saveDraft, transitionToStep]);

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
      setSubmittedRequestId(targetRequestId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Talep gönderilemedi.');
    } finally {
      setBusy(false);
    }
  }

  if (routingConflict) return <WizardPendingDialog serviceName={service.name} onClose={onClose}><p role="alert">Taslağın hedefi bu usta ile eşleşmiyor. Güvenliğiniz için taslak değiştirilmedi.</p></WizardPendingDialog>;

  // Cross the auth boundary with a document navigation after persisting the draft.
  // Do not depend on the modal's client-router transition completing.
  const authAction = (scope.guest || needsAuth) && <a className={styles.authAction} href={`/giris?next=${encodeURIComponent(resumePath)}`} onClick={event => {
    try {
      scope.storage.setItem(storageKey, JSON.stringify({answers,district,neighborhood,timing,step,questionIndex,idempotencyKey,requestId,routingMode,targetProfessionalId,updatedAt:Date.now(),pendingMediaCount:files.length}));
      if(scope.guest)sessionStorage.setItem('orkestra:draft-handoff',storageKey);
    } catch {
      event.preventDefault();
      setMessage('Tarayıcı taslağı saklayamıyor. Bu sayfayı açık tutup ayrı sekmede giriş yapın, ardından burada yeniden gönderin.');
    }
  }}>Giriş yap / kayıt ol ve devam et</a>;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={step === 0 ? service.name : step === 1 ? 'İsterseniz fotoğraf veya video ekleyin' : undefined}
        aria-labelledby={step !== 0 && step !== 1 ? 'wizard-title' : undefined}
        onClick={event => event.stopPropagation()}
      >
        {/* Mikro İlerleme Çubuğu (Hairline 3px) & Beyaz-Turuncu Süzülen Işık Hüzmesi */}
        <div className={styles.hairlineTrack} aria-hidden="true">
          <div
            className={styles.hairlineFill}
            style={{ transform: `scaleX(${progressPercent / 100})` }}
          >
          </div>
        </div>

        <header className={styles.topbar}>
          <div className={styles.serviceContext}>
            <span>{category?.name ?? 'Hizmet talebi'}</span>
            <strong>{service.name}</strong>
          </div>
          {targetProfessional && <div className={styles.targetContext} aria-label="Seçili usta">
            <span>Ustaya özel</span>
            <strong>{targetProfessional.name}</strong>
          </div>}
          <button data-dialog-initial-focus className={styles.close} onClick={onClose} aria-label="Kapat">
            <IconClose size={18} />
          </button>
        </header>

        <div className={styles.workspace}>
        <div className={styles.viewport}>
          <div className={styles.form} ref={formRef}>
            {submittedRequestId ? <WizardSuccessReceipt requestId={submittedRequestId} serviceName={service.name} district={district} neighborhood={neighborhood} timing={timing} targetProfessionalName={targetProfessional?.name}/> : <>
            <div className={styles.progress} role="status" aria-label={`Talep aşaması: ${stepLabels[step]}`}>
              <strong>{step === 0 ? `Soru ${questionIndex + 1} / ${questions.length}` : stepLabels[step]}</strong>
              <span>{step === 0 ? 'Kapsam' : `${step + 1} / ${stepLabels.length}`}</span>
            </div>

            {isStepPending ? <WizardStepSkeleton step={step} /> : <>
            {step === 0 && (
              <WizardQuestionStep key={activeQuestionId} kicker="" title={activeQuestion?.label??'Kapsam sorusu'}>
                {activeReferenceWork && (
                  <div className={styles.referencePill} role="status" aria-label={`Referans görsel: ${activeReferenceWork.title}`}>
                    <div className={styles.referencePillMedia}>
                      <Image
                        src={activeReferenceWork.image}
                        alt={activeReferenceWork.title}
                        width={44}
                        height={44}
                        className={styles.referencePillThumb}
                        unoptimized
                      />
                    </div>
                    <div className={styles.referencePillContent}>
                      <span className={styles.referencePillLabel}>İlham Referansı</span>
                      <strong className={styles.referencePillTitle}>{activeReferenceWork.title}</strong>
                    </div>
                    <button
                      type="button"
                      className={styles.referencePillRemove}
                      onClick={() => setDismissedReferenceKey(referenceKey)}
                      aria-label="Referans görseli kaldır"
                    >
                      ✕ Kaldır
                    </button>
                  </div>
                )}

                <div className="wizard-zero-scroll-choices">
                  {activeQuestion && (
                    <fieldset key={activeQuestion.id} className="wizard-choice-fieldset">
                      <legend className="sr-only">{activeQuestion.label}</legend>
                      {activeQuestion.options.map((option) => {
                        const isChecked = answers[activeQuestion.id] === option;
                        return (
                          <label
                            key={option}
                            className={`${styles.choice} ${isChecked ? styles.choiceActive : ''}`}
                          >
                            <input
                              type="radio"
                              name={activeQuestion.id}
                              value={option}
                              aria-label={option}
                              checked={isChecked}
                              onChange={() => handleSelectOption(option)}
                            />
                            <span className={styles.choiceText}>{option}</span>
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
                      Geri
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    disabled={!activeQuestion || !activeAnswer}
                    onClick={continueFromQuestion}
                    type="button"
                  >
                    Devam
                  </Button>
                  {locationComplete && <Button variant="outline" onClick={() => transitionToStep(3)} type="button">Özete dön</Button>}
                </div>
              </WizardQuestionStep>
            )}

            {step === 1 && (
              <WizardMediaStep kicker="" title="Görsel eklemek ister misiniz?" description="İsteğe bağlıdır. Net bir fotoğraf ustanın doğru teklif hazırlamasını sağlar.">
                {activeReferenceWork && (
                  <div className={styles.referencePill} role="status" aria-label={`Referans görsel: ${activeReferenceWork.title}`}>
                    <div className={styles.referencePillMedia}>
                      <Image
                        src={activeReferenceWork.image}
                        alt={activeReferenceWork.title}
                        width={44}
                        height={44}
                        className={styles.referencePillThumb}
                        unoptimized
                      />
                    </div>
                    <div className={styles.referencePillContent}>
                      <span className={styles.referencePillLabel}>İlham Referansı Eklendi</span>
                      <strong className={styles.referencePillTitle}>{activeReferenceWork.title}</strong>
                    </div>
                    <button
                      type="button"
                      className={styles.referencePillRemove}
                      onClick={() => setDismissedReferenceKey(referenceKey)}
                      aria-label="Referans görseli kaldır"
                    >
                      ✕ Kaldır
                    </button>
                  </div>
                )}

                {Boolean(initialDraft?.pendingMediaCount) && files.length === 0 && (
                  <p className={styles.mediaRestoreNote} role="status">Önceki seçiminizde dosya vardı. Dosyalar giriş dönüşünde veya sayfa yenilendiğinde korunmaz; eklemek isterseniz yeniden seçin.</p>
                )}
                <div
                  className={[styles.dropZone, dragOver ? styles.dropZoneDragging : '', mediaMessage ? styles.dropZoneError : ''].filter(Boolean).join(' ')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={styles.dropZoneIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7.5h3.1l1.4-2h7l1.4 2H20a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
                      <circle cx="12" cy="13.5" r="3.4" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    multiple
                    onChange={filesChanged}
                    aria-label="Fotoğraf veya video seçin"
                    aria-describedby={mediaMessage ? 'wizard-media-help wizard-media-error' : 'wizard-media-help'}
                    aria-invalid={mediaMessage ? true : undefined}
                  />
                  <strong className={styles.dropZoneTitle}>
                    {dragOver ? 'Dosyaları buraya bırakın' : 'Fotoğraf veya video seçin'}
                  </strong>
                  <span className={styles.dropZoneHint} id="wizard-media-help">
                    Sürükleyip de bırakabilirsiniz. JPG, PNG, WebP veya MP4; dosya başına en fazla 50 MB.
                  </span>
                </div>

                {files.length > 0 && (
                  <div className={styles.mediaSelection}>
                    <h3>{files.length} dosya seçildi</h3>
                    <div className={styles.previewGrid}>
                    {files.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.previewItem}>
                        {previewUrls[index] ? (
                          <div className={styles.previewImageWrap}>
                            <Image src={previewUrls[index]} alt={file.name} className={styles.previewImg} width={160} height={120} unoptimized />
                          </div>
                        ) : (
                          <div className={styles.previewVideo}>
                            <span>MP4</span>
                          </div>
                        )}
                        <span className={styles.previewFileName} title={file.name}>{file.name}</span>
                        <button
                          type="button"
                          className={styles.previewRemove}
                          onClick={() => setFiles(curr => curr.filter((_, i) => i !== index))}
                          aria-label={`${file.name} dosyasını kaldır`}
                        >Kaldır</button>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {mediaMessage && <p id="wizard-media-error" className="wizard-inline-error" role="alert">{mediaMessage}</p>}

                <div className="wizard-actions-bottom">
                  <Button variant="outline" onClick={() => transitionToStep(0)} type="button">
                    Kapsama dön
                  </Button>
                  <Button variant="primary" onClick={() => transitionToStep(2)} type="button">
                    Devam
                  </Button>
                </div>
              </WizardMediaStep>
            )}

            {step === 2 && (
              <WizardLocationStep kicker="" title="İş nerede ve ne zaman yapılacak?" description="Açık adresiniz teklif onaylanana kadar gizli tutulur; yalnızca ilçe ve mahalle bilgisi paylaşılır.">

                <div className="swiss-location-form">
                  <div className={styles.locationModeToggle} role="group" aria-label="Konum seçim yöntemi">
                    <button
                      type="button"
                      aria-pressed={locationMode === 'map'}
                      className={`${styles.locationModeBtn} ${locationMode === 'map' ? styles.locationModeBtnActive : ''}`}
                      onClick={() => {setLocationMessage('');setLocationMode('map');}}
                    >
                      Haritada seç
                    </button>
                    <button
                      type="button"
                      aria-pressed={locationMode === 'list'}
                      className={`${styles.locationModeBtn} ${locationMode === 'list' ? styles.locationModeBtnActive : ''}`}
                      onClick={() => {setLocationMessage('');setLocationMode('list');}}
                    >
                      Listeden seç
                    </button>
                  </div>

                  {locationMode === 'map' ? (
                    <div>
                      <AnkaraInteractiveMap
                        initialDistrict={district}
                        initialNeighborhood={neighborhood}
                        mode="picker"
                        compact={true}
                        onLocationSelect={(dist, neigh) => {
                          if (targetProfessional && dist && !targetProfessional.districts.includes(dist)) {
                            setLocationMessage(`${targetProfessional.name} ${dist} ilçesinde hizmet vermiyor. Hizmet verdiği ilçelerden birini listeden seçin.`);
                            return;
                          }
                          setLocationMessage('');
                          setDistrict(dist);
                          setNeighborhood(neigh ?? '');
                        }}
                      />

                    </div>
                  ) : (
                    <div className="form-row-2col">
                      <label className="swiss-field">
                        <span>İlçe Seçin</span>
                        <select
                          value={district}
                          onChange={event => {
                            setLocationMessage('');
                            setDistrict(event.target.value);
                            setNeighborhood('');
                          }}
                        >
                          <option value="">İlçe seçin</option>
                          {ankaraDistricts
                            .filter(item => !targetProfessional || targetProfessional.districts.includes(item))
                            .map(item => (
                              <option key={item}>{item}</option>
                            ))}
                        </select>
                      </label>
                      <label className="swiss-field">
                        <span>Mahalle / Semt</span>
                        <select
                          value={neighborhood}
                          onChange={event => {setLocationMessage('');setNeighborhood(event.target.value);}}
                          disabled={!district}
                        >
                          <option value="">{district ? 'Mahalle seçin' : 'Önce ilçe seçin'}</option>
                          {availableNeighborhoods.map(item => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  {locationMessage && <p className="wizard-inline-error" role="alert">{locationMessage}</p>}
                  {district && (
                    <p className={styles.selectedLocationBadge} role="status">
                      <strong>{neighborhood ? `${neighborhood}, ${district}` : district}</strong>
                      <span>{locationComplete ? 'Bölge seçildi' : 'Devam etmek için mahalle seçin'}</span>
                    </p>
                  )}

                  <div className="timing-choice-group">
                    <span className="timing-label">Ne zaman yapılsın?</span>
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
                  <Button variant="outline" onClick={() => transitionToStep(1)} type="button">
                    Geri
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!locationComplete}
                    onClick={() => transitionToStep(3)}
                    type="button"
                  >
                    Özeti gör
                  </Button>
                </div>
              </WizardLocationStep>
            )}

            {step === 3 && (
              <WizardSummaryStep kicker="" title="Talebiniz hazır" description="Bilgilerinizi kontrol edin.">
                <div className={styles.summaryTrustBanner} aria-label="Talep güvenceleri">
                  <IconShield size={18} className={styles.trustIcon} />
                  <ul>
                    <li>Ücretsiz</li>
                    <li>Bağlayıcı değil</li>
                    <li>Güvenli Havuz</li>
                  </ul>
                </div>
                {targetProfessional && (
                  <p className={styles.visibilityNote}>Yalnız {targetProfessional.name} görecek.</p>
                )}

                {Boolean(initialDraft?.pendingMediaCount) && files.length === 0 && (
                  <p className="account-message" role="status">Önceki seçiminizdeki dosyalar henüz eklenmedi. <button className={styles.inlineRecovery} type="button" onClick={() => transitionToStep(1)}>Fotoğrafları yeniden seç</button></p>
                )}

                <div className={styles.reviewCard}>
                  <section className={styles.reviewSection} aria-label="İşin ayrıntıları">
                    <header className={styles.sectionHeader}>
                      <div>
                        <span className={styles.reviewBadge}>{category?.name ?? 'Ev Hizmeti'}</span>
                        <h3>{service.name}</h3>
                      </div>
                      <button
                        type="button"
                        aria-label="Yanıtları düzenle"
                        title="Yanıtları düzenle"
                        className={styles.reviewEditBtn}
                        onClick={() => { setQuestionIndex(0); transitionToStep(0); }}
                      >
                        <IconEdit size={18} />
                        <span className="sr-only">Yanıtları düzenle</span>
                      </button>
                    </header>
                    <details className={styles.answerDetails}>
                      <summary>{questions.length} yanıtı gör</summary>
                      <dl className={styles.summary} aria-label="Talep kapsamı">
                        {questions.map(question => (
                          <div key={question.id} className={styles.summaryRow}>
                            <dt>{question.label}</dt>
                            <dd>{answers[question.id] || 'Yanıtlanmadı'}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  </section>

                  <section className={styles.reviewSection} aria-label="Konum ve zaman bilgileri">
                    <header className={styles.sectionHeader}>
                      <div>
                        <h3>Konum ve zaman</h3>
                        <div className={styles.metaList}>
                          <div className={styles.metaRow}>
                            <IconLocation size={18} className={styles.metaIcon} />
                            <span>{neighborhood ? `${neighborhood}, ` : ''}{district}</span>
                          </div>
                          <div className={styles.metaRow}>
                            <IconCalendar size={18} className={styles.metaIcon} />
                            <span>{requestTimingLabel(timing)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Konumu ve zamanı düzenle"
                        title="Konumu ve zamanı düzenle"
                        className={styles.reviewEditBtn}
                        onClick={() => transitionToStep(2)}
                      >
                        <IconEdit size={18} />
                        <span className="sr-only">Bölgeyi veya zamanı düzenle</span>
                      </button>
                    </header>
                    <dl className="sr-only">
                      <div><dt>İşin yapılacağı yer</dt><dd>{neighborhood}, {district}</dd></div>
                      <div><dt>Zaman tercihi</dt><dd>{requestTimingLabel(timing)}</dd></div>
                    </dl>
                  </section>

                  <section className={styles.reviewSection} aria-label="Eklenen görseller">
                    <header className={styles.sectionHeader}>
                      <div>
                        <h3>Görseller</h3>
                        <p className={styles.sectionSubtext}>
                          {files.length ? `${files.length} dosya hazır` : (activeReferenceWork ? `1 referans görseli (${activeReferenceWork.title})` : 'Fotoğraf eklenmedi')}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={files.length ? 'Görselleri düzenle' : 'Görsel ekle'}
                        title={files.length ? 'Görselleri düzenle' : 'Görsel ekle'}
                        className={files.length ? styles.reviewEditBtn : styles.reviewAddBtn}
                        onClick={() => transitionToStep(1)}
                      >
                        {files.length ? (
                          <>
                            <IconEdit size={18} />
                            <span className="sr-only">Görselleri düzenle</span>
                          </>
                        ) : (
                          <span>+ Ekle</span>
                        )}
                      </button>
                    </header>
                  </section>
                </div>

                <div className={styles.privacyNote}>
                  <IconLock size={18} className={styles.privacyIcon} />
                  <span>Açık adresiniz ve iletişim bilgileriniz yalnızca teklifi kabul ettiğiniz ustayla paylaşılır; açık havuza dağıtılmaz.</span>
                </div>

                {(message || scope.guest || needsAuth) && (
                  <p className="account-message" role={message ? 'alert' : 'status'}>
                    {message || 'Göndermek için giriş yapın. Yanıtlarınız korunur; dönüşte talebi kendiniz gönderirsiniz.'}
                    {(scope.guest || needsAuth) && files.length > 0 && ' Seçtiğiniz dosyaları dönüşte yeniden eklemeniz gerekecek; yanıtlarınız korunur.'}
                  </p>
                )}

                <div className="wizard-actions">
                  <span className={styles.submitNote}>Göndermek için basılı tutun.</span>
                  {authAction}
                  {!scope.guest && !needsAuth && (
                    <HoldToConfirmButton
                      loading={busy}
                      onConfirm={submitRequest}
                      label={targetProfessional ? 'Bu ustaya gönder' : 'Talebi gönder'}
                    />
                  )}
                </div>
              </WizardSummaryStep>
            )}
            </>}
            </>}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
