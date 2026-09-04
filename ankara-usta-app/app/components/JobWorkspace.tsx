'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import WorkspaceTabs from './WorkspaceTabs';
import {workspaceMutation} from '../lib/workspaceMutation';
import {useModalDialog} from '../hooks/useModalDialog';

type Role = 'customer' | 'tradesperson' | 'admin';
type EventRow = {
  id: string;
  sequence: number;
  event_type: string;
  actor_role: string;
  payload: Record<string, unknown>;
  created_at: string;
};
type MessageRow = { id: string; sender_id: string; body: string; created_at: string };
type AppointmentRow = { id: string; proposed_by: string; scheduled_for: string; status: string; note: string | null };
type ScopeRow = {
  id: string;
  proposed_by: string;
  description: string;
  labor_delta_kurus: number;
  material_delta_kurus: number;
  duration_delta_minutes: number;
  status: string;
};
type AddressRow = { address_line: string; building: string | null; apartment: string | null; directions: string | null } | null;
type Props = {
  jobId: string;
  currentUserId: string;
  role: Role;
  status: string;
  events: EventRow[];
  messages: MessageRow[];
  appointments: AppointmentRow[];
  scopeChanges: ScopeRow[];
  address: AddressRow;
};

type WorkspaceTab = 'messages' | 'timeline' | 'scope' | 'location' | 'trust';

const statusDisplayNames: Record<string, { label: string; tone: string }> = {
  scheduled: { label: 'Planlandı / Beklemede', tone: 'tone-blue' },
  inspection_scheduled: { label: 'Keşif Planlandı', tone: 'tone-purple' },
  in_progress: { label: 'İş Devam Ediyor', tone: 'tone-amber' },
  awaiting_customer_approval: { label: 'Müşteri Onayı Bekleniyor', tone: 'tone-emerald' },
  completed: { label: 'Tamamlandı & Onaylandı', tone: 'tone-green' },
  disputed: { label: 'Uyuşmazlık İnceleniyor', tone: 'tone-red' },
  cancelled: { label: 'İptal Edildi', tone: 'tone-gray' },
};

const statusActions: Record<Role, Partial<Record<string, { status: string; label: string; isDangerous?: boolean }[]>>> = {
  customer: {
    scheduled: [{ status: 'cancelled', label: 'İşi iptal et', isDangerous: true }],
    inspection_scheduled: [{ status: 'cancelled', label: 'İşi iptal et', isDangerous: true }],
    in_progress: [{ status: 'disputed', label: 'Uyuşmazlık bildir', isDangerous: true }],
    awaiting_customer_approval: [
      { status: 'completed', label: 'İşi onaylayın ve tamamlayın' },
      { status: 'in_progress', label: 'Düzeltme iste' },
      { status: 'disputed', label: 'Uyuşmazlık bildir', isDangerous: true },
    ],
    completed: [{ status: 'disputed', label: 'Sorun bildir', isDangerous: true }],
  },
  tradesperson: {
    scheduled: [
      { status: 'in_progress', label: 'İşe başla' },
      { status: 'cancelled', label: 'İşi iptal et', isDangerous: true },
    ],
    inspection_scheduled: [
      { status: 'in_progress', label: 'İşe başla' },
      { status: 'cancelled', label: 'İşi iptal et', isDangerous: true },
    ],
    in_progress: [
      { status: 'awaiting_customer_approval', label: 'İşi bitirdim, onaya gönder' },
      { status: 'disputed', label: 'Uyuşmazlık bildir', isDangerous: true },
    ],
    awaiting_customer_approval: [{ status: 'disputed', label: 'Uyuşmazlık bildir', isDangerous: true }],
  },
  admin: {},
};

const eventLabels: Record<string, string> = {
  job_created: 'İş kaydı oluşturuldu',
  message_sent: 'Mesaj gönderildi',
  status_changed: 'İş durumu güncellendi',
  inspection_proposed: 'Keşif randevusu önerildi',
  inspection_confirmed: 'Keşif randevusu onaylandı',
  inspection_cancelled: 'Keşif randevusu iptal edildi',
  scope_change_proposed: 'Kapsam değişikliği önerildi',
  scope_change_partially_approved: 'Kapsam değişikliği teyit edildi',
  scope_change_approved: 'Kapsam değişikliği onaylandı',
  scope_change_rejected: 'Kapsam değişikliği reddedildi',
  address_shared: 'Açık adres paylaşıldı',
};

const lines = (value: string) =>
  value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

export default function JobWorkspace(props: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('messages');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [busy, setBusy] = useState('');
  const pendingCall = useRef(false);
  const pendingMessage = useRef<{body:string;idempotencyKey:string}|null>(null);

  // Forms
  const [inspectionAt, setInspectionAt] = useState('');
  const [inspectionNote, setInspectionNote] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [laborDelta, setLaborDelta] = useState('0');
  const [materialDelta, setMaterialDelta] = useState('0');
  const [durationDelta, setDurationDelta] = useState('0');
  const [included, setIncluded] = useState('');
  const [excluded, setExcluded] = useState('');
  const [addressLine, setAddressLine] = useState(props.address?.address_line ?? '');
  const [building, setBuilding] = useState(props.address?.building ?? '');
  const [apartment, setApartment] = useState(props.address?.apartment ?? '');
  const [directions, setDirections] = useState(props.address?.directions ?? '');

  // Confirmation Modal
  const [confirmAction, setConfirmAction] = useState<{ status: string; label: string } | null>(null);
  const closeConfirmation = () => { if (!pendingCall.current) setConfirmAction(null); };
  const confirmationRef = useModalDialog<HTMLDivElement>(Boolean(confirmAction), closeConfirmation);

  async function call(url: string, body: unknown, key: string) {
    if (pendingCall.current) return false;
    pendingCall.current = true;
    setBusy(key);
    setNotice('');
    setNoticeSuccess(false);
    try {
      const result = await workspaceMutation(url, body, props.currentUserId);
      if (!result.ok) { setNotice(result.message); return false; }
      setNotice('İşlem kaydedildi.');
      setNoticeSuccess(true);
      router.refresh();
      return true;
    } finally { pendingCall.current = false; setBusy(''); }
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (pendingCall.current) return;
    const sentBody = message;
    if (!pendingMessage.current || pendingMessage.current.body !== message) {
      pendingMessage.current = { body: message, idempotencyKey: crypto.randomUUID() };
    }
    if (
      await call(
        `/api/jobs/${props.jobId}/messages`,
        pendingMessage.current,
        'message'
      )
    ) {
      pendingMessage.current = null;
      setMessage(current => current === sentBody ? '' : current);
    }
  }

  async function transition(status: string) {
    if (await call(`/api/jobs/${props.jobId}/transition`, { status }, status)) setConfirmAction(null);
  }

  async function proposeInspection(event: React.FormEvent) {
    event.preventDefault();
    if (
      await call(
        `/api/jobs/${props.jobId}/inspection`,
        { scheduledFor: new Date(inspectionAt).toISOString(), note: inspectionNote || undefined },
        'inspection'
      )
    ) {
      setInspectionAt('');
      setInspectionNote('');
    }
  }

  async function respondInspection(id: string, accept: boolean) {
    await call(`/api/inspections/${id}/respond`, { accept }, id);
  }

  async function proposeScope(event: React.FormEvent) {
    event.preventDefault();
    if (
      await call(
        `/api/jobs/${props.jobId}/scope-changes`,
        {
          description: scopeDescription,
          laborDeltaKurus: Math.round(Number(laborDelta) * 100),
          materialDeltaKurus: Math.round(Number(materialDelta) * 100),
          durationDeltaMinutes: Number(durationDelta),
          includedScope: lines(included),
          excludedScope: lines(excluded),
        },
        'scope'
      )
    ) {
      setScopeDescription('');
      setIncluded('');
      setExcluded('');
    }
  }

  async function respondScope(id: string, approve: boolean) {
    await call(`/api/scope-changes/${id}/respond`, { approve }, id);
  }

  async function saveAddress(event: React.FormEvent) {
    event.preventDefault();
    await call(
      `/api/jobs/${props.jobId}/address`,
      {
        addressLine,
        building: building || undefined,
        apartment: apartment || undefined,
        directions: directions || undefined,
      },
      'address'
    );
  }

  // Derive Next Immediate Action
  function getNextImmediateAction() {
    if (props.status === 'awaiting_customer_approval') {
      return props.role === 'customer'
        ? {
            title: 'Usta işi tamamladı · Onayınız bekleniyor',
            desc: 'Yapılan işi inceleyin. Memnunsanız onaylayarak işi tamamlayın veya düzeltme isteyin.',
            cta: 'İşi İncele ve Onayla',
            targetTab: 'trust' as WorkspaceTab,
          }
        : {
            title: 'Müşteri onayında bekliyor',
            desc: 'İş teslim bildiriminiz müşteriye iletildi. Onay veya geri bildirim bekleniyor.',
            cta: 'İş Kapsamını Gör',
            targetTab: 'scope' as WorkspaceTab,
          };
    }
    if (props.status === 'scheduled') {
      if (props.role === 'customer' && !props.address) {
        return {
          title: 'Adres bilgisi henüz paylaşılmadı',
          desc: 'Ustanın randevu saatinde gelebilmesi için açık adresinizi ekleyin.',
          cta: 'Adres Ekle',
          targetTab: 'location' as WorkspaceTab,
        };
      }
      return props.role === 'tradesperson'
        ? {
            title: 'Randevu saatinde işe başlayın',
            desc: 'Adrese ulaştığınızda iş durumunu "İşe başla" olarak güncelleyin.',
            cta: 'İşe Başla',
            targetTab: 'trust' as WorkspaceTab,
          }
        : {
            title: 'Usta randevusu bekleniyor',
            desc: 'Usta belirlenen saatte adrese intikal edip işe başlayacak.',
            cta: 'Mesaj Gönder',
            targetTab: 'messages' as WorkspaceTab,
          };
    }
    if (props.status === 'in_progress') {
      return props.role === 'tradesperson'
        ? {
            title: 'İş devam ediyor · Tamamlandığında onaya gönderin',
            desc: 'Uygulama bittiğinde "Müşteri onayına gönder" butonu ile teslim sürecini başlatın.',
            cta: 'Teslim Bildir',
            targetTab: 'trust' as WorkspaceTab,
          }
        : {
            title: 'İş ustanız tarafından yürütülüyor',
            desc: 'Herhangi bir kapsam değişikliği veya soru için mesajlaşma odasını kullanabilirsiniz.',
            cta: 'Mesaj Gönder',
            targetTab: 'messages' as WorkspaceTab,
          };
    }
    return null;
  }

  const nextAction = getNextImmediateAction();
  const statusInfo = statusDisplayNames[props.status] || { label: props.status, tone: 'tone-gray' };
  const availableActions = statusActions[props.role][props.status] ?? [];

  return (
    <div className="job-workspace-shell">
      {/* 1. Next Immediate Action Hero Banner */}
      {nextAction && (
        <section className="job-next-action-card">
          <div className="action-icon-badge">⚡</div>
          <div className="action-content">
            <span className="action-kicker">SIRADAKİ EYLEM</span>
            <h2 className="action-title">{nextAction.title}</h2>
            <p className="action-desc">{nextAction.desc}</p>
          </div>
          <button
            type="button"
            className="dialog-primary action-cta-btn"
            onClick={() => setActiveTab(nextAction.targetTab)}
          >
            {nextAction.cta} →
          </button>
        </section>
      )}

      {/* Header & Status Bar */}
      <header className="job-header-card">
        <div className="job-meta-left">
          <span className="job-id-pill">İŞ KODU: #{props.jobId.slice(0, 8).toUpperCase()}</span>
          <h1 className="job-title">İş Yönetim Merkezi</h1>
        </div>
        <div className="job-meta-right">
          <span className={`job-status-badge ${statusInfo.tone}`}>
            <span className="status-dot" />
            {statusInfo.label}
          </span>
        </div>
      </header>

      {/* Workspace Tabs Navigation */}
      <WorkspaceTabs<WorkspaceTab> active={activeTab} onChange={setActiveTab} label="İş yönetim sekmeleri" panelId="job-workspace-panel"
        items={[
          {id:'messages',label:`Mesajlar (${props.messages.length})`},
          {id:'scope',label:'Kapsam'},
          {id:'location',label:'Keşif ve adres'},
          {id:'timeline',label:'İş geçmişi'},
          {id:'trust',label:'Onay ve işlemler'},
        ]} />

      {/* Tab Panels */}
      <div className="workspace-tab-body">
        {/* Tab 1: Messages */}
        {activeTab === 'messages' && (
          <section className="job-tab-panel animate-fade-in" role="tabpanel" id="job-workspace-panel" aria-labelledby={`job-workspace-panel-tab-${activeTab}`} tabIndex={0}>
            <div className="panel-header">
              <h2>İş mesajları</h2>
              <p>İş kapsamı, randevu saati ve detaylar bu odada kayıt altında tutulur.</p>
            </div>

            <div className="message-list-box">
              {props.messages.length > 0 ? (
                props.messages.map(item => (
                  <article className={`message-bubble ${item.sender_id === props.currentUserId ? 'mine' : 'theirs'}`} key={item.id}>
                    <b className="message-sender">{item.sender_id === props.currentUserId ? 'Siz' : props.role === 'customer' ? 'Usta' : 'Müşteri'}</b>
                    <p className="message-body">{item.body}</p>
                    <time className="message-time">
                      {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at))}
                    </time>
                  </article>
                ))
              ) : (
                <div className="empty-state-notice">
                  <p>Henüz mesaj gönderilmedi. Randevu veya iş detaylarını sormak için mesaj yazabilirsiniz.</p>
                </div>
              )}
            </div>

            <form className="message-form-grid" onSubmit={sendMessage}>
              <label htmlFor="job-message-input" className="sr-only">
                Mesajınız
              </label>
              <textarea
                id="job-message-input"
                required
                maxLength={4000}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="Mesajınızı buraya yazın..."
                aria-label="Mesajınızı buraya yazın..."
              />
              <button className="dialog-primary send-msg-btn" disabled={busy === 'message'} type="submit">
                {busy === 'message' ? 'İletiliyor…' : 'Gönder →'}
              </button>
            </form>
          </section>
        )}

        {/* Tab 2: Scope & Changes */}
        {activeTab === 'scope' && (
          <section className="job-tab-panel animate-fade-in" role="tabpanel" id="job-workspace-panel" aria-labelledby={`job-workspace-panel-tab-${activeTab}`} tabIndex={0}>
            <div className="panel-header">
              <h2>Kapsam ve Değişiklik Talepleri</h2>
              <p>İş esnasında ortaya çıkan ek işçilik ve malzemeler iki tarafın onayıyla dijital fişe eklenir.</p>
            </div>

            <div className="scope-items-list">
              {props.scopeChanges.length > 0 ? (
                props.scopeChanges.map(item => (
                  <article className="scope-decision-card" key={item.id}>
                    <div className="scope-card-main">
                      <strong>{item.description}</strong>
                      <div className="scope-deltas">
                        <span>İşçilik: {item.labor_delta_kurus / 100} ₺</span>
                        <span>Malzeme: {item.material_delta_kurus / 100} ₺</span>
                        <span>Süre: {item.duration_delta_minutes} dk</span>
                        <span className={`scope-status-pill status-${item.status}`}>{item.status}</span>
                      </div>
                    </div>
                    {item.status === 'pending' && item.proposed_by !== props.currentUserId && (
                      <div className="scope-card-actions">
                        <button className="dialog-primary" type="button" onClick={() => void respondScope(item.id, true)}>
                          Onayla
                        </button>
                        <button className="wizard-secondary" type="button" onClick={() => void respondScope(item.id, false)}>
                          Reddet
                        </button>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="empty-state-notice">
                  <p>Kapsam değişikliği bulunmuyor. İş orijinal fişteki şartlarla geçerlidir.</p>
                </div>
              )}
            </div>

            {!['completed', 'cancelled'].includes(props.status) && (
              <form className="scope-propose-card" onSubmit={proposeScope}>
                <h3>Yeni Kapsam Değişikliği Öner</h3>
                <label htmlFor="scope-desc-input" className="sr-only">
                  Ek İş Tanımı
                </label>
                <textarea
                  id="scope-desc-input"
                  required
                  minLength={10}
                  value={scopeDescription}
                  onChange={event => setScopeDescription(event.target.value)}
                  placeholder="Ek işin veya değişikliğin açık tanımı"
                  aria-label="Ek işin veya değişikliğin açık tanımı"
                />
                <div className="deltas-grid">
                  <label htmlFor="scope-labor-delta" className="sr-only">
                    İşçilik Farkı (TL)
                  </label>
                  <input
                    id="scope-labor-delta"
                    type="number"
                    step="0.01"
                    value={laborDelta}
                    onChange={event => setLaborDelta(event.target.value)}
                    placeholder="İşçilik farkı (TL)"
                    aria-label="İşçilik farkı (TL)"
                  />
                  <label htmlFor="scope-material-delta" className="sr-only">
                    Malzeme Farkı (TL)
                  </label>
                  <input
                    id="scope-material-delta"
                    type="number"
                    step="0.01"
                    value={materialDelta}
                    onChange={event => setMaterialDelta(event.target.value)}
                    placeholder="Malzeme farkı (TL)"
                    aria-label="Malzeme farkı (TL)"
                  />
                  <label htmlFor="scope-duration-delta" className="sr-only">
                    Süre Farkı (dk)
                  </label>
                  <input
                    id="scope-duration-delta"
                    type="number"
                    value={durationDelta}
                    onChange={event => setDurationDelta(event.target.value)}
                    placeholder="Süre farkı (dk)"
                    aria-label="Süre farkı (dk)"
                  />
                </div>
                <button className="dialog-primary" type="submit" disabled={busy === 'scope'}>
                  {busy === 'scope' ? 'Kaydediliyor…' : 'Değişikliği Onaya Gönder →'}
                </button>
              </form>
            )}

          </section>
        )}

        {/* Tab 3: Location & Inspection */}
        {activeTab === 'location' && (
          <section className="job-tab-panel animate-fade-in" role="tabpanel" id="job-workspace-panel" aria-labelledby={`job-workspace-panel-tab-${activeTab}`} tabIndex={0}>
            <div className="panel-header">
              <h2>Keşif ve Adres Bilgileri</h2>
              <p>Açık adres yalnızca onaylı ustayla paylaşılır.</p>
            </div>

            {props.role === 'customer' && (
              <form className="address-form-card" onSubmit={saveAddress}>
                <h3>İş Adresi Bilgisi</h3>
                <div className="form-field-group">
                  <label>Açık Adres (Cadde, Sokak, Kapı No)</label>
                  <input
                    required
                    minLength={10}
                    value={addressLine}
                    onChange={event => setAddressLine(event.target.value)}
                    placeholder="Örn: Tunalı Hilmi Cad. No: 42"
                  />
                </div>
                <div className="grid-2col">
                  <div className="form-field-group">
                    <label>Bina / Blok</label>
                    <input
                      value={building}
                      onChange={event => setBuilding(event.target.value)}
                      placeholder="Örn: A Blok"
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Daire No</label>
                    <input
                      value={apartment}
                      onChange={event => setApartment(event.target.value)}
                      placeholder="Örn: D: 8"
                    />
                  </div>
                </div>
                <div className="form-field-group">
                  <label>Ulaşım Tarifi / Not</label>
                  <textarea
                    value={directions}
                    onChange={event => setDirections(event.target.value)}
                    placeholder="Zil üzerinde yazan isim, otopark bilgisi vb."
                  />
                </div>
                <button className="dialog-primary" type="submit" disabled={busy === 'address'}>
                  {busy === 'address' ? 'Kaydediliyor…' : 'Adresi Güncelle →'}
                </button>
              </form>
            )}

            {props.role !== 'customer' && props.address && (
              <div className="address-display-card">
                <h3>Kayıtlı İş Adresi</h3>
                <p className="address-text">
                  {props.address.address_line} {props.address.building} {props.address.apartment}
                </p>
                {props.address.directions && <small className="address-directions">Tarif: {props.address.directions}</small>}
              </div>
            )}

            {/* Inspection section */}
            <div className="inspection-subpanel">
              <h3>Keşif Randevuları</h3>
              {props.appointments.map(item => (
                <article className="inspection-row-card" key={item.id}>
                  <div>
                    <strong>
                      {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(
                        new Date(item.scheduled_for)
                      )}
                    </strong>
                    <p>{item.note || 'Not eklenmedi'} · Durum: {item.status}</p>
                  </div>
                  {item.status === 'proposed' && item.proposed_by !== props.currentUserId && (
                    <div className="inspection-actions">
                      <button className="dialog-primary" type="button" onClick={() => void respondInspection(item.id, true)}>
                        Onayla
                      </button>
                      <button className="wizard-secondary" type="button" onClick={() => void respondInspection(item.id, false)}>
                        Reddet
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {props.status === 'scheduled' && (
                <form className="inspection-form-inline" onSubmit={proposeInspection}>
                  <h4>Yeni Keşif Randevusu Öner</h4>
                  <input
                    required
                    type="datetime-local"
                    value={inspectionAt}
                    onChange={event => setInspectionAt(event.target.value)}
                  />
                  <input
                    value={inspectionNote}
                    onChange={event => setInspectionNote(event.target.value)}
                    placeholder="Randevu notu"
                  />
                  <button className="dialog-primary" type="submit" disabled={busy === 'inspection'}>
                    Randevu Öner →
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Tab 4: Timeline */}
        {activeTab === 'timeline' && (
          <section className="job-tab-panel animate-fade-in" role="tabpanel" id="job-workspace-panel" aria-labelledby={`job-workspace-panel-tab-${activeTab}`} tabIndex={0}>
            <div className="panel-header">
              <h2>İş geçmişi</h2>
              <p>Oluşturulma, teklif kabulü, kapsam onayları ve durum geçişleri kronolojik olarak arşivlenir.</p>
            </div>

            <div className="audit-timeline">
              {props.events.map(event => (
                <article className="timeline-entry" key={event.id}>
                  <div className="timeline-seq">{event.sequence}</div>
                  <div className="timeline-body">
                    <strong>{eventLabels[event.event_type] ?? event.event_type}</strong>
                    <div className="timeline-meta">
                      <span>Aktör: {event.actor_role}</span>
                      <span>·</span>
                      <time>
                        {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(
                          new Date(event.created_at)
                        )}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Tab 5: Trust & Critical Actions */}
        {activeTab === 'trust' && (
          <section className="job-tab-panel animate-fade-in" role="tabpanel" id="job-workspace-panel" aria-labelledby={`job-workspace-panel-tab-${activeTab}`} tabIndex={0}>
            <div className="panel-header">
              <h2>Onay ve iş durumu</h2>
              <p>İş akışını tamamlamak, düzeltme istemek veya uyuşmazlık bildirmek için bu alanı kullanın.</p>
            </div>

            <div className="status-actions-box">
              <h3>Mevcut Durumda Yapabileceğiniz İşlemler</h3>
              {availableActions.length > 0 ? (
                <div className="actions-buttons-grid">
                  {availableActions.map(action => (
                    <button
                      key={action.status}
                      type="button"
                      className={`status-trigger-btn ${action.isDangerous ? 'btn-danger' : 'btn-primary'}`}
                      disabled={Boolean(busy)}
                      onClick={() => setConfirmAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Bu aşamada bekleyen bir işlem bulunmuyor.</p>
              )}
            </div>
          </section>
        )}
      </div>

      {notice && (
        <div className={`account-alert-box ${noticeSuccess ? 'alert-success' : 'alert-error'}`} role={noticeSuccess ? 'status' : 'alert'}>
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Step Confirmation Modal for Irreversible Actions */}
      {confirmAction && (
        <div className="dialog-backdrop" role="presentation" onClick={closeConfirmation}>
          <div
            className="request-dialog confirmation-dialog"
            ref={confirmationRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-confirm-title"
            aria-describedby="job-confirm-description"
            onClick={e => e.stopPropagation()}
          >
            <span className="account-eyebrow">İŞLEM TEYİDİ</span>
            <h2 id="job-confirm-title">{confirmAction.label} işlemini onaylıyor musunuz?</h2>
            <p className="confirm-notice" id="job-confirm-description">
              {confirmAction.status === 'cancelled' &&
                'İşi iptal ettiğinizde takvim boşa çıkar ve bu işlem geri alınamaz.'}
              {confirmAction.status === 'completed' &&
                'İşi onayladığınızda iş günlüğü kilitlenir ve ustaya memnuniyet teyidi iletilir.'}
              {confirmAction.status === 'disputed' &&
                'Uyuşmazlık bildirildiğinde Orkestra moderasyon masası devreye girer ve taraflardan kanıt istenir.'}
              {confirmAction.status === 'in_progress' &&
                'İş durumu "Devam ediyor" olarak güncellenecek.'}
              {confirmAction.status === 'awaiting_customer_approval' &&
                'İşin tamamlandığı ve müşterinin nihai onayı beklendiği taraflara bildirilecek.'}
            </p>
            <div className="confirm-actions">
              {notice && !noticeSuccess && <p role="alert">{notice}</p>}
              <button
                type="button"
                className="wizard-secondary"
                data-dialog-initial-focus
                onClick={closeConfirmation}
                disabled={Boolean(busy)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="dialog-primary"
                onClick={() => void transition(confirmAction.status)}
                disabled={Boolean(busy)}
              >
                {busy === confirmAction.status ? 'İşleniyor…' : 'Evet, İşlemi Onayla →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
