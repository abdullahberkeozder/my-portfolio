'use client';

import {useState} from 'react';
import {ankaraDistrictsGeo} from '../../data/ankaraMapGeo';
import styles from '../requestWizard.module.css';

/** District context only. Seed shop pins and illustrative district counts are never used. */
export default function WizardRegionPreview({district, serviceId, targetProfessionalName}: {
  district: string; serviceId: string; targetProfessionalName?: string;
}) {
  const [visible, setVisible] = useState(false);
  const area = ankaraDistrictsGeo.find(item => item.name === district);
  if (!area) return null;
  const [lat, lon] = area.latLngCenter;
  const bbox = `${lon - .07},${lat - .045},${lon + .07},${lat + .045}`;
  const directory = `/ustalar?${new URLSearchParams({service: serviceId, district})}`;
  return <aside className={styles.region} aria-label="Seçilen hizmet bölgesi">
    <h3>Bölge önizlemesi</h3>
    <p>{district}, Ankara</p>
    {visible ? <>
      <iframe key={district} title={`${district} bölge haritası`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`}
        referrerPolicy="no-referrer" className={styles.map}/>
      <button type="button" onClick={() => setVisible(false)}>Haritayı gizle</button>
      <a href={`https://www.openstreetmap.org/#map=12/${lat}/${lon}`} target="_blank" rel="noopener noreferrer">Harita açılmadı mı? Ayrı sekmede aç</a>
    </> : <button type="button" onClick={() => setVisible(true)}>Bölgeyi haritada göster</button>}
    <small>Haritayı açmak isteğe bağlıdır ve OpenStreetMap’e bağlanır.</small>
    <details className={styles.privacyDetails}>
    <summary><span aria-hidden="true">••• </span>Diğer seçenekler</summary>
    {targetProfessionalName
      ? <p>Yalnız {targetProfessionalName} için hazırlanıyor. Harita talebin görünürlüğünü değiştirmez.</p>
      : <a href={directory} target="_blank" rel="noopener noreferrer">Bölgede bu hizmeti veren ustaları incele ↗</a>}
    <p>Yalnız ilçe çevresini gösterir; açık adres, canlı usta konumu veya kesin hizmet sınırı değildir. Doğrulanmış konum verisi olmadığı için usta işaretçisi gösterilmez.</p></details>
  </aside>;
}
