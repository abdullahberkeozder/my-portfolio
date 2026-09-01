'use client';

import {CSSProperties,useMemo} from 'react';
import {Service,serviceCategories} from '../data/serviceTaxonomy';
import OrchestraLogo from './OrchestraLogo';

interface WorkReceiptProps{
  service:Service;answers:Record<string,string>;questions:Array<{id:string;label:string}>;
  district?:string;neighborhood?:string;timing?:string;filesCount?:number;
  idempotencyKey?:string;step:number;isCompact?:boolean;calm?:boolean;
}

const modelCopy={
  package:{label:'Paket hizmet',note:'Standart kapsam üzerinden ilerler'},
  quote:{label:'Teklif',note:'Ustalar aynı kapsam üzerinden fiyat verir'},
  inspection:{label:'Keşif',note:'Usta kapsamı yerinde doğrular'},
} as const;

export default function WorkReceipt({service,answers,questions,district,neighborhood,timing,filesCount=0,idempotencyKey,step,isCompact=false}:WorkReceiptProps){
  const category=useMemo(()=>serviceCategories.find(item=>item.id===service.categoryId),[service.categoryId]);
  const answered=questions.filter(question=>answers[question.id]);
  const model=modelCopy[service.deliveryModel];
  const isComplete=step>=3;

  const reference=idempotencyKey?.replaceAll('-','').slice(-8).toUpperCase()??'YENİ TALEP';

  return <aside className={`premium-receipt ${isCompact?'is-compact':''} ${isComplete?'is-complete':''}`} aria-label="Talep kapsamı özeti">
    <div className="premium-receipt-printer" aria-hidden="true"><span/></div>
    <article className="premium-receipt-paper">
      <header className="premium-receipt-header">
        <div className="premium-receipt-brand"><OrchestraLogo size={20} variant="emerald"/><div><strong>ORKESTRA</strong><span>İş kapsam fişi</span></div></div>
        <div className="premium-receipt-state"><i aria-hidden="true"/>{isComplete?'Onaya hazır':'Taslak'}</div>
      </header>

      <dl className="premium-receipt-meta">
        <div><dt>Fiş no</dt><dd>{reference}</dd></div>
        <div><dt>İlerleme</dt><dd>{answered.length}/{questions.length} kapsam</dd></div>
      </dl>

      <section className="premium-receipt-service">
        <span>{category?.name??'Hizmet'}</span>
        <h3>{service.name}</h3>
        <small>{model.label} · {model.note}</small>
      </section>

      <section className="premium-receipt-scope" aria-live="polite" aria-atomic="false">
        <div className="premium-receipt-section-title"><span>Belirlenen kapsam</span><b>{answered.length ? 'KAYITLI' : 'BEKLİYOR'}</b></div>
        {answered.length===0?<p className="premium-receipt-empty">Yanıt verdikçe işin kapsamı bu fişe işlenecek.</p>:answered.map((question,index)=><div className="premium-receipt-line" style={{'--receipt-line-index':index} as CSSProperties} key={`${question.id}-${answers[question.id]}`}><span>{question.label}</span><strong>{answers[question.id]}</strong></div>)}
      </section>

      {(district||timing||filesCount>0)&&<dl className="premium-receipt-details">
        {district&&<div><dt>Bölge</dt><dd>{district}{neighborhood?` · ${neighborhood}`:''}</dd></div>}
        {timing&&<div><dt>Zaman</dt><dd>{timing}</dd></div>}
        {filesCount>0&&<div><dt>Ekler</dt><dd>{filesCount} dosya</dd></div>}
      </dl>}

      <footer className="premium-receipt-footer"><span aria-hidden="true">✓</span><p>Bu kapsam sizin onayınız olmadan değiştirilemez.</p></footer>
      {isComplete&&<div className="premium-receipt-stamp" aria-label="Talep onaya hazır">KAPSAM ONAYA HAZIR</div>}
    </article>
  </aside>;
}
