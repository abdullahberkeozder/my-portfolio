'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type ComparableQuote={id:string;tradespersonName:string;version:number;laborAmountKurus:number;materialAmountKurus:number;estimatedDurationMinutes:number;warrantyDays:number;includedScope:string[];excludedScope:string[];note:string|null};

const money=(kurus:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(kurus/100);

export default function QuoteComparison({quotes}: {quotes:ComparableQuote[]}){
  const router=useRouter();
  const [selected,setSelected]=useState(quotes.slice(0,3).map(quote=>quote.id));
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');
  function toggle(id:string){setSelected(current=>current.includes(id)?current.filter(item=>item!==id):current.length<3?[...current,id]:current)}
  async function accept(id:string){
    setBusy(id);setMessage('');
    const response=await fetch(`/api/quotes/${id}/accept`,{method:'POST'});
    const body=await response.json() as {error?:string};setBusy('');
    if(!response.ok)return setMessage(body.error??'Teklif kabul edilemedi.');
    setMessage('Teklif kabul edildi. Diğer teklifler otomatik kapatıldı.');router.refresh();
  }
  const compared=quotes.filter(quote=>selected.includes(quote.id));
  return <section className="quote-comparison"><div className="comparison-picker"><p>Karşılaştırmak için en fazla üç teklif seçin.</p>{quotes.map(quote=><label key={quote.id}><input type="checkbox" checked={selected.includes(quote.id)} disabled={!selected.includes(quote.id)&&selected.length===3} onChange={()=>toggle(quote.id)}/>{quote.tradespersonName} · Sürüm {quote.version}</label>)}</div><div className="comparison-grid">{compared.map(quote=><article key={quote.id}><span>DOĞRULANMIŞ USTA</span><h2>{quote.tradespersonName}</h2><strong>{money(quote.laborAmountKurus+quote.materialAmountKurus)}</strong><dl><div><dt>İşçilik</dt><dd>{money(quote.laborAmountKurus)}</dd></div><div><dt>Malzeme</dt><dd>{money(quote.materialAmountKurus)}</dd></div><div><dt>Süre</dt><dd>{quote.estimatedDurationMinutes} dk.</dd></div><div><dt>Garanti</dt><dd>{quote.warrantyDays} gün</dd></div></dl><h3>Dahil</h3><ul>{quote.includedScope.map(item=><li key={item}>{item}</li>)}</ul><h3>Hariç</h3>{quote.excludedScope.length?<ul>{quote.excludedScope.map(item=><li key={item}>{item}</li>)}</ul>:<p>Belirtilmedi</p>}{quote.note&&<p>{quote.note}</p>}<button className="dialog-primary" disabled={Boolean(busy)} onClick={()=>void accept(quote.id)} type="button">{busy===quote.id?'Kabul ediliyor…':'Bu teklifi kabul et'}</button></article>)}</div>{message&&<p className="account-message" role="status">{message}</p>}</section>;
}
