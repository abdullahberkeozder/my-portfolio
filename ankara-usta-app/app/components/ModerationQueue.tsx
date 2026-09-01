'use client';

import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {useState} from 'react';

type Item={id:string;entityType:'work_log_entry'|'review'|'dispute';title:string;description:string;meta:string;previewUrl?:string|null};
export default function ModerationQueue({items}:{items:Item[]}){const router=useRouter();const [reasons,setReasons]=useState<Record<string,string>>({});const [busy,setBusy]=useState('');const [message,setMessage]=useState('');async function decide(item:Item,action:'approve'|'reject'|'hide'|'warn'){const reason=reasons[item.id]?.trim()??'';if(reason.length<10)return setMessage('Karar gerekçesi en az 10 karakter olmalıdır.');setBusy(item.id);setMessage('');const response=await fetch('/api/admin/moderation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entityType:item.entityType,entityId:item.id,action,reason})});const result=await response.json() as {error?:string};setBusy('');if(!response.ok)return setMessage(result.error??'Karar kaydedilemedi.');router.refresh();}return <div className="moderation-list">{items.map(item=><article key={`${item.entityType}-${item.id}`}>{item.previewUrl&&<Image unoptimized width={600} height={450} src={item.previewUrl} alt="İncelenecek iş görseli"/>}<div className="moderation-copy"><span>{item.entityType.replaceAll('_',' ')}</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.meta}</small></div><div className="moderation-controls">
  <label htmlFor={`mod-reason-${item.id}`} className="field-label">
    Karar gerekçesi <span aria-hidden="true">*</span>
  </label>
  <textarea
    id={`mod-reason-${item.id}`}
    minLength={10}
    value={reasons[item.id] ?? ''}
    onChange={event => setReasons(current => ({ ...current, [item.id]: event.target.value }))}
    placeholder="Somut ve denetlenebilir karar gerekçesi"
    aria-label="Somut ve denetlenebilir karar gerekçesi"
  />
  <div>
    {item.entityType === 'dispute' ? (
      <button disabled={busy === item.id} onClick={() => void decide(item, 'warn')}>
        İncelemeye al
      </button>
    ) : (
      <>
        <button disabled={busy === item.id} onClick={() => void decide(item, 'approve')}>
          Onayla
        </button>
        <button disabled={busy === item.id} onClick={() => void decide(item, 'reject')}>
          Reddet
        </button>
      </>
    )}
  </div>
</div>
</article>)}{message&&<p className="account-message">{message}</p>}</div>}
