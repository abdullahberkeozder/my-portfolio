'use client';

import Link from 'next/link';
import {useEffect, useRef} from 'react';
import OrchestraLogo from '../OrchestraLogo';
import {requestTimingLabel} from '../../domain/requestTiming';
import styles from './wizardSuccessReceipt.module.css';

type Props={
  requestId:string;
  serviceName:string;
  district:string;
  neighborhood:string;
  timing:string;
  targetProfessionalName?:string;
};

export default function WizardSuccessReceipt({requestId,serviceName,district,neighborhood,timing,targetProfessionalName}:Props){
  const titleRef=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{titleRef.current?.focus({preventScroll:true});},[]);

  return <div className={styles.stage} role="status" aria-live="polite">
    <div className={styles.printer} aria-hidden="true"/>
    <article className={styles.receipt}>
      <header><OrchestraLogo size={28} variant="primary"/><div><strong>Orkestra</strong><span>Talep kaydı</span></div></header>
      <div className={styles.confirmation}><span aria-hidden="true">✓</span><div><p>Talep alındı</p><h2 ref={titleRef} tabIndex={-1}>Ustalara iletilmek üzere hazır</h2></div></div>
      <dl>
        <div><dt>Hizmet</dt><dd>{serviceName}</dd></div>
        <div><dt>Konum</dt><dd>{neighborhood}, {district}</dd></div>
        <div><dt>Zaman</dt><dd>{requestTimingLabel(timing)}</dd></div>
        <div><dt>Talep no</dt><dd>{requestId.slice(0,8).toLocaleUpperCase('tr-TR')}</dd></div>
      </dl>
      <p className={styles.next}>{targetProfessionalName
        ? `${targetProfessionalName} talebinizi inceleyecek. Yanıt gelmezse talep başka ustalara otomatik açılmaz.`
        : 'Uygun ve doğrulanmış ustalar kapsamı inceleyecek. Teklif geldiğinde çalışma alanınız güncellenir.'}</p>
      <Link className={styles.action} href={`/taleplerim/${requestId}/teklifler?created=1`}>Talebi görüntüle</Link>
      <div className={styles.cut} aria-hidden="true"/>
    </article>
  </div>;
}
