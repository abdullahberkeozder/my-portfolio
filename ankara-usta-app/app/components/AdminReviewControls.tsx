'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DocumentRow={id:string;kind:string;status:string;original_name:string;expires_at:string|null};
type ReferenceRow={id:string;reference_name:string;relationship:string;status:string};
type Props={tradespersonId:string;status:string;documents:DocumentRow[];references:ReferenceRow[]};

const applicationActions:Record<string,{action:string;label:string}[]>={
  submitted:[{action:'start_review',label:'İncelemeyi başlat'}],
  under_review:[{action:'approve',label:'Onayla'},{action:'needs_changes',label:'Düzeltme iste'},{action:'reject',label:'Reddet'}],
  approved:[{action:'reassess',label:'Yeniden değerlendirme'},{action:'suspend',label:'Askıya al'}],
  reassessment_required:[{action:'start_review',label:'İncelemeyi başlat'}],
  suspended:[{action:'start_review',label:'Tekrar incele'}],
};

export default function AdminReviewControls({tradespersonId,status,documents,references}:Props){
  const router=useRouter();
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');

  async function reviewApplication(action:string){
    setBusy(action);setMessage('');
    const response=await fetch(`/api/admin/tradespeople/${tradespersonId}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,note})});
    const body=await response.json() as {error?:string};setBusy('');
    if(!response.ok)return setMessage(body.error??'İşlem başarısız.');
    router.refresh();
  }

  async function reviewDocument(id:string,documentStatus:'verified'|'rejected'){
    setBusy(id);setMessage('');
    const response=await fetch(`/api/admin/documents/${id}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:documentStatus,note})});
    const body=await response.json() as {error?:string};setBusy('');
    if(!response.ok)return setMessage(body.error??'Belge işlemi başarısız.');
    router.refresh();
  }

  async function reviewReference(id:string,referenceStatus:'verified'|'rejected'){
    setBusy(id);setMessage('');
    const response=await fetch(`/api/admin/references/${id}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:referenceStatus,note})});
    const body=await response.json() as {error?:string};setBusy('');
    if(!response.ok)return setMessage(body.error??'Referans işlemi başarısız.');
    router.refresh();
  }

  const noteMissing=note.trim().length<3;

  return <div className="admin-review-controls"><label>İnceleme notu<textarea required minLength={3} rows={3} value={note} onChange={event=>setNote(event.target.value)} placeholder="Kararın kısa ve doğrulanabilir gerekçesi"/></label><div className="admin-documents"><h3>Belgeler</h3>{documents.map(document=><div key={document.id}><span><b>{document.original_name}</b><small>{document.kind} · {document.status}{document.expires_at?` · ${document.expires_at}`:''}</small></span>{document.status==='pending'&&<span><button disabled={Boolean(busy)||noteMissing} type="button" onClick={()=>void reviewDocument(document.id,'verified')}>Belgeyi doğrula</button><button disabled={Boolean(busy)||noteMissing} type="button" onClick={()=>void reviewDocument(document.id,'rejected')}>Reddet</button></span>}</div>)}</div>{references.length>0&&<div className="admin-documents"><h3>Referanslar</h3>{references.map(reference=><div key={reference.id}><span><b>{reference.reference_name}</b><small>{reference.relationship} · {reference.status}</small></span>{reference.status==='pending'&&<span><button disabled={Boolean(busy)||noteMissing} type="button" onClick={()=>void reviewReference(reference.id,'verified')}>Doğrula</button><button disabled={Boolean(busy)||noteMissing} type="button" onClick={()=>void reviewReference(reference.id,'rejected')}>Reddet</button></span>}</div>)}</div>}<div className="admin-actions">{(applicationActions[status]??[]).map(item=><button disabled={Boolean(busy)||noteMissing} type="button" key={item.action} onClick={()=>void reviewApplication(item.action)}>{busy===item.action?'Kaydediliyor…':item.label}</button>)}</div>{message&&<p className="account-message">{message}</p>}</div>;
}
