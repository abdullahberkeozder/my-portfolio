'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {invitationLabels,invitationState,type RequestInvitation} from '../domain/requestInvitation';
import styles from './requestInvitation.module.css';
import QuoteForm from './QuoteForm';

export default function RequestInvitationPanel({invitation,role,canRespond=true,compact=false,quoteVersion}:{invitation:RequestInvitation;serviceId:string;role:'customer'|'professional';canRespond?:boolean;compact?:boolean;quoteVersion?:number}) {
  const router=useRouter();
  const [now,setNow]=useState(()=>Date.now());
  const [reason,setReason]=useState('');
  const [confirm,setConfirm]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [result,setResult]=useState<RequestInvitation>();
  const current=result??invitation;
  const state=invitationState(current,now);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer);},[]);
  async function respond(action:'decline'|'broaden') {
    setBusy(true);setMessage('');
    try {
      const response=await fetch(`/api/requests/${invitation.request_id}/invitation`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='decline'?{action,reason}:{action,confirm})});
      const body=await response.json() as {error?:string;invitation?:RequestInvitation};
      if(!response.ok||!body.invitation)throw new Error(body.error??'Yanıt kaydedilemedi.');
      setResult(body.invitation);setExpanded(false);setConfirm(false);
      setMessage(action==='decline'?'Gerekçeniz müşteriye iletildi.':'Açık talep taslağınız hazır. Kontrol edip göndermeden diğer ustalara iletilmez.');
      router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:'Bağlantı kurulamadı.');}
    finally{setBusy(false);}
  }
  return <><section className={`account-card ${styles.panel}`} aria-label="Özel talep durumu">
    <h2>{invitationLabels[state]}</h2>
    {state==='awaiting'&&<p>Son yanıt: <time dateTime={current.response_due_at}>{new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(current.response_due_at))}</time> (Türkiye saati). Süre dolunca paylaşım otomatik genişlemez.</p>}
    {state==='declined'&&<p>Gerekçe: {current.decline_reason}</p>}
    {state==='expired'&&<p>Bu davetin yanıt süresi doldu. Talep hâlâ özel; başka ustalara gönderilmedi.</p>}
    {state==='broadened'&&<p>{current.successor_request_id?'Özel talep geçmişi korunuyor. Yeni talebin durumunu Taleplerim’den takip edebilirsiniz.':'Hazırlanan açık taslak silinmiş. Özel talep geçmişi korunuyor; hiçbir yeni talep otomatik oluşturulmaz.'}</p>}
    {!compact&&role==='customer'&&state==='broadened'&&current.successor_request_id&&<Link href="/taleplerim">Yeni taslağı veya talebi Taleplerim’de görüntüle →</Link>}
    {!compact&&canRespond&&role==='customer'&&state==='awaiting'&&<button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch(`/api/requests/${invitation.request_id}/match`,{method:'POST'});if(!response.ok)throw new Error();setMessage('Seçili ustanın uygunluğu yeniden kontrol edildi.');router.refresh();}catch{setMessage('Uygunluk kontrolü yapılamadı. Lütfen tekrar deneyin.');}finally{setBusy(false);}}}>Seçili ustanın uygunluğunu yenile</button>}
    {!compact&&canRespond&&role==='professional'&&state==='awaiting'&&<form onSubmit={event=>{event.preventDefault();void respond('decline');}}>
      <label htmlFor="invitation-reason">Bu işi neden üstlenemiyorsunuz? (Müşteri görür)</label>
      <textarea id="invitation-reason" required minLength={10} maxLength={1000} rows={3} value={reason} onChange={event=>setReason(event.target.value)} disabled={busy}/>
      <button type="submit" disabled={busy||reason.trim().length<10}>{busy?'Kaydediliyor…':'Gerekçeyle reddet'}</button>
    </form>}
    {!compact&&canRespond&&role==='customer'&&(state==='declined'||state==='expired')&&<>
      <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} disabled={busy}>Diğer uygun ustalardan teklif al</button>
      {expanded&&<div className={styles.confirm}>
        <p>Yeni bir açık talep taslağı oluşturulur. Hizmet, kapsam cevapları, ilçe/mahalle ve zaman tercihi kopyalanır. Özel ekler ve ret gerekçesi kopyalanmaz. Sonraki ekranda kapsamı ve zamanı kontrol edip açıkça göndermeniz gerekir.</p>
        <label><input type="checkbox" checked={confirm} onChange={event=>setConfirm(event.target.checked)} disabled={busy}/> Bu bilgilerle yeni açık talep taslağı hazırlanmasını onaylıyorum.</label>
        <button type="button" disabled={busy||!confirm} onClick={()=>void respond('broaden')}>{busy?'Hazırlanıyor…':'Onayla ve taslağı hazırla'}</button>
      </div>}
    </>}
    {message&&<p role="status">{message}</p>}
    {!compact&&<button type="button" onClick={()=>{setNow(Date.now());router.refresh();}} disabled={busy}>Durumu yenile</button>}
  </section>{!compact&&canRespond&&role==='professional'&&quoteVersion!==undefined&&(state==='awaiting'||state==='quoted')&&<QuoteForm requestId={invitation.request_id} currentVersion={quoteVersion}/>}</>;
}
