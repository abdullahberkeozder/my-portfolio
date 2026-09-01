'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './motif-lab.module.css';

type Motif = {
  id: string;
  no: string;
  name: string;
  memory: string;
  product: string;
  mechanism: string;
};

const motifs: Motif[] = [
  { id: 'fixpoint', no: '01', name: 'Ankara Sabit Noktası', memory: 'Altı çevre düğümü, tek merkez, açık halka.', product: 'Ankara içindeki usta–müşteri eşleşmesi', mechanism: 'Tekrar + ayırt edici siluet' },
  { id: 'repairpath', no: '02', name: 'Kırıktan Tamama', memory: 'Kesintili iz köprüde birleşip onay işaretine dönüşür.', product: 'Sorundan tamamlanan işe giden yol', mechanism: 'Tamamlama gerilimi + görsel kapanış' },
  { id: 'neighborhood', no: '03', name: 'Mahalle Ağı', memory: 'Yakın halkalar ortak bir güven alanında kesişir.', product: 'Mahalle temelli doğrulanmış iş ve referans', mechanism: 'Yakınlık + kümelenme' },
  { id: 'proofstitch', no: '04', name: 'Kanıt Dikişi', memory: 'Önce ve sonra yüzeyleri kayıt çizgisi birleştirir.', product: 'İş günlüğü, fotoğraf ve müşteri kabulü', mechanism: 'Devamlılık + seri konum etkisi' },
  { id: 'offerorbit', no: '05', name: 'Teklif Yörüngesi', memory: 'Üç seçenek aynı şeffaf karar merkezine yaklaşır.', product: 'Teklif karşılaştırma ve kullanıcı seçimi', mechanism: 'Seçenek ayrıştırma + odak' },
  { id: 'scopeframe', no: '06', name: 'Kapsam Çerçevesi', memory: 'Dört açık köşe işi sıkıştırmadan sınırlar.', product: 'Dahil, hariç, süre ve malzeme kapsamı', mechanism: 'Çerçeveleme + açık sınır' },
  { id: 'craftjoint', no: '07', name: 'Bağ Geçmesi / Modüler Halka', memory: 'İki yapım parçası birbirine geçerek tek ve tekrar edilebilir Orkestra halkasını kurar.', product: 'Müşteri ihtiyacı + usta becerisi → eşleşme köprüsü → doğrulanmış iş', mechanism: 'Şekil belleği + mevcut hedefle uyum + kontrollü izolasyon' },
  { id: 'trustbeacon', no: '08', name: 'Güven Feneri', memory: 'Doğrulama karesi çevreye ölçülü sinyal yayar.', product: 'Belge, referans, adres ve iş doğrulaması', mechanism: 'Merkez–çevre hiyerarşisi' },
  { id: 'workrhythm', no: '09', name: 'İş Ritmi', memory: 'Tekrarlanan aşamalar dolu bir son işaretinde durur.', product: 'Talep, teklif, keşif, iş ve garanti adımları', mechanism: 'Ritim + görünür durma işareti' },
  { id: 'signature06', no: '10', name: '06 Koordinatı', memory: 'Ankara kodu, rota çizgisi ve usta düğümü birleşir.', product: 'Yerel Ankara kimliği ve hizmet bölgesi', mechanism: 'Anlamsal kodlama + yer belleği' },
];

const research = [
  ['Vicary sinema iddiası', 'Tekrarlanamadı; ürün kararının temeli yapılmadı.'],
  ['Lipton Ice priming', 'Yalnız mevcut ihtiyaçla uyumlu etki: motifler kullanıcının “işi çözme” hedefini yankılıyor.'],
  ['Görsel priming', 'Araç resmi saklamak yerine açık “kırık → eşleşme → tamam” geometrisi kullanıldı.'],
  ['Kıtlık ve geri sayım', 'Dikkat üretir ama güveni bozar; motiflerde zaman baskısı yok.'],
  ['Görsel asimetri', 'Kontrollü açık halka ve tek farklı düğüm, bakışı arama alanına taşır.'],
  ['Değişken ödül', 'Kompulsif döngü yerine tutarlı mikro-varyasyon; sonuç her zaman öngörülebilir.'],
  ['Sosyal kanıt', 'Anonim kalabalık noktaları değil, yalnız doğrulanmış iş düğümleri.'],
  ['Kayıp korkusu', 'Olumsuz tehdit yerine tamamlanmamış işi kapatma hissi.'],
  ['Varsayılan seçim', 'Öneri gösterilebilir; seçim geometrisi dengeli ve geri alınabilir.'],
  ['Çıkış sürtünmesi', 'Motifler kullanıcıyı kuşatmıyor; açık yaylar çıkış ve hareket alanı bırakıyor.'],
  ['Sonsuz kaydırma', 'İş Ritmi motifinde özellikle belirgin bir son düğümü var.'],
  ['Bildirim ve onay', 'Sürekli uyarı yerine yalnız durum değiştiğinde sakin doğrulama sinyali.'],
];

function MotifShape({ id, large = false }: { id: string; large?: boolean }) {
  return <div className={`${styles.motif} ${styles[id]} ${large ? styles.large : ''}`} aria-hidden="true">
    {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
    {id === 'signature06' && <b>06</b>}
  </div>;
}

export default function MotifLab() {
  const [active, setActive] = useState(motifs[6]);

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><span>∞</span> Orkestra</Link>
      <div><a href="/inspiration">18 ilham örneği ↗</a><span>GÖRSEL SİSTEM / 02</span><b>Arka plan örgü laboratuvarı</b></div>
    </header>

    <section className={styles.intro}>
      <div>
        <span className={styles.eyebrow}>ARAŞTIRMADAN ÜRÜNE</span>
        <h1>Rastgele şekil değil,<br/><em>hatırlanan bir iş izi.</em></h1>
      </div>
      <p>Her örgü aynı marka cümlesini taşır: <b>sorun görünür olur, doğru usta ile bağ kurulur, iş kanıtla tamamlanır.</b> Yeşil ana kimlik, beyaz nefes alanı ve güven mavisi korunur.</p>
    </section>

    <section className={styles.preview}>
      <MotifShape id={active.id} large />
      <div className={styles.previewCopy}>
        <span>{active.no} / CANLI UYGULAMA</span>
        <h2>Güvenilir ustayı bul,<br/>işi <em>kanıtıyla</em> tamamla.</h2>
        <div className={styles.search}><span>Ne konuda yardıma ihtiyacınız var?</span><b>→</b></div>
        <small>Seçili örgü: {active.name}</small>
      </div>
    </section>

    {active.id === 'craftjoint' && <section className={styles.jointLogic}>
      <article><span>01</span><div><b>Tek ayırt edici şekil</b><p>İki modüler halka birleşince başka dekorlara ihtiyaç duymayan tek bir marka silueti oluşur.</p></div></article>
      <article><span>02</span><div><b>İhtiyaçla uyumlu priming</b><p>Parçaların kurulması, zaten çözüm arayan kişide “doğru parçayı bul ve işi tamamla” hedefini çağrıştırır.</p></div></article>
      <article><span>03</span><div><b>Bağ Halkası anlamı</b><p>Yeşil müşteri ihtiyacını, mavi usta becerisini, merkez köprüsü eşleşmeyi temsil eder.</p></div></article>
      <article><span>04</span><div><b>Kontrollü izolasyon</b><p>Altı yuvarlak bağlantı içinde yalnız bir kare düğüm bulunur: doğrulanmış usta için sabit hafıza çapası.</p></div></article>
      <article><span>05</span><div><b>Bir kez gerçekleşen hareket</b><p>İki parça ilk görünüşte birbirine geçer ve durur; hareketin kendisi birleşme anlamını öğretir.</p></div></article>
      <article><span>06</span><div><b>Tutarlı tekrar</b><p>Aynı çekirdek şekil hero, sihirbaz, iş takibi ve garanti ekranında ölçek değiştirerek kullanılabilir.</p></div></article>
    </section>}

    <section className={styles.catalogue}>
      <div className={styles.sectionTitle}><span>10 ÖZGÜN ÖRGÜ</span><h2>Ürünün farklı yüzleri,<br/>tek bir hafıza sistemi.</h2></div>
      <div className={styles.grid}>
        {motifs.map(motif => <button type="button" key={motif.id} onClick={() => setActive(motif)} className={active.id === motif.id ? styles.selected : ''}>
          <div className={styles.tile}><MotifShape id={motif.id}/><span>{motif.no}</span></div>
          <h3>{motif.name}</h3>
          <p>{motif.memory}</p>
          <dl><div><dt>Ürün anlamı</dt><dd>{motif.product}</dd></div><div><dt>Algı ilkesi</dt><dd>{motif.mechanism}</dd></div></dl>
        </button>)}
      </div>
    </section>

    <section className={styles.research}>
      <div className={styles.sectionTitle}><span>12 BULGU / 12 KARAR</span><h2>Deney başlığından<br/>tasarım kararına.</h2></div>
      <div className={styles.researchGrid}>{research.map(([name, decision], index) => <article key={name}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{decision}</p></div></article>)}</div>
    </section>

    <footer className={styles.footer}><b>ORKESTRA</b><span>Örgü sistemi · V3</span><a href="#top">Yukarı dön ↑</a></footer>
  </main>;
}
