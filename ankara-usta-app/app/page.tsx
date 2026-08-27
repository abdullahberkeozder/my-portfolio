'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { DeliveryModel, popularServices, serviceCategories, services, servicesByCategory } from './data/serviceTaxonomy';
import { ClassificationResult, classifyService } from './lib/classifyService';
import RequestWizard from './components/RequestWizard';
import NeighborhoodBond from './components/NeighborhoodBond';

const deliveryLabels: Record<DeliveryModel,string> = {
  package:'Paket hizmet', quote:'Teklif karşılaştırma', inspection:'Keşif gerektirebilir'
};

export default function Home(){
  const [selected,setSelected]=useState(0);
  const [query,setQuery]=useState('');
  const [dialog,setDialog]=useState(false);
  const [classification,setClassification]=useState<ClassificationResult|null>(null);
  const [selectedServiceId,setSelectedServiceId]=useState<string|null>(null);
  const [wizardServiceId,setWizardServiceId]=useState<string|null>(null);
  const active=serviceCategories[selected];
  const activeServices=servicesByCategory(active.id);

  function startClassification(value:string){
    const result=classifyService(value);
    setQuery(value);
    setClassification(result);
    setSelectedServiceId(result.candidates[0]?.service.id ?? null);
    setDialog(true);
  }

  function submit(event:FormEvent){event.preventDefault();if(query.trim())startClassification(query)}
  function continueToWizard(){if(selectedServiceId){setDialog(false);setWizardServiceId(selectedServiceId)}}

  return <main>
    <header className="tr-header"><div className="header-inner"><a href="#top" className="tr-brand"><NeighborhoodBond className="brand-bond" decorative={false}/><b>Ankara Usta</b></a><nav><a href="#services">Hizmetler</a><a href="/taleplerim">Taleplerim</a><Link href="/islerim">İşlerim</Link><a href="/giris">Kayıt ol / Giriş yap</a><a className="join-link" href="/usta-basvurusu">Usta olarak katıl</a></nav><button className="hamburger" aria-label="Menüyü aç">☰</button></div></header>

    <section className="tr-hero" id="top">
      <div className="hero-bond-field" aria-hidden="true"><NeighborhoodBond className="hero-bond"/></div>
      <div className="tetris-scatter" aria-hidden="true">
        <span className="tetris-piece tetris-l tetris-left-top"><i/><i/><i/><i/></span>
        <span className="tetris-piece tetris-t tetris-right-mid"><i/><i/><i/><i/></span>
        <span className="tetris-piece tetris-s tetris-left-low"><i/><i/><i/><i/></span>
        <span className="tetris-piece tetris-o tetris-right-low"><i/><i/><i/><i/></span>
      </div>
      <div className="local-badge"><NeighborhoodBond className="badge-bond"/><span>ANKARA</span><b>Yerel hizmet</b></div>
      <h1>Güvenilir ustayı bul<br/>evindeki işi tamamla</h1>
      <form className="tr-search" onSubmit={submit}><input value={query} onChange={event=>setQuery(event.target.value)} aria-label="Ne konuda yardıma ihtiyacınız var?" placeholder="Ne konuda yardıma ihtiyacınız var?"/><button aria-label="Ara" type="submit">⌕</button></form>
      <div className="category-zone" id="services">
        <div className="icon-tabs" role="tablist">{serviceCategories.map((category,index)=><button role="tab" aria-selected={selected===index} className={selected===index?'active':''} onClick={()=>setSelected(index)} type="button" key={category.id}><span>{category.icon}</span><b>{category.name}</b></button>)}</div>
        <div className="pill-row">{activeServices.map(service=><button type="button" onClick={()=>startClassification(service.name)} key={service.id}>{service.name}</button>)}</div>
        <div className="feature-showcase"><div className="showcase-photo"/><article><h2>{active.title}</h2><p>✓ &nbsp; {active.description[0]}</p><p>✓ &nbsp; {active.description[1]}</p></article></div>
      </div>
    </section>

    <section className="number-band trust-band"><div><span>Kapsam baştan netleşir</span><b>Dahil ve hariç işler</b></div><div><span>Doğrulama görünürdür</span><b>Belge ve referanslar</b></div><div><span>Karar sizin</span><b>Paket, teklif veya keşif</b></div><div><span>Süreç kayıt altındadır</span><b>İş günlüğü ve onay</b></div><div><span>Yerel eşleştirme</span><b>İlçe ve mahalle odağı</b></div><NeighborhoodBond className="trust-bond-mark"/></section>

    <section className="tr-section popular-section"><h2>Popüler işler</h2><div className="project-grid">{popularServices.map((service,index)=><button type="button" onClick={()=>startClassification(service.name)} key={service.id}><div className={`project-image project-${index+1}`}/><strong>{service.name}</strong><span>{deliveryLabels[service.deliveryModel]}</span></button>)}</div></section>

    <section className="satisfaction tr-section"><h2>Memnuniyetiniz, <span>güvencemiz.</span></h2><div><article><h3>İşçilik güvencesi</h3><p>Kapsam, değişiklikler ve müşteri kabulü dijital iş günlüğünde kayıt altında tutulur.</p></article><article><h3>Doğrulanmış ustalar</h3><p>Telefon, mesleki belge, adres ve referanslar ayrı ayrı kontrol edilir.</p></article><article><h3>Kesintisiz destek</h3><p>İhtiyaç duyduğunuzda şikâyet ve uyuşmazlık sürecinde yanınızdayız.</p></article></div></section>

    <section className="how-section"><div className="how-card"><h2>Nasıl çalışır?</h2><ol><li><span>1</span><p>Fiyat, beceri ve değerlendirmeye göre ustayı seçin.</p></li><li><span>2</span><p>Bugün veya size uygun başka bir gün için randevu alın.</p></li><li><span>3</span><p>Mesajlaşın, işi takip edin ve değerlendirin.</p></li></ol></div><div className="how-photo"><div className="how-bond-signature"><NeighborhoodBond className="how-bond"/><span>İş tamamlandı</span></div></div></section>

    <section className="tr-section help-today"><h2>Bugün yardım alın</h2><div>{services.map(service=><button onClick={()=>startClassification(service.name)} type="button" key={service.id}>{service.name}</button>)}</div><a href="#services">Tüm hizmetleri gör&nbsp; ›</a></section>

    <footer className="tr-footer"><div className="footer-inner"><div><p>Bizi takip edin, yakınız:</p><div className="socials">○ &nbsp; ○ &nbsp; ○ &nbsp; ○</div></div><div><p>Keşfet</p><a href="#">Usta olarak katıl</a><a href="#">Ankara ilçeleri</a><a href="#services">Tüm hizmetler</a><a href="#">Fiyat rehberleri</a><a href="#">Yardım</a></div><div><p>Şirket</p><a href="#">Hakkımızda</a><a href="#">Kariyer</a><a href="#">İş ortaklığı</a><a href="#">Blog</a><a href="#">Koşullar & Gizlilik</a></div><div><p>Mobil uygulama</p><strong>Yapılacaklar listeniz her zaman yanınızda.</strong><div className="app-badge">Yakında</div></div></div></footer>

    <button className="help-float" type="button">? &nbsp; Yardım</button>

    {dialog&&classification&&<div className="dialog-backdrop" role="presentation" onClick={()=>setDialog(false)}><section className="request-dialog classification-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={event=>event.stopPropagation()}><button className="dialog-close" onClick={()=>setDialog(false)} aria-label="Kapat">×</button><span>HİZMET SINIFLANDIRMA</span><h2 id="dialog-title">İhtiyacınızı doğru anladık mı?</h2><p className="query-echo">“{classification.query}”</p>{classification.candidates.length>0?<><div className={`confidence confidence-${classification.confidence}`}>{classification.confidence==='high'?'Güçlü eşleşme':classification.confidence==='medium'?'Muhtemel eşleşme':'Birlikte netleştirelim'}</div><div className="candidate-list">{classification.candidates.map((candidate,index)=>{const category=serviceCategories.find(item=>item.id===candidate.service.categoryId);return <button type="button" className={selectedServiceId===candidate.service.id?'selected':''} onClick={()=>setSelectedServiceId(candidate.service.id)} key={candidate.service.id}><span className="candidate-radio">{selectedServiceId===candidate.service.id?'●':'○'}</span><span><b>{candidate.service.name}</b><small>{category?.name} · {deliveryLabels[candidate.service.deliveryModel]}</small></span>{index===0&&<em>Önerilen</em>}</button>})}</div><button className="dialog-primary" type="button" disabled={!selectedServiceId} onClick={continueToWizard}>Bu hizmetle devam et</button></>:<><div className="confidence confidence-low">Eşleşme bulunamadı</div><p>İfadenizi biraz daha ayrıntılı yazabilir veya aşağıdan bir hizmet kategorisi seçebilirsiniz.</p><div className="manual-categories">{serviceCategories.map(category=><button type="button" onClick={()=>{setDialog(false);document.getElementById('services')?.scrollIntoView({behavior:'smooth'})}} key={category.id}>{category.name}</button>)}</div></>}</section></div>}
    {wizardServiceId&&<RequestWizard service={services.find(service=>service.id===wizardServiceId)!} onClose={()=>setWizardServiceId(null)}/>} 
  </main>
}
