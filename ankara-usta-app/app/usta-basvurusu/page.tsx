'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { serviceCategories, services } from '../data/serviceTaxonomy';
import { ankaraDistricts } from '../domain/tradespersonApplication';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

const documentKinds={professional_certificate:'Mesleki belge',identity:'Kimlik belgesi',address:'Adres belgesi',reference_evidence:'Referans iş kanıtı'} as const;

export default function TradespersonApplicationPage(){
  const [displayName,setDisplayName]=useState('');
  const [bio,setBio]=useState('');
  const [serviceIds,setServiceIds]=useState<string[]>([]);
  const [districts,setDistricts]=useState<string[]>([]);
  const [referenceName,setReferenceName]=useState('');
  const [relationship,setRelationship]=useState('');
  const [referencePhone,setReferencePhone]=useState('');
  const [documentKind,setDocumentKind]=useState<keyof typeof documentKinds>('professional_certificate');
  const [expiresAt,setExpiresAt]=useState('');
  const [file,setFile]=useState<File>();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  function toggle(value:string,current:string[],setter:(value:string[])=>void){setter(current.includes(value)?current.filter(item=>item!==value):[...current,value])}

  async function uploadDocument(){
    if(!file)return;
    const supabase=createSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)throw new Error('Belge yüklemek için giriş yapın.');
    const extension=file.name.split('.').pop()?.toLowerCase()||'bin';
    const storagePath=`${user.id}/${documentKind}/${crypto.randomUUID()}.${extension}`;
    const {error}=await supabase.storage.from('tradesperson-verification').upload(storagePath,file,{contentType:file.type,upsert:false});
    if(error)throw error;
    const response=await fetch('/api/tradespeople/documents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:documentKind,storagePath,originalName:file.name,contentType:file.type,byteSize:file.size,expiresAt:expiresAt||undefined})});
    const body=await response.json() as {error?:string};
    if(!response.ok)throw new Error(body.error??'Belge kaydedilemedi.');
  }

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setMessage('');
    try{
      const reference=referenceName&&relationship?{name:referenceName,relationship,phone:referencePhone||undefined}:undefined;
      const response=await fetch('/api/tradespeople/application',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName,bio,serviceIds,districts,reference})});
      const body=await response.json() as {error?:string};
      if(response.status===401){setMessage('Başvuru için önce müşteri hesabınızla giriş yapın.');return}
      if(!response.ok)throw new Error(body.error??'Başvuru gönderilemedi.');
      await uploadDocument();
      setMessage('Başvurunuz inceleme kuyruğuna alındı. Belge doğrulanmadan doğrulama rozeti gösterilmez.');
    }catch(error){setMessage(error instanceof Error?error.message:'Başvuru gönderilemedi.')}finally{setBusy(false)}
  }

  return <main className="account-shell tradesperson-application"><Link className="account-back" href="/">← Ankara Usta</Link><form className="application-card" onSubmit={submit}><span>USTA BAŞVURUSU</span><h1>Uzmanlığınızı ve çalışma alanınızı tanımlayın</h1><p>Profiliniz yönetici incelemesinden ve belge doğrulamasından sonra teklif vermeye açılır.</p><div className="application-fields"><label>Görünen ad / işletme adı<input required minLength={2} value={displayName} onChange={event=>setDisplayName(event.target.value)}/></label><label>Deneyim ve uzmanlık<textarea required minLength={20} rows={5} value={bio} onChange={event=>setBio(event.target.value)} placeholder="Deneyiminizi, çalışma biçiminizi ve uzman olduğunuz işleri anlatın."/></label></div><fieldset><legend>Vereceğiniz hizmetler</legend>{serviceCategories.map(category=><section key={category.id}><h2>{category.name}</h2><div className="choice-grid">{services.filter(service=>service.categoryId===category.id).map(service=><label className={serviceIds.includes(service.id)?'checked':''} key={service.id}><input type="checkbox" checked={serviceIds.includes(service.id)} onChange={()=>toggle(service.id,serviceIds,setServiceIds)}/>{service.name}</label>)}</div></section>)}</fieldset><fieldset><legend>Çalışma bölgeleri</legend><div className="choice-grid districts">{ankaraDistricts.map(district=><label className={districts.includes(district)?'checked':''} key={district}><input type="checkbox" checked={districts.includes(district)} onChange={()=>toggle(district,districts,setDistricts)}/>{district}</label>)}</div></fieldset><fieldset><legend>Belge</legend><div className="application-fields columns"><label>Belge türü<select value={documentKind} onChange={event=>setDocumentKind(event.target.value as keyof typeof documentKinds)}>{Object.entries(documentKinds).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Son kullanma tarihi<input type="date" value={expiresAt} onChange={event=>setExpiresAt(event.target.value)}/></label><label>PDF veya görsel<input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={event=>setFile(event.target.files?.[0])}/></label></div></fieldset><fieldset><legend>Referans (isteğe bağlı)</legend><div className="application-fields columns"><label>Referans adı<input value={referenceName} onChange={event=>setReferenceName(event.target.value)}/></label><label>İlişki / proje<input value={relationship} onChange={event=>setRelationship(event.target.value)}/></label><label>Telefon<input value={referencePhone} onChange={event=>setReferencePhone(event.target.value)}/></label></div></fieldset>{message&&<p className="account-message" role="status">{message} {message.includes('giriş')&&<Link href="/giris">Giriş yap</Link>}</p>}<button className="dialog-primary" disabled={busy||!serviceIds.length||!districts.length||!file} type="submit">{busy?'Gönderiliyor…':'Başvuruyu gönder'}</button></form></main>;
}

