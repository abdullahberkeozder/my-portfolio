'use client';
import { requestTimingLabel } from '../domain/requestTiming';

import {useMemo} from 'react';
import {Service,serviceCategories} from '../data/serviceTaxonomy';
import OrchestraLogo from './OrchestraLogo';

interface WorkReceiptProps{
  service:Service;answers:Record<string,string>;questions:Array<{id:string;label:string}>;
  district?:string;neighborhood?:string;timing?:string;filesCount?:number;
  step:number;isCompact?:boolean;
}

export default function WorkReceipt({service,answers,questions,district,neighborhood,timing,filesCount=0,step,isCompact=false}:WorkReceiptProps){
  const category=useMemo(()=>serviceCategories.find(item=>item.id===service.categoryId),[service.categoryId]);
  const answered=questions.filter(question=>answers[question.id]);
  const isComplete=step>=3;
  return <aside className={`premium-receipt ${isCompact?'is-compact':''} ${isComplete?'is-complete':''}`} aria-label="Talep kapsamı özeti">
    <article className="premium-receipt-paper">
      <header className="premium-receipt-header">
        <div className="premium-receipt-brand"><OrchestraLogo size={20} variant="primary"/><div><strong>Talep özeti</strong><span>Orkestra</span></div></div>
        <div className="premium-receipt-state">{isComplete?'Kontrol edin':'Hazırlanıyor'}</div>
      </header>

      <section className="premium-receipt-service">
        <span>{category?.name??'Hizmet'}</span>
        <h3>{service.name}</h3>
      </section>

      <dl className="premium-receipt-details">
        <div><dt>Kapsam</dt><dd>{answered.length}/{questions.length} yanıt</dd></div>
        <div><dt>Konum</dt><dd>{district ? `${district}${neighborhood?`, ${neighborhood}`:''}` : 'Bekliyor'}</dd></div>
        <div><dt>Zamanlama</dt><dd>{timing ? requestTimingLabel(timing) : 'Bekliyor'}</dd></div>
        <div><dt>Medya</dt><dd>{filesCount > 0 ? `${filesCount} dosya` : 'Eklenmedi'}</dd></div>
      </dl>

      <footer className="premium-receipt-footer"><p>Bu özet teklif veya iş anlaşması değildir. Göndermeden önce bilgilerinizi kontrol edin.</p></footer>
    </article>
  </aside>;
}
