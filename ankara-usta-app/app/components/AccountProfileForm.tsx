'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {announceAccountChange,useAccountSummary} from '../hooks/useAccountSummary';
import styles from './accountProfile.module.css';
import {z} from 'zod';
export default function AccountProfileForm({userId,initialName}:{userId:string;initialName:string}) {
  const router=useRouter();const account=useAccountSummary();
  const [name,setName]=useState(initialName);const [saved,setSaved]=useState(initialName);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState(false);
  const dirty=name!==saved;
  useEffect(()=>{
    if(!dirty)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();};
    const navigate=(event:MouseEvent)=>{
      const link=event.target instanceof Element?event.target.closest('a'):null;
      if(!link||link.target==='_blank'||link.hasAttribute('download')||event.ctrlKey||event.metaKey||event.shiftKey)return;
      const url=new URL(link.href,window.location.href);
      if(url.pathname===window.location.pathname&&url.search===window.location.search)return;
      if(!window.confirm('Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istiyor musunuz?')){event.preventDefault();event.stopPropagation();}
    };
    window.addEventListener('beforeunload',warn);document.addEventListener('click',navigate,true);
    return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',navigate,true);};
  },[dirty]);
  async function submit(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setMessage('');setError(false);
    try {
      const response=await fetch('/api/account/profile',{method:'POST',headers:{'Content-Type':'application/json','x-expected-user-id':userId},body:JSON.stringify({displayName:name}),signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error(response.status===409?'Hesap değişti. Sayfayı yenileyin.':'Ad kaydedilemedi. Bilgileriniz formda korunuyor.');
      const data=z.object({displayName:z.string()}).parse(await response.json());setName(data.displayName);setSaved(data.displayName);setMessage('Görünen adınız kaydedildi.');announceAccountChange();router.refresh();
    } catch(error) {setError(true);setMessage(error instanceof Error&&error.name!=='TimeoutError'?error.message:'Sonuç doğrulanamadı. Kaydı yeniden denemeden önce sayfayı yenileyip kontrol edin.');}
    finally {setBusy(false);}
  }
  if(account.status==='ready'&&account.user?.id!==userId)return <p role="alert">Hesap değişti. Bilgilerinizi görmek için sayfayı yenileyin.</p>;
  return <section id="profil" className={styles.section} aria-labelledby="profile-title">
    <h2 id="profile-title">Kişisel bilgiler</h2><p>Görünen adınız hesap menüsünde kullanılır. Usta kimlik ve belge bilgilerinizi değiştirmez.</p>
    <form onSubmit={submit}>
      <label htmlFor="profile-name">Görünen ad</label>
      <input id="profile-name" value={name} autoComplete="name" minLength={2} maxLength={120} required disabled={busy||account.status!=='ready'} onChange={event=>{setName(event.target.value);setMessage('');}} aria-describedby="profile-help"/>
      <p id="profile-help">2–120 karakter. {dirty?'Kaydedilmemiş değişiklikleriniz var.':''}</p>
      <div className={styles.actions}><button type="submit" disabled={busy||!dirty||account.status!=='ready'}>{busy?'Kaydediliyor…':'Değişiklikleri kaydet'}</button><button type="button" disabled={busy||!dirty} onClick={()=>{setName(saved);setMessage('');}}>Vazgeç</button></div>
      {account.status==='error'&&<p role="alert">Oturum kontrol edilemedi. Sayfayı yenileyin; değişiklik henüz kaydedilmedi.</p>}
      {message&&<p role={error?'alert':'status'}>{message}</p>}
    </form>
  </section>;
}
