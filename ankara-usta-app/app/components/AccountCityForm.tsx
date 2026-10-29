'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './pilotCity.module.css';

export default function AccountCityForm({userId,saved}:{userId:string;saved:boolean}) {
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [failed,setFailed]=useState(false);
  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();if(busy)return;
    setBusy(true);setMessage('');setFailed(false);
    try {
      const response=await fetch('/api/account/city',{method:'POST',headers:{'Content-Type':'application/json','x-expected-user-id':userId},body:JSON.stringify({city:'Ankara'}),signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error(response.status===409?'Hesap değişti. Sayfayı yenileyin.':'Şehir kaydedilemedi. Sayfayı yenileyip kontrol edin.');
      setMessage('Şehriniz Ankara olarak kaydedildi.');router.refresh();
    } catch(error) {setFailed(true);setMessage(error instanceof Error&&error.name!=='TimeoutError'?error.message:'İşlem sonucu doğrulanamadı. Sayfayı yenileyip kayıtlı şehri kontrol edin.');}
    finally {setBusy(false);}
  }
  return <section id="bolge" className={styles.region} aria-labelledby="account-city-title">
    <h2 id="account-city-title">Hesap bölgeniz</h2>
    <p>Şehir bilginiz yerel hizmetleri göstermek için kullanılır. Açık adresiniz burada saklanmaz.</p>
    <div className={styles.cityValue}>
      <label htmlFor="account-city">Şehir</label>
      <input id="account-city" type="text" readOnly value="Ankara" className={styles.hiddenInput} />
      <strong>Ankara</strong>
    </div>
    {saved ? <p className={styles.savedState}>Kayıtlı şehir: Ankara</p> : (
      <form onSubmit={save}>
        <p>Pilot uygulamada şu anda yalnız Ankara kaydedilebilir.</p>
        <button type="submit" disabled={busy}>{busy?'Kaydediliyor…':'Şehri kaydet'}</button>
      </form>
    )}
    {message&&<p role={failed?'alert':'status'}>{message}</p>}
  </section>;
}
