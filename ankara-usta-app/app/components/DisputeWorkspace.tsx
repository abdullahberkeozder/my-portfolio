'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {FormEvent,useState} from 'react';
import Button from './Button';
import {disputeStatusTransitions,DisputeOperationStatus,disputeSlaState} from '../domain';
import RealtimeRefresh from './RealtimeRefresh';

type Dispute={id:string;job_id:string;category:string;description:string;status:DisputeOperationStatus;evidence_due_at:string|null;appeal_due_at:string|null;sla_due_at:string;created_at:string};
type Evidence={id:string;submitted_by:string;kind:string;description:string;submitted_at:string;signedUrl:string|null};
type Statement={id:string;submitted_by:string;statement:string;created_at:string};
type Decision={id:string;decision_type:string;customer_explanation:string;tradesperson_explanation:string;created_at:string};
type Timeline={id:string;event_type:string;actor_role:string;from_status:string|null;to_status:string|null;reason:string|null;created_at:string};
type Note={id:string;note:string;created_at:string};
type Appeal={id:string;appealed_by:string;reason:string;created_at:string};
type Sanction={id:string;sanction_type:string;reason:string;starts_at:string;ends_at:string|null};
type Props={dispute:Dispute;currentUserId:string;role:'customer'|'tradesperson'|'admin';evidence:Evidence[];statements:Statement[];decisions:Decision[];events:Timeline[];notes:Note[];appeals:Appeal[];sanctions:Sanction[]};

const labels:Record<string,string>={opened:'Açıldı',triage:'Ön değerlendirme',awaiting_evidence:'Kanıt bekleniyor',counterparty_response:'Karşı taraf yanıtı',investigation:'İnceleme',resolution_proposed:'Çözüm önerildi',notified:'Taraflara bildirildi',appealed:'İtiraz edildi',closed:'Kapandı',dismissed:'İşlemden kaldırıldı'};
const evidenceKinds={photo:'Fotoğraf',video:'Video',document:'Belge',message_export:'Mesaj dökümü',invoice:'Fatura',other:'Diğer'};
const primaryStages=['opened','triage','awaiting_evidence','counterparty_response','investigation','resolution_proposed','notified','appealed','closed'] as const;

export default function DisputeWorkspace(props:Props){
  const router=useRouter();const [busy,setBusy]=useState('');const [notice,setNotice]=useState('');const [statement,setStatement]=useState('');const [appeal,setAppeal]=useState('');
  const [nextStatus,setNextStatus]=useState<DisputeOperationStatus>(disputeStatusTransitions[props.dispute.status][0]??props.dispute.status);const [reason,setReason]=useState('');const [evidenceDueAt,setEvidenceDueAt]=useState('');const [customerExplanation,setCustomerExplanation]=useState('');const [tradespersonExplanation,setTradespersonExplanation]=useState('');const [note,setNote]=useState('');const [sanctionType,setSanctionType]=useState('warning');const [sanctionReason,setSanctionReason]=useState('');const [sanctionEndsAt,setSanctionEndsAt]=useState('');
  async function post(url:string,body:unknown,key:string){setBusy(key);setNotice('');const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json() as {error?:string};setBusy('');if(!response.ok){setNotice(result.error??'İşlem tamamlanamadı.');return false;}router.refresh();return true;}
  async function upload(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy('evidence');setNotice('');const form=new FormData(event.currentTarget);const response=await fetch(`/api/disputes/${props.dispute.id}/evidence`,{method:'POST',body:form});const result=await response.json() as {error?:string};setBusy('');if(!response.ok)return setNotice(result.error??'Kanıt yüklenemedi.');event.currentTarget.reset();router.refresh();}
  const sla=disputeSlaState(props.dispute.sla_due_at);
  const stageIndex=Math.max(0,primaryStages.indexOf(props.dispute.status as typeof primaryStages[number]));
  const previousStage=stageIndex>0?primaryStages[stageIndex-1]:null;
  const nextStage=props.dispute.status==='dismissed'?null:primaryStages[stageIndex+1]??null;
  const partyExplanation=(decision:Decision)=>props.role==='tradesperson'?decision.tradesperson_explanation:decision.customer_explanation;
  return <main className="account-shell dispute-page"><RealtimeRefresh channelName={`dispute-${props.dispute.id}`} subscriptions={[{table:'dispute_cases',filter:`id=eq.${props.dispute.id}`},{table:'dispute_evidence',filter:`dispute_id=eq.${props.dispute.id}`},{table:'dispute_statements',filter:`dispute_id=eq.${props.dispute.id}`},{table:'dispute_decisions',filter:`dispute_id=eq.${props.dispute.id}`},{table:'dispute_events',filter:`dispute_id=eq.${props.dispute.id}`},{table:'dispute_internal_notes',filter:`dispute_id=eq.${props.dispute.id}`},{table:'dispute_appeals',filter:`dispute_id=eq.${props.dispute.id}`},{table:'tradesperson_sanctions',filter:`dispute_id=eq.${props.dispute.id}`}]} label="Uyuşmazlık dosyası"/><Link className="account-back" href={props.role==='admin'?'/yonetim/uyusmazliklar':`/islerim/${props.dispute.job_id}`}>← Geri</Link><header className="dispute-hero"><div><span>UYUŞMAZLIK OPERASYONU</span><h1>{props.dispute.category} kaydı</h1><p>{props.dispute.description}</p></div><div className={`sla-chip ${sla}`}><b>{labels[props.dispute.status]}</b><small>{sla==='overdue'?'SLA gecikti':sla==='due_soon'?'SLA yaklaşıyor':'SLA içinde'}</small><time>{new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(props.dispute.sla_due_at))}</time></div></header>
    <section className="dispute-stage-summary" aria-label="Uyuşmazlık aşamaları"><div className="past"><small>Önceki</small><b>{previousStage?labels[previousStage]:'Başlangıç'}</b></div><div className="current"><small>Mevcut aşama · {props.dispute.status==='dismissed'?'Akış dışı':`${stageIndex+1} / ${primaryStages.length}`}</small><b>{labels[props.dispute.status]}</b></div><div className="next"><small>Sıradaki</small><b>{nextStage?labels[nextStage]:'Süreç tamamlandı'}</b></div></section>
    <div className="dispute-layout">
      <div className="dispute-main">
        <section className="job-panel">
          <div className="panel-heading"><div><span>KANIT DOSYASI</span><h2>Tarafların sunduğu kayıtlar</h2></div><b>{props.evidence.length} kanıt</b></div>
          <div className="evidence-grid">
            {props.evidence.map(item => (
              <article key={item.id}>
                <b>{evidenceKinds[item.kind as keyof typeof evidenceKinds] ?? item.kind}</b>
                <p>{item.description}</p>
                <small>{item.submitted_by === props.currentUserId ? 'Siz' : 'Diğer taraf'} · {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(item.submitted_at))}</small>
                {item.signedUrl && <a href={item.signedUrl} target="_blank" rel="noreferrer">Kanıtı güvenli aç</a>}
              </article>
            ))}
          </div>
          {props.role !== 'admin' && !['closed', 'dismissed'].includes(props.dispute.status) && (
            <form className="evidence-form" onSubmit={upload}>
              <label className="field-label" htmlFor="dispute-evidence-kind">Kanıt türü</label>
              <select id="dispute-evidence-kind" name="kind" defaultValue="photo" aria-label="Kanıt Türü">
                {Object.entries(evidenceKinds).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="dispute-evidence-desc">Kanıt açıklaması <span aria-hidden="true">*</span></label>
              <input
                id="dispute-evidence-desc"
                name="description"
                required
                minLength={5}
                maxLength={1000}
                placeholder="Kanıtın neyi gösterdiğini açıklayın"
                aria-label="Kanıtın neyi gösterdiğini açıklayın"
              />
              <label className="field-label" htmlFor="dispute-evidence-file">Kanıt dosyası <span aria-hidden="true">*</span></label>
              <input
                id="dispute-evidence-file"
                name="file"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf,text/plain"
                aria-label="Kanıt dosyası seçin"
              />
              <Button variant="primary" loading={busy === 'evidence'}>Kanıt ekle</Button>
            </form>
          )}
        </section>


      <section className="job-panel">
        <div className="panel-heading"><div><span>TARAF BEYANLARI</span><h2>Yanıtlar ve açıklamalar</h2></div></div>
        {props.statements.map(item => (
          <article className="statement-card" key={item.id}>
            <b>{item.submitted_by === props.currentUserId ? 'Siz' : 'Diğer taraf'}</b>
            <p>{item.statement}</p>
            <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</time>
          </article>
        ))}
        {props.role !== 'admin' && !['closed', 'dismissed'].includes(props.dispute.status) && (
          <form className="stack-form" onSubmit={async event => {
            event.preventDefault();
            if (await post(`/api/disputes/${props.dispute.id}/statements`, { statement }, 'statement')) setStatement('');
          }}>
            <label className="field-label" htmlFor="dispute-statement-input">Beyanınız <span aria-hidden="true">*</span></label>
            <textarea
              id="dispute-statement-input"
              required
              minLength={20}
              maxLength={6000}
              value={statement}
              onChange={event => setStatement(event.target.value)}
              placeholder="Olay sırasını ve karşı tarafa yanıtınızı yazın"
              aria-label="Olay sırasını ve karşı tarafa yanıtınızı yazın"
            />
            <Button variant="primary" loading={busy === 'statement'}>Yanıtı kaydet</Button>
          </form>
        )}
      </section>

      <section className="job-panel">
        <div className="panel-heading"><div><span>KARARLAR</span><h2>Size iletilen açıklamalar</h2></div></div>
        {props.decisions.length ? props.decisions.map(item => (
          <article className="decision-card" key={item.id}>
            <b>{labels[item.decision_type] ?? item.decision_type}</b>
            <p>{partyExplanation(item)}</p>
            <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</time>
          </article>
        )) : <p className="trust-empty">Henüz taraflara iletilmiş bir karar bulunmuyor.</p>}
        {props.role !== 'admin' && ['notified', 'dismissed'].includes(props.dispute.status) && (
          <form className="stack-form" onSubmit={async event => {
            event.preventDefault();
            if (await post(`/api/disputes/${props.dispute.id}/appeals`, { reason: appeal }, 'appeal')) setAppeal('');
          }}>
            <label className="field-label" htmlFor="dispute-appeal-input">İtiraz gerekçeniz <span aria-hidden="true">*</span></label>
            <textarea
              id="dispute-appeal-input"
              required
              minLength={20}
              maxLength={4000}
              value={appeal}
              onChange={event => setAppeal(event.target.value)}
              placeholder="Karara neden itiraz ettiğinizi açıklayın"
              aria-label="Karara neden itiraz ettiğinizi açıklayın"
            />
            <Button variant="primary" loading={busy === 'appeal'}>İtiraz et</Button>
          </form>
        )}
      </section>

      {props.role === 'admin' && (
        <section className="job-panel operator-panel">
          <div className="panel-heading"><div><span>OPERASYON KONTROLÜ</span><h2>Durum ve taraf iletişimi</h2></div></div>
          <form className="stack-form" onSubmit={event => {
            event.preventDefault();
            void post(`/api/admin/disputes/${props.dispute.id}/transition`, {
              status: nextStatus,
              reason,
              evidenceDueAt: evidenceDueAt ? new Date(evidenceDueAt).toISOString() : null,
              customerExplanation: customerExplanation || null,
              tradespersonExplanation: tradespersonExplanation || null
            }, 'transition');
          }}>
            <label className="field-label" htmlFor="admin-dispute-status">Yeni aşama</label>
            <select id="admin-dispute-status" value={nextStatus} onChange={event => setNextStatus(event.target.value as DisputeOperationStatus)} aria-label="Yeni Aşama">
              {disputeStatusTransitions[props.dispute.status].map(status => (
                <option value={status} key={status}>{labels[status]}</option>
              ))}
            </select>
            {nextStatus === 'awaiting_evidence' && (
              <label>Kanıt son teslimi<input type="datetime-local" required value={evidenceDueAt} onChange={event => setEvidenceDueAt(event.target.value)} /></label>
            )}
            <label className="field-label" htmlFor="admin-dispute-reason">İşlem gerekçesi <span aria-hidden="true">*</span></label>
            <textarea
              id="admin-dispute-reason"
              required
              minLength={10}
              value={reason}
              onChange={event => setReason(event.target.value)}
              placeholder="Denetlenebilir operasyon gerekçesi"
              aria-label="Denetlenebilir operasyon gerekçesi"
            />
            {['resolution_proposed', 'notified', 'closed', 'dismissed'].includes(nextStatus) && (
              <>
                <label className="field-label" htmlFor="admin-customer-exp">Müşteriye gösterilecek açıklama <span aria-hidden="true">*</span></label>
                <textarea
                  id="admin-customer-exp"
                  required
                  minLength={10}
                  value={customerExplanation}
                  onChange={event => setCustomerExplanation(event.target.value)}
                  placeholder="Müşteriye gösterilecek karar açıklaması"
                  aria-label="Müşteriye gösterilecek karar açıklaması"
                />
                <label className="field-label" htmlFor="admin-trade-exp">Ustaya gösterilecek açıklama <span aria-hidden="true">*</span></label>
                <textarea
                  id="admin-trade-exp"
                  required
                  minLength={10}
                  value={tradespersonExplanation}
                  onChange={event => setTradespersonExplanation(event.target.value)}
                  placeholder="Ustaya gösterilecek karar açıklaması"
                  aria-label="Ustaya gösterilecek karar açıklaması"
                />
              </>
            )}
            <Button variant="primary" loading={busy === 'transition'} disabled={!disputeStatusTransitions[props.dispute.status].length}>Aşamayı kaydet</Button>
          </form>
          <div className="operator-columns">
            <form className="stack-form" onSubmit={async event => {
              event.preventDefault();
              if (await post(`/api/admin/disputes/${props.dispute.id}/notes`, { note }, 'note')) setNote('');
            }}>
              <h3>İç not</h3>
              <label className="field-label" htmlFor="admin-private-note">İç not metni <span aria-hidden="true">*</span></label>
              <textarea
                id="admin-private-note"
                required
                minLength={5}
                value={note}
                onChange={event => setNote(event.target.value)}
                placeholder="Yalnız operasyon ekibi görür"
                aria-label="Yalnız operasyon ekibi görür"
              />
              <Button variant="primary" loading={busy === 'note'}>İç not ekle</Button>
            </form>
            <form className="stack-form" onSubmit={async event => {
              event.preventDefault();
              if (await post(`/api/admin/disputes/${props.dispute.id}/sanctions`, {
                type: sanctionType,
                reason: sanctionReason,
                endsAt: sanctionEndsAt ? new Date(sanctionEndsAt).toISOString() : null
              }, 'sanction')) {
                setSanctionReason('');
                setSanctionEndsAt('');
              }
            }}>
              <h3>Usta yaptırımı</h3>
              <label className="field-label" htmlFor="admin-sanction-type">Yaptırım türü</label>
              <select id="admin-sanction-type" value={sanctionType} onChange={event => setSanctionType(event.target.value)} aria-label="Yaptırım Türü">
                <option value="warning">Uyarı</option>
                <option value="temporary_suspension">Geçici askı</option>
                <option value="permanent_suspension">Kalıcı askı</option>
              </select>
              {sanctionType === 'temporary_suspension' && (
                <label>Bitiş Zamanı<input type="datetime-local" required value={sanctionEndsAt} onChange={event => setSanctionEndsAt(event.target.value)} /></label>
              )}
              <label className="field-label" htmlFor="admin-sanction-reason">Yaptırım gerekçesi <span aria-hidden="true">*</span></label>
              <textarea
                id="admin-sanction-reason"
                required
                minLength={10}
                value={sanctionReason}
                onChange={event => setSanctionReason(event.target.value)}
                placeholder="Yaptırım gerekçesi"
                aria-label="Yaptırım gerekçesi"
              />
              <Button variant="primary" loading={busy === 'sanction'}>Yaptırımı kaydet</Button>
            </form>
          </div>
        </section>
      )}
    </div>
    <aside className="dispute-side">
      <section className="job-panel">
        <h2>Zaman çizelgesi</h2>
        {props.events.map(item => (
          <article className="timeline-row" key={item.id}>
            <i />
            <div>
              <b>{item.to_status ? labels[item.to_status] : item.event_type.replaceAll('_', ' ')}</b>
              {item.reason && <p>{item.reason}</p>}
              <small>{item.actor_role} · {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at))}</small>
            </div>
          </article>
        ))}
      </section>
      {props.role === 'admin' && (
        <section className="job-panel">
          <h2>İç notlar</h2>
          {props.notes.map(item => (
            <article className="private-note" key={item.id}>
              {item.note}
              <small>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at))}</small>
            </article>
          ))}
        </section>
      )}
      <section className="job-panel">
        <h2>İtiraz ve yaptırım</h2>
        {props.appeals.map(item => (
          <article className="private-note" key={item.id}>
            <b>İtiraz</b>{item.reason}
          </article>
        ))}
        {props.sanctions.map(item => (
          <article className="private-note" key={item.id}>
            <b>{item.sanction_type}</b>{item.reason}
          </article>
        ))}
      </section>
    </aside>
  </div>
  {notice && <p className="account-message" role="status">{notice}</p>}
</main>
;
}
