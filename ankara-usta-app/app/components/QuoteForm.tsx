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
  const [message,setMessage]=useState<{type: 'error' | 'success'; text: string} | null>(null);
  const lock=useRef(false);
  const [pending,setPending]=useState<QuoteVersionInput|null>(null);
  const [saved,setSaved]=useState(false);
  
  const draft=quoteVersionInputSchema.safeParse({
    laborAmountKurus:Math.round(Number(labor)*100),
    materialAmountKurus:Math.round(Number(material)*100),
    estimatedDurationMinutes:Number(duration),
    warrantyDays:Number(warranty),
    includedScope:lines(included),
    excludedScope:lines(excluded),
    note:note||undefined
  });

  async function submit(event:React.FormEvent){
    event.preventDefault();
    if(lock.current||saved||!draft.success) return;
    const outgoing=pending??draft.data;
    lock.current=true;
    setBusy(true);
    setMessage(null);
    if(baseQuoteId) setPending(outgoing);
    
    try {
      const response=await fetch(baseQuoteId?`/api/quotes/${baseQuoteId}/revision`:'/api/quotes',{
        method:'POST',
        signal:AbortSignal.timeout(15000),
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(baseQuoteId?{action:'revise',expectedUserId:currentUserId,...outgoing}:{requestId,...outgoing})
      });
      const body=await response.json() as {error?:string;quote?:{id:string;version:number}};
      if(!response.ok||!body.quote) {
        setMessage({type: 'error', text: body.error??'Teklif kaydedilemedi.'});
        return;
      }
      if(baseQuoteId) setSaved(true);
      setMessage({type: 'success', text: `Teklifin ${body.quote?.version??currentVersion+1}. sürümü gönderildi.`});
      router.refresh();
      if(baseQuoteId) router.push(`/teklifler/${body.quote.id}`);
    } catch {
      // Network failure, JSON parse error, or unexpected exception
      setMessage({type: 'error', text: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'});
    } finally {
      setBusy(false);
      lock.current=false;
    }
  }

  const noChanges = !pending && !!initial && draft.success && quoteChanges(initial, draft.data).length === 0;

  return (
    <form className="quote-form account-card" onSubmit={submit}>
      <span className="account-eyebrow">TEKLİF SÜRÜMÜ {currentVersion+1}</span>
      <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Kapsamı ve bedeli netleştirin</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Gönderilen teklif düzenlenmez. Bir değişiklik gerektiğinde önceki teklife bağlı yeni sürüm oluşturulur.
      </p>

      <fieldset className={styles.conditions} disabled={busy||!!pending||saved} style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="sr-only">Teklif koşulları</legend>
        
        {/* Pricing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="auth-field">
            <label htmlFor="quote-labor">İşçilik Ücreti (TL)</label>
            <input id="quote-labor" required min="0" step="0.01" type="number" value={labor} onChange={event=>setLabor(event.target.value)} placeholder="0.00" />
            <span className="field-hint">Sadece emeğinizi fiyatlandırın.</span>
          </div>
          <div className="auth-field">
            <label htmlFor="quote-material">Malzeme Ücreti (TL)</label>
            <input id="quote-material" required min="0" step="0.01" type="number" value={material} onChange={event=>setMaterial(event.target.value)} placeholder="0.00" />
            <span className="field-hint">Gerekli sarf malzemelerinin maliyeti. Yoksa 0 bırakın.</span>
          </div>
          <div className="auth-field">
            <label htmlFor="quote-duration">Tahmini Süre (Dakika)</label>
            <input id="quote-duration" required min="1" type="number" value={duration} onChange={event=>setDuration(event.target.value)} placeholder="120" />
            <span className="field-hint">İşin tahmini tamamlanma süresi.</span>
          </div>
          <div className="auth-field">
            <label htmlFor="quote-warranty">İşçilik Garantisi (Gün)</label>
            <input id="quote-warranty" required min="0" max="3650" type="number" value={warranty} onChange={event=>setWarranty(event.target.value)} placeholder="90" />
            <span className="field-hint">Müşteriye sunduğunuz garanti süresi.</span>
          </div>
        </div>

        {/* Scope Areas */}
        <div className="auth-field" style={{ marginBottom: '24px' }}>
          <label htmlFor="quote-included">Dahil Kapsam</label>
          <textarea 
            id="quote-included" 
            required 
            rows={5} 
            value={included} 
            onChange={event=>setIncluded(event.target.value)} 
            placeholder="Örn:&#10;Eski bataryanın sökülmesi&#10;Yeni batarya montajı&#10;Bağlantı kontrolleri ve sızıntı testi"
          />
          <span className="field-hint">Teklif fiyatına dahil olan tüm işlemleri alt alta yazın. Her satır bir maddedir.</span>
        </div>

        <div className="auth-field" style={{ marginBottom: '24px' }}>
          <label htmlFor="quote-excluded">Hariç Kapsam</label>
          <textarea 
            id="quote-excluded" 
            rows={4} 
            value={excluded} 
            onChange={event=>setExcluded(event.target.value)} 
            placeholder="Örn:&#10;Duvardaki fayans hasarlarının onarımı&#10;Batarya hariç su tesisatı yenileme"
          />
          <span className="field-hint">Bu fiyata dahil olmayan, ek ücrete tabi olabilecek durumlar. (İsteğe bağlı)</span>
        </div>

        <div className="auth-field" style={{ marginBottom: '24px' }}>
          <label htmlFor="quote-note">Müşteriye Not</label>
          <textarea 
            id="quote-note" 
            rows={3} 
            maxLength={2000} 
            value={note} 
            onChange={event=>setNote(event.target.value)}
            placeholder="Müşteriye iletmek istediğiniz ek bir bilgi veya mesaj..." 
          />
        </div>
      </fieldset>

      {initial&&draft.success&&<QuoteChangeSummary before={initial} after={draft.data}/>}
      
      {pending&&!saved&& (
        <div className="auth-alert auth-alert-warning" role="alert" style={{ marginBottom: '24px' }}>
          <span>⚠ Gönderim doğrulanana kadar alanlar korunur. Yeniden deneme aynı koşulları kullanır.</span>
        </div>
      )}

      {message&& (
        <div className={`auth-alert auth-alert-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'} style={{ marginBottom: '24px' }}>
          <span className="auth-alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div className="application-actions-sticky" style={{ marginTop: '32px' }}>
        <button 
          className="auth-submit-btn" 
          disabled={busy||saved||!labor||!draft.success||noChanges} 
          type="submit"
        >
          {busy ? (
            <><span className="btn-spinner" aria-hidden="true" /> Gönderiliyor…</>
          ) : saved ? (
            'Gönderildi ✓'
          ) : pending ? (
            'Yeniden dene'
          ) : (
            'Yeni Teklif Sürümünü Gönder →'
          )}
        </button>
      </div>
    </form>
  );
}
