'use client';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {useRef,useState} from 'react';

type Item={id:string;entityType:'work_log_entry'|'review'|'dispute';title:string;description:string;meta:string;previewUrl?:string|null};
export default function ModerationQueue({items}:{items:Item[]}) {
  const router=useRouter();
  const [reasons,setReasons]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState('');
  const pending=useRef(false);
  const [feedback,setFeedback]=useState<{id:string;message:string;error:boolean}|null>(null);
  async function decide(item:Item,action:'approve'|'reject'|'warn') {
    if(pending.current)return;
    const key=`${item.entityType}-${item.id}`;
    const reason=reasons[key]?.trim()??'';
    if(reason.length<10){setFeedback({id:key,error:true,message:'Kararın nedenini en az 10 karakterle açıklayın.'});document.getElementById(`mod-reason-${key}`)?.focus();return;}
    pending.current=true;setBusy(key);setFeedback(null);
    try {
      const response=await fetch('/api/admin/moderation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entityType:item.entityType,entityId:item.id,action,reason})});
      const result=await response.json() as {error?:string};
      if(!response.ok){setFeedback({id:key,error:true,message:result.error??'Karar kaydedilemedi. Gerekçeniz korunuyor.'});return;}
      setFeedback({id:key,error:false,message:'Karar kaydedildi. Kuyruk güncelleniyor.'});
      router.refresh();
    }catch{setFeedback({id:key,error:true,message:'Yanıt alınamadı. Gerekçeniz korunuyor; yeniden karar vermeden önce kuyruğu yenileyip kontrol edin.'});}
    finally{pending.current=false;setBusy('');}
  }
  return <div className="moderation-list">{items.map(item=>{
    const key=`${item.entityType}-${item.id}`;
    const notice=feedback?.id===key?feedback:null;
    return <article key={key}>
      {item.previewUrl&&<Image unoptimized width={600} height={450} src={item.previewUrl} alt="İncelenecek iş görseli"/>}
      <div className="moderation-copy"><span>{item.entityType==='review'?'Değerlendirme':item.entityType==='dispute'?'Uyuşmazlık':'İş günlüğü'}</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.meta}</small></div>
      <div className="moderation-controls">
        <label htmlFor={`mod-reason-${key}`}>Karar gerekçesi (zorunlu)</label>
        <p id={`mod-hint-${key}`}>En az 10 karakter. İncelemeyi ve kararınızın nedenini açıkça belirtin.</p>
        <textarea id={`mod-reason-${key}`} minLength={10} maxLength={2000} required disabled={Boolean(busy)} value={reasons[key]??''}
          aria-describedby={`mod-hint-${key}`} aria-invalid={notice?.error||undefined}
          onChange={event=>setReasons(current=>({...current,[key]:event.target.value}))}/>
        <div>{item.entityType==='dispute'?<button className="dialog-primary" type="button" disabled={Boolean(busy)} onClick={()=>void decide(item,'warn')}>İncelemeye al</button>:<>
          <button className="dialog-primary" type="button" disabled={Boolean(busy)} onClick={()=>void decide(item,'approve')}>{busy===key?'Kaydediliyor…':'Onayla'}</button>
          <button className="wizard-secondary" type="button" disabled={Boolean(busy)} onClick={()=>void decide(item,'reject')}>Reddet</button>
        </>}</div>
        {notice&&<p role={notice.error?'alert':'status'}>{notice.message}</p>}
      </div>
    </article>;
  })}</div>;
}
