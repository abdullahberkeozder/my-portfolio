'use client';

import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import {quoteVersionInputSchema,type QuoteVersionInput} from '../domain/quotes';
import {quoteChanges} from '../domain/quoteRevision';
import QuoteChangeSummary from './QuoteChangeSummary';
import styles from './quoteRevision.module.css';

type Props={requestId:string;currentVersion:number;initial?:QuoteVersionInput;baseQuoteId?:string;currentUserId?:string};

const lines=(value:string)=>value.split('\n').map(item=>item.trim()).filter(Boolean);

export default function QuoteForm({requestId,currentVersion,initial,baseQuoteId,currentUserId}:Props){
  const router=useRouter();
  const [labor,setLabor]=useState(initial?String(initial.laborAmountKurus/100):'');
  const [material,setMaterial]=useState(initial?String(initial.materialAmountKurus/100):'0');
  const [duration,setDuration]=useState(String(initial?.estimatedDurationMinutes??120));
  const [warranty,setWarranty]=useState(String(initial?.warrantyDays??90));
  const [included,setIncluded]=useState(initial?.includedScope.join('\n')??'İşçilik\nTemel ekipman kullanımı');
  const [excluded,setExcluded]=useState(initial?.excludedScope.join('\n')??'Ek malzeme ve kapsam dışı onarım');
  const [note,setNote]=useState(initial?.note??'');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const lock=useRef(false);
  const [pending,setPending]=useState<QuoteVersionInput|null>(null);
  const [saved,setSaved]=useState(false);
  const draft=quoteVersionInputSchema.safeParse({laborAmountKurus:Math.round(Number(labor)*100),materialAmountKurus:Math.round(Number(material)*100),estimatedDurationMinutes:Number(duration),warrantyDays:Number(warranty),includedScope:lines(included),excludedScope:lines(excluded),note:note||undefined});

  async function submit(event:React.FormEvent){
    event.preventDefault();if(lock.current||saved||!draft.success)return;
    const outgoing=pending??draft.data;lock.current=true;setBusy(true);setMessage('');if(baseQuoteId)setPending(outgoing);
    try {
      const response=await fetch(baseQuoteId?`/api/quotes/${baseQuoteId}/revision`:'/api/quotes',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify(baseQuoteId?{action:'revise',expectedUserId:currentUserId,...outgoing}:{requestId,...outgoing})});
      const body=await response.json() as {error?:string;quote?:{id:string;version:number}};
      if(!response.ok||!body.quote)return setMessage(body.error??'Teklif kaydedilemedi.');
      if(baseQuoteId)setSaved(true);
      setMessage(`Teklifin ${body.quote?.version??currentVersion+1}. sürümü gönderildi.`);
      router.refresh();
      if(baseQuoteId)router.push(`/teklifler/${body.quote.id}`);
    } catch {
      // Network failure, JSON parse error, or unexpected exception
      setMessage('Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setBusy(false);
      lock.current=false;
    }
  }

  return <form className="quote-form account-card" onSubmit={submit}><span>TEKLİF SÜRÜMÜ {currentVersion+1}</span><h2>Kapsamı ve bedeli netleştirin</h2><p>Gönderilen teklif düzenlenmez. Bir değişiklik gerektiğinde önceki teklife bağlı yeni sürüm oluşturulur.</p><fieldset className={styles.conditions} disabled={busy||!!pending||saved}><legend>Teklif koşulları</legend><div className="quote-fields"><label>İşçilik (TL)<input required min="0" step="0.01" type="number" value={labor} onChange={event=>setLabor(event.target.value)}/></label><label>Malzeme (TL)<input required min="0" step="0.01" type="number" value={material} onChange={event=>setMaterial(event.target.value)}/></label><label>Tahmini süre (dakika)<input required min="1" type="number" value={duration} onChange={event=>setDuration(event.target.value)}/></label><label>İşçilik garantisi (gün)<input required min="0" max="3650" type="number" value={warranty} onChange={event=>setWarranty(event.target.value)}/></label></div><label>Dahil kapsam — her satıra bir madde<textarea required rows={5} value={included} onChange={event=>setIncluded(event.target.value)}/></label><label>Hariç kapsam — her satıra bir madde<textarea rows={4} value={excluded} onChange={event=>setExcluded(event.target.value)}/></label><label>Teklif notu<textarea rows={3} maxLength={2000} value={note} onChange={event=>setNote(event.target.value)}/></label></fieldset>{initial&&draft.success&&<QuoteChangeSummary before={initial} after={draft.data}/>}{pending&&!saved&&<p>Gönderim doğrulanana kadar alanlar korunur. Yeniden deneme aynı koşulları kullanır; güncel teklif için sayfayı yenileyebilirsiniz.</p>}{message&&<p className="account-message" role="status">{message}</p>}<button className="dialog-primary" disabled={busy||saved||!labor||!draft.success||(!pending&&!!initial&&draft.success&&quoteChanges(initial,draft.data).length===0)} type="submit">{busy?'Gönderiliyor…':saved?'Gönderildi':pending?'Yeniden dene':'Yeni teklif sürümünü gönder'}</button></form>;
}
