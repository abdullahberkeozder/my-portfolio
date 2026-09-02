'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {mergeConversationMessages,type ConversationSnapshot,type ConversationMessage} from '../domain/requestConversation';
import styles from './requestConversation.module.css';
import {createSupabaseBrowserClient} from '../lib/supabase/browser';
import type {AuthChangeEvent,Session} from '@supabase/supabase-js';

type Pending={body:string;key:string};
export default function RequestConversation({requestId,professionalId,currentUserId,initial}:{requestId:string;professionalId:string;currentUserId:string;initial:ConversationSnapshot}){
  const [messages,setMessages]=useState<ConversationMessage[]>(initial.messages);
  const [snapshot,setSnapshot]=useState(initial);
  const [body,setBody]=useState('');
  const [pending,setPending]=useState<Pending|null>(null);
  const [sending,setSending]=useState(false);
  const [sendError,setSendError]=useState('');
  const [loadError,setLoadError]=useState('');
  const [reading,setReading]=useState(false);
  const [identityChanged,setIdentityChanged]=useState(false);
  const cursor=useRef(initial.cursor);
  const loading=useRef(false);
  const sendLock=useRef(false);
  const alive=useRef(true);
  const endpoint=`/api/requests/${requestId}/conversation`;
  const refresh=useCallback(async()=>{
    if(loading.current)return;
    loading.current=true;
    try{
      // Bound each catch-up; later polls continue after long disconnections.
      for(let batch=0;batch<10&&alive.current;batch++){
        const response=await fetch(`${endpoint}?professionalId=${professionalId}&after=${cursor.current}&expectedUserId=${currentUserId}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
        const data=await response.json() as ConversationSnapshot&{error?:string};
        if([401,403,409].includes(response.status)){alive.current=false;setIdentityChanged(true);return;}
        if(!response.ok)throw new Error(data.error??'Görüşme güncellenemedi.');
        if(!alive.current)return;
        const next=data as ConversationSnapshot;
        setMessages(current=>mergeConversationMessages(current,next.messages));
        cursor.current=next.cursor;setSnapshot(next);setLoadError('');
        if(!next.hasMore)break;
      }
    }catch(error){if(alive.current)setLoadError(error instanceof Error?error.message:'Bağlantı kesildi. Yeniden deneyin.');}
    finally{loading.current=false;}
  },[endpoint,professionalId,currentUserId]);
  useEffect(()=>{
    alive.current=true;
    const start=window.setTimeout(()=>void refresh(),0);
    const interval=window.setInterval(()=>void refresh(),5000);
    const reconnect=()=>void refresh();window.addEventListener('online',reconnect);
    return()=>{alive.current=false;window.clearTimeout(start);window.clearInterval(interval);window.removeEventListener('online',reconnect);};
  },[refresh]);
  useEffect(()=>{
    const {data:{subscription}}=createSupabaseBrowserClient().auth.onAuthStateChange((_event:AuthChangeEvent,session:Session|null)=>{
      if((session?.user.id??null)!==currentUserId){alive.current=false;setIdentityChanged(true);}
    });
    return()=>subscription.unsubscribe();
  },[currentUserId]);
  async function send(){
    if(sendLock.current)return;
    const outgoing=pending??{body:body.trim(),key:crypto.randomUUID()};
    if(!outgoing.body)return;
    sendLock.current=true;setPending(outgoing);setSending(true);setSendError('');
    try{
      const response=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send',professionalId,expectedUserId:currentUserId,...outgoing})});
      const data=await response.json() as ConversationSnapshot&{error?:string};
      if([401,403,409].includes(response.status)){alive.current=false;setIdentityChanged(true);return;}
      if(!response.ok||!data.acknowledgedId)throw new Error(data.error??'Gönderim doğrulanamadı. Aynı mesajı yeniden deneyin.');
      if(!alive.current)return;
      setPending(null);setBody('');await refresh();
    }catch(error){if(alive.current)setSendError(error instanceof Error?error.message:'Gönderilemedi. Yeniden deneyin.');}
    finally{sendLock.current=false;if(alive.current)setSending(false);}
  }
  async function markRead(){
    setReading(true);
    try{
      const response=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'read',professionalId,expectedUserId:currentUserId,sequence:cursor.current})});
      const data=await response.json() as ConversationSnapshot&{error?:string};
      if([401,403,409].includes(response.status)){alive.current=false;setIdentityChanged(true);return;}
      if(!response.ok)throw new Error(data.error??'Okunma bilgisi kaydedilemedi.');
      if(alive.current)setSnapshot(current=>({...current,unreadCount:data.unreadCount}));
    }catch(error){if(alive.current)setLoadError(error instanceof Error?error.message:'Okunma bilgisi kaydedilemedi.');}
    finally{if(alive.current)setReading(false);}
  }
  if(identityChanged)return <section className={styles.room}><p role="alert">Oturum veya görüşme erişimi değişti. Gizliliğiniz için görüşme kapatıldı.</p><Link href="/giris">Hesabınızı doğrulayın</Link></section>;
  return <section className={styles.room} aria-label="Talebe bağlı özel görüşme">
    <header><h1>İş öncesi görüşme</h1><p>Bu görüşmeyi yalnız siz ve karşı taraf görebilir. Mesajlar teklif kabulü veya randevu onayı yerine geçmez.</p></header>
    <div className={styles.toolbar}><span role="status">{snapshot.unreadCount?`${snapshot.unreadCount} okunmamış mesaj`:'Okunmamış mesaj yok'}</span>
      <button type="button" onClick={()=>void refresh()}>Yenile</button>
      {snapshot.unreadCount>0&&<button type="button" disabled={reading||snapshot.hasMore} onClick={()=>void markRead()}>{reading?'Kaydediliyor…':'Okundu olarak işaretle'}</button>}
    </div>
    <p className={styles.hint}>Görüşme 5 saniyede bir güncellenir. Yeni mesajlar aşağıya eklenir.</p>
    {loadError&&<p role="alert">{loadError} Mevcut mesajlar korunuyor.</p>}
    <ol className={styles.messages} tabIndex={0} aria-label="Mesaj geçmişi">
      {messages.map(message=><li key={message.id} data-own={message.sender_id===currentUserId}>
        <b>{message.sender_id===currentUserId?'Siz':'Karşı taraf'}</b><p>{message.body}</p>
        <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('tr-TR')}</time>
      </li>)}
    </ol>
    {!messages.length&&<p>Henüz mesaj yok. İşin kapsamıyla ilgili bir soru sorarak başlayabilirsiniz.</p>}
    {snapshot.hasMore&&<p role="status">Eksik geçmiş yükleniyor…</p>}
    {snapshot.jobId&&<Link className={styles.job} href={`/islerim/${snapshot.jobId}`}>Teklif kabul edildi · İş ekranına geç →</Link>}
    {!snapshot.canSend&&<p>Bu görüşme artık yalnız okunabilir. Geçmişiniz diğer ustalarla paylaşılmaz.</p>}
    {(snapshot.canSend||pending)&&<form onSubmit={event=>{event.preventDefault();void send();}}>
      <label htmlFor="request-message">Mesajınız</label>
      <textarea id="request-message" maxLength={4000} rows={4} value={body} onChange={event=>setBody(event.target.value)} disabled={!!pending} aria-describedby="message-help" required/>
      <small id="message-help">En fazla 4.000 karakter. Şifre, ödeme bilgisi veya açık adres paylaşmayın.</small>
      {sendError&&<p role="alert">Gönderilemedi: {sendError} Yeniden deneme aynı mesajı kullanır; bu sayfayı kapatmayın.</p>}
      <button type="submit" disabled={sending||(!pending&&!body.trim())}>{sending?'Gönderiliyor…':pending?'Yeniden dene':'Mesaj gönder'}</button>
      <span role="status">{sending?'Mesajın sunucu onayı bekleniyor.':''}</span>
    </form>}
  </section>;
}
