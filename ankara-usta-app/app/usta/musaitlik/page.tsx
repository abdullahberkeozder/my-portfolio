'use client';

import Link from 'next/link';
import { useState } from 'react';

const today=new Date().toISOString().slice(0,10);

export default function TradespersonAvailabilityPage(){
  const [availableFrom,setAvailableFrom]=useState(today);
  const [availableTo,setAvailableTo]=useState(today);
  const [acceptsUrgent,setAcceptsUrgent]=useState(false);
  const [active,setActive]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function submit(event:React.FormEvent){
    event.preventDefault();setBusy(true);setMessage('');
    const response=await fetch('/api/tradespeople/availability',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({availableFrom,availableTo,acceptsUrgent,active})});
    const body=await response.json() as {error?:string};setBusy(false);
    setMessage(response.ok?'Müsaitlik aralığınız kaydedildi.':body.error??'Müsaitlik kaydedilemedi.');
  }
  return <main className="account-shell"><Link className="account-back" href="/">← Orkestra</Link><form className="account-card availability-form" onSubmit={submit}><span>USTA MÜSAİTLİĞİ</span><h1>Yeni iş alabileceğiniz aralığı belirleyin</h1><p>Eşleştirme yalnızca hizmetiniz, bölgeniz, doğrulamanız ve bu tarih aralığınız birlikte uygunsa yapılır.</p><div className="quote-fields"><label>Başlangıç<input required type="date" value={availableFrom} onChange={event=>setAvailableFrom(event.target.value)}/></label><label>Bitiş<input required type="date" value={availableTo} onChange={event=>setAvailableTo(event.target.value)}/></label></div><label className="inline-check"><input type="checkbox" checked={acceptsUrgent} onChange={event=>setAcceptsUrgent(event.target.checked)}/>Bugün/acil talepleri kabul ediyorum</label><label className="inline-check"><input type="checkbox" checked={active} onChange={event=>setActive(event.target.checked)}/>Eşleştirmelerde aktif görün</label>{message&&<p className="account-message" role="status">{message}</p>}<button className="dialog-primary" disabled={busy} type="submit">{busy?'Kaydediliyor…':'Müsaitliği kaydet'}</button></form></main>;
}
