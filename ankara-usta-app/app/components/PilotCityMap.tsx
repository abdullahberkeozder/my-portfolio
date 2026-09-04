'use client';
import {useEffect,useId,useState} from 'react';
import Link from 'next/link';
import {ankaraMapLink,ankaraMapUrl} from '../lib/pilotCity';
import {ankaraDistricts} from '../data/ankaraLocations';
import styles from './pilotCity.module.css';

export default function PilotCityMap({cityState,initiallyExpanded=true}:{cityState:'ankara'|'unset'|'unsupported';initiallyExpanded?:boolean}) {
  const [visible,setVisible]=useState(initiallyExpanded);
  const [loadState,setLoadState]=useState<'loading'|'settled'|'slow'>('loading');
  const [attempt,setAttempt]=useState(0);
  const mapId=useId();
  useEffect(()=>{
    if(!visible||loadState!=='loading')return;
    const timer=setTimeout(()=>setLoadState('slow'),12000);
    return ()=>clearTimeout(timer);
  },[visible,loadState,attempt]);
  function retry(){setLoadState('loading');setAttempt(value=>value+1);}
  return <section className={styles.mapCard} aria-label="Bölge haritası">
    <div className={styles.mapHeader}>
      <div><span className={styles.eyebrow}>PİLOT BÖLGE</span><h2>Ankara’da hizmet alanınız</h2>
        <p>{cityState==='ankara'?'Hesabınıza kaydettiğiniz şehir: Ankara.':cityState==='unset'?'Henüz şehir kaydetmediniz. Şimdilik Ankara pilot bölgesi gösteriliyor.':'Kayıtlı şehriniz henüz pilot kapsamda değil. Aşağıda Ankara pilot bölgesi gösteriliyor.'}</p>
      </div>
      <Link href="/hesap#bolge">Hesap bölgemi düzenle</Link>
    </div>
    <p className={styles.notice}>Şehir görünümüdür; canlı usta konumu değildir. Açık adresiniz paylaşılmaz. Haritayı açtığınızda tarayıcınız OpenStreetMap’e bağlanır.</p>
    <div className={styles.actions}>
      <button type="button" onClick={()=>{setVisible(value=>!value);setLoadState('loading');}} aria-expanded={visible} aria-controls={mapId}>{visible?'Haritayı gizle':'Ankara haritasını göster'}</button>
      <a href={ankaraMapLink} target="_blank" rel="noopener noreferrer">Büyük haritayı aç ↗</a>
    </div>
    <div id={mapId} hidden={!visible}>
      {visible&&<>
        {loadState==='loading'&&<p role="status">Harita yükleniyor…</p>}
        {loadState==='slow'&&<p role="status">Harita bağlantısı gecikiyor. Büyük haritayı açabilir veya yeniden deneyebilirsiniz.</p>}
        <iframe key={attempt} className={styles.map} src={ankaraMapUrl} title="Ankara şehir haritası — OpenStreetMap" onLoad={()=>setLoadState('settled')} referrerPolicy="no-referrer"/>
        <div className={styles.actions}><button type="button" onClick={retry}>Haritayı yeniden yükle</button></div>
        <p className={styles.attribution}>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap katkıcıları</a> · Harita görünmüyorsa büyük harita bağlantısını kullanabilirsiniz.</p>
      </>}
    </div>
    <details><summary>Pilot hizmet ilçeleri ({ankaraDistricts.length})</summary><p>{ankaraDistricts.join(' · ')}</p></details>
  </section>;
}
