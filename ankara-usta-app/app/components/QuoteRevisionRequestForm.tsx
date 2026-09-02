'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {revisionFieldLabels,quoteRevisionRequestSchema} from '../domain/quoteRevision';
import styles from './quoteRevision.module.css';
export default function QuoteRevisionRequestForm({quoteId,currentUserId}:{quoteId:string;currentUserId:string}){
  const router=useRouter();const lock=useRef(false);
  const [fields,setFields]=useState<string[]>([]);const [reason,setReason]=useState('');
  const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);const [error,setError]=useState('');
  const [pending,setPending]=useState<{fields:string[];reason:string}|null>(null);
  async function submit(event:React.FormEvent){
    event.preventDefault();if(lock.current)return;
    const parsed=quoteRevisionRequestSchema.safeParse(pending??{fields,reason});if(!parsed.success)return;
    const outgoing=parsed.data;lock.current=true;setBusy(true);setError('');setPending(outgoing);
    try{
      const response=await fetch(`/api/quotes/${quoteId}/revision`,{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({action:'request',expectedUserId:currentUserId,...outgoing})});
      const body=await response.json() as {error?:string;revision?:{id:string}};
      if(!response.ok||!body.revision)throw new Error(body.error??'İstek kaydedilemedi.');
      setSent(true);router.refresh();
    }catch(problem){setError(problem instanceof Error?problem.message:'Bağlantı kurulamadı.');}
    finally{lock.current=false;setBusy(false);}
  }
  if(sent)return <p role="status">Revizyon isteğiniz kaydedildi. Yeni teklif geldiğinde değişiklikleri inceleyebilirsiniz.</p>;
  return <form className={styles.form} onSubmit={submit}><h2>Revizyon isteyin</h2><p>Bu istek teklif koşullarını değiştirmez ve işi başlatmaz. Usta yeni bir sürüm gönderir.</p>
    <fieldset disabled={busy||!!pending}><legend>Hangi konular değişmeli?</legend>{Object.entries(revisionFieldLabels).map(([value,label])=><label key={value}><input type="checkbox" checked={fields.includes(value)} onChange={()=>setFields(current=>current.includes(value)?current.filter(item=>item!==value):[...current,value])}/>{label}</label>)}</fieldset>
    <label htmlFor="quote-revision-reason">İstediğiniz değişiklik</label><textarea id="quote-revision-reason" required minLength={10} maxLength={2000} rows={4} value={reason} disabled={busy||!!pending} onChange={event=>setReason(event.target.value)} aria-describedby="revision-hint"/>
    <small id="revision-hint">10–2.000 karakter. İstenen kapsamı veya bedeli açıkça belirtin.</small>
    {error&&<p role="alert">{error} Yeniden deneme aynı isteği kullanır. Güncel durumu görmek için sayfayı yenileyebilirsiniz.</p>}
    <button type="submit" className="dialog-primary" disabled={busy||(!pending&&!quoteRevisionRequestSchema.safeParse({fields,reason}).success)}>{busy?'Gönderiliyor…':pending?'Yeniden dene':'Revizyon isteğini gönder'}</button>
  </form>;
}
