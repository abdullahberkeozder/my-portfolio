'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service, serviceCategories } from '../data/serviceTaxonomy';
import { getWizardDefinition } from '../data/wizardDefinitions';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { useModalDialog } from '../hooks/useModalDialog';

type Props = { service: Service; onClose: () => void };
type LocalDraft = {answers:Record<string,string>;district:string;neighborhood:string;timing:string;step:number;idempotencyKey:string;requestId?:string};
type ApiBody = {error?:string;request?:{id:string}};

function readLocalDraft(storageKey:string):LocalDraft|undefined{
  if(typeof window==='undefined')return undefined;
  try{const saved=localStorage.getItem(storageKey);return saved?JSON.parse(saved) as LocalDraft:undefined}catch{return undefined}
}

const districts=['Çankaya','Keçiören','Yenimahalle','Etimesgut','Mamak','Sincan','Altındağ','Gölbaşı','Pursaklar'];
const resultContent={
  package:{eyebrow:'PAKET HİZMET',title:'Doğrudan randevuya uygun',copy:'Kapsamınız standart bir işe karşılık geliyor. Sonraki aşamada uygun zamanları ve doğrulanmış hizmet verenleri görebileceksiniz.',cta:'Talebi gönder'},
  quote:{eyebrow:'TEKLİF MODELİ',title:'Karşılaştırılabilir teklifler alın',copy:'Talebiniz aynı kapsam özetiyle uygun ustalara iletilecek. İşçilik, malzeme, süre ve hariç kapsam alanlarını yan yana karşılaştırabileceksiniz.',cta:'Teklif talebini gönder'},
  inspection:{eyebrow:'KEŞİF MODELİ',title:'Önce uzman değerlendirmesi gerekli',copy:'Fiyat ve uygulama yöntemi yerinde incelemeye bağlı. Talebiniz keşif yapabilen uygun ustalarla eşleştirilecek.',cta:'Keşif talebini gönder'},
};

export default function RequestWizard({service,onClose}:Props){
  const router=useRouter();
  const dialogRef=useModalDialog<HTMLElement>(true,onClose);
  const definition=getWizardDefinition(service.id);
  const questions=definition.questions;
  const storageKey=`ankara-usta:draft:${service.id}`;
  const [initialDraft]=useState(()=>readLocalDraft(storageKey));
  const [step,setStep]=useState(initialDraft?.step ?? 0);
  const [answers,setAnswers]=useState<Record<string,string>>(initialDraft?.answers ?? {});
  const [files,setFiles]=useState<File[]>([]);
  const [district,setDistrict]=useState(initialDraft?.district ?? '');
  const [neighborhood,setNeighborhood]=useState(initialDraft?.neighborhood ?? '');
  const [timing,setTiming]=useState(initialDraft?.timing ?? 'Bu hafta');
  const [idempotencyKey]=useState(()=>initialDraft?.idempotencyKey ?? crypto.randomUUID());
  const [requestId,setRequestId]=useState<string|undefined>(initialDraft?.requestId);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const category=serviceCategories.find(item=>item.id===service.categoryId);
  const result=resultContent[service.deliveryModel];
  const scopeComplete=questions.every(question=>answers[question.id]);
  const locationComplete=Boolean(district&&neighborhood.trim());
  const summary=useMemo(()=>questions.map(question=>({label:question.label,value:answers[question.id]})),[answers,questions]);

  useEffect(()=>{
    const draft:LocalDraft={answers,district,neighborhood,timing,step,idempotencyKey,requestId};
    localStorage.setItem(storageKey,JSON.stringify(draft));
  },[answers,district,idempotencyKey,neighborhood,requestId,step,storageKey,timing]);

  function filesChanged(event:ChangeEvent<HTMLInputElement>){setFiles(Array.from(event.target.files ?? []))}

  async function saveDraft(showAuthError=false){
    const response=await fetch('/api/requests/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idempotencyKey,serviceId:service.id,answers,district:district||undefined,neighborhood:neighborhood||undefined,preferredTiming:timing})});
    const body=await response.json() as ApiBody;
    if(response.status===401){if(showAuthError)setMessage('Talebi göndermek için önce müşteri hesabınıza giriş yapın. Taslağınız bu cihazda korunuyor.');return undefined}
    if(!response.ok)throw new Error(body.error ?? 'Taslak kaydedilemedi.');
    if(!body.request)throw new Error('Sunucu geçerli bir taslak döndürmedi.');
    setRequestId(body.request.id);
    return body.request.id;
  }

  async function continueFromScope(){
    setStep(1);
    try{await saveDraft(false)}catch{/* Local draft remains available when offline. */}
  }

  async function uploadMedia(id:string){
    if(!files.length)return;
    const supabase=createSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)throw new Error('Medya yüklemek için oturum açın.');
    for(const file of files){
      const extension=file.name.split('.').pop()?.toLowerCase() || 'bin';
      const path=`${user.id}/${id}/${crypto.randomUUID()}.${extension}`;
      const {error}=await supabase.storage.from('request-media').upload(path,file,{contentType:file.type,upsert:false});
      if(error)throw error;
      const metadataResponse=await fetch(`/api/requests/${id}/media`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({storagePath:path,contentType:file.type,byteSize:file.size})});
      if(!metadataResponse.ok)throw new Error('Medya bilgisi kaydedilemedi.');
    }
  }

  async function submitRequest(){
    setBusy(true);setMessage('');
    try{
      const id=await saveDraft(true);
      if(!id)return;
      await uploadMedia(id);
      const response=await fetch(`/api/requests/${id}/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idempotencyKey})});
      const body=await response.json() as ApiBody;
      if(!response.ok)throw new Error(body.error ?? 'Talep gönderilemedi.');
      localStorage.removeItem(storageKey);
      router.push('/taleplerim');
      router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:'Talep gönderilemedi.')}finally{setBusy(false)}
  }

  return <div className="dialog-backdrop wizard-backdrop" role="presentation" onClick={onClose}><section ref={dialogRef} tabIndex={-1} className="request-dialog wizard-dialog" role="dialog" aria-modal="true" aria-labelledby="wizard-title" onClick={event=>event.stopPropagation()}><button data-dialog-initial-focus className="dialog-close" onClick={onClose} aria-label="Kapat">×</button><div className="wizard-progress" role="progressbar" aria-label="Talep adımları" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step+1}><span style={{width:`${((step+1)/4)*100}%`}}/></div><p className="wizard-step">ADIM {step+1} / 4 · {category?.name}</p>
    {step===0&&<><h2 id="wizard-title">{service.name}</h2><p>{definition.intro}</p><div className="wizard-questions">{questions.map(question=><fieldset key={question.id}><legend>{question.label}</legend>{question.options.map(option=><label className={answers[question.id]===option?'checked':''} key={option}><input type="radio" name={question.id} value={option} checked={answers[question.id]===option} onChange={()=>setAnswers(current=>({...current,[question.id]:option}))}/><span>{option}</span></label>)}</fieldset>)}</div><div className="wizard-actions"><button className="dialog-primary" disabled={!scopeComplete} onClick={()=>void continueFromScope()} type="button">Görsellere devam et</button></div></>}
    {step===1&&<><h2 id="wizard-title">Fotoğraf veya video ekleyin</h2><p>Görseller ustanın kapsamı daha doğru anlamasına yardımcı olur. Kişisel bilgi veya insan yüzü içermemesine dikkat edin.</p><label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple onChange={filesChanged}/><b>Dosya seçin veya buraya bırakın</b><span>JPG, PNG, WebP veya MP4 · Dosya başına en fazla 50 MB.</span>{files.length>0&&<strong>{files.length} dosya seçildi</strong>}</label><div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(0)} type="button">Geri</button><button className="dialog-primary" onClick={()=>setStep(2)} type="button">Konuma devam et</button></div></>}
    {step===2&&<><h2 id="wizard-title">İş nerede ve ne zaman?</h2><p>Bu aşamada yalnızca yaklaşık konum alınır. Açık adres, usta seçilmeden paylaşılmaz.</p><div className="location-grid"><label>İlçe<select value={district} onChange={event=>setDistrict(event.target.value)}><option value="">İlçe seçin</option>{districts.map(item=><option key={item}>{item}</option>)}</select></label><label>Mahalle<input value={neighborhood} onChange={event=>setNeighborhood(event.target.value)} placeholder="Mahalle adı"/></label><label>Tercih edilen zaman<select value={timing} onChange={event=>setTiming(event.target.value)}><option>Bugün / acil</option><option>Bu hafta</option><option>Önümüzdeki iki hafta</option><option>Tarih konusunda esneğim</option></select></label></div><div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(1)} type="button">Geri</button><button className="dialog-primary" disabled={!locationComplete} onClick={()=>setStep(3)} type="button">Kapsamı incele</button></div></>}
    {step===3&&<><span className="result-eyebrow">{result.eyebrow}</span><h2 id="wizard-title">{result.title}</h2><p>{result.copy}</p><div className="scope-summary"><h3>Kapsam özeti</h3><div><span>Hizmet</span><b>{service.name}</b></div>{summary.map(item=><div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}<div><span>Yaklaşık konum</span><b>{neighborhood}, {district}</b></div><div><span>Zaman</span><b>{timing}</b></div><div><span>Görsel</span><b>{files.length?`${files.length} dosya`:'Eklenmedi'}</b></div></div>{message&&<p className="account-message" role="status">{message} {message.includes('giriş')&&<a href="/giris">Giriş sayfasına git</a>}</p>}<div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(2)} type="button">Düzenle</button><button className="dialog-primary" disabled={busy} onClick={()=>void submitRequest()} type="button">{busy?'Gönderiliyor…':result.cta}</button></div></>}
  </section></div>;
}
