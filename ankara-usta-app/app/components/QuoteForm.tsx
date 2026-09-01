'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props={requestId:string;currentVersion:number};

const lines=(value:string)=>value.split('\n').map(item=>item.trim()).filter(Boolean);

export default function QuoteForm({requestId,currentVersion}:Props){
  const router=useRouter();
  const [labor,setLabor]=useState('');
  const [material,setMaterial]=useState('0');
  const [duration,setDuration]=useState('120');
  const [warranty,setWarranty]=useState('90');
  const [included,setIncluded]=useState('İşçilik\nTemel ekipman kullanımı');
  const [excluded,setExcluded]=useState('Ek malzeme ve kapsam dışı onarım');
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function submit(event:React.FormEvent){
    event.preventDefault();setBusy(true);setMessage('');
    const response=await fetch('/api/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      requestId,laborAmountKurus:Math.round(Number(labor)*100),materialAmountKurus:Math.round(Number(material)*100),
      estimatedDurationMinutes:Number(duration),warrantyDays:Number(warranty),includedScope:lines(included),excludedScope:lines(excluded),note:note||undefined,
    })});
    const body=await response.json() as {error?:string;quote?:{version:number}};setBusy(false);
    if(!response.ok)return setMessage(body.error??'Teklif kaydedilemedi.');
    setMessage(`Teklifin ${body.quote?.version??currentVersion+1}. sürümü gönderildi.`);
    router.refresh();
  }

  return <form className="quote-form account-card" onSubmit={submit}><span>TEKLİF SÜRÜMÜ {currentVersion+1}</span><h1>Kapsamı ve bedeli netleştirin</h1><p>Gönderilen teklif düzenlenmez. Bir değişiklik gerektiğinde önceki teklife bağlı yeni sürüm oluşturulur.</p><div className="quote-fields"><label>İşçilik (TL)<input required min="0" step="0.01" type="number" value={labor} onChange={event=>setLabor(event.target.value)}/></label><label>Malzeme (TL)<input required min="0" step="0.01" type="number" value={material} onChange={event=>setMaterial(event.target.value)}/></label><label>Tahmini süre (dakika)<input required min="1" type="number" value={duration} onChange={event=>setDuration(event.target.value)}/></label><label>İşçilik garantisi (gün)<input required min="0" max="3650" type="number" value={warranty} onChange={event=>setWarranty(event.target.value)}/></label></div><label>Dahil kapsam — her satıra bir madde<textarea required rows={5} value={included} onChange={event=>setIncluded(event.target.value)}/></label><label>Hariç kapsam — her satıra bir madde<textarea rows={4} value={excluded} onChange={event=>setExcluded(event.target.value)}/></label><label>Teklif notu<textarea rows={3} maxLength={2000} value={note} onChange={event=>setNote(event.target.value)}/></label>{message&&<p className="account-message" role="status">{message}</p>}<button className="dialog-primary" disabled={busy||!labor||!lines(included).length} type="submit">{busy?'Gönderiliyor…':'Yeni teklif sürümünü gönder'}</button></form>;
}
