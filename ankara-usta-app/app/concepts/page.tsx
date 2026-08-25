'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './concepts.module.css';

type Concept={id:string;no:string;name:string;subtitle:string;thesis:string;ux:string;motion:string;signature:string;risk:string};

const concepts:Concept[]=[
  {id:'casa',no:'01',name:'Casa Interlink',subtitle:'Evi tamamlayan geçme',thesis:'İki H-türevi yapı parçası birleşerek çatı, gövde ve kapı boşluğu olan tek ev silueti kurar.',ux:'Kullanıcı “usta bulma” yerine doğrudan tamamlanmış ev sonucunu görür.',motion:'Çatı ve gövde iki yönden gelir; merkez kilidi oturunca tamamen durur.',signature:'Negatif boşlukta U biçimli kapı + tek kare usta düğümü.',risk:'Ev ikonu kadar sıradanlaşmaması için geçme kesitleri korunmalı.'},
  {id:'telaio',no:'02',name:'Telaio 06',subtitle:'Ankara’nın iş şasisi',thesis:'Altı düğümlü teknik çerçeve, farklı hizmetleri taşıyan tek dayanıklı altyapıya dönüşür.',ux:'Talep sihirbazı ve iş takibi aynı geometrinin farklı doluluk seviyelerini kullanabilir.',motion:'Altı düğüm sabit sırayla bağlanır; son bağlantı kare düğümde kapanır.',signature:'Altı bağlantı + çapraz gerilim çizgisi + 06 oranı.',risk:'Fazla mühendislik hissi temizlik ve gündelik hizmetleri dışlamamalı.'},
  {id:'ponte',no:'03',name:'Ponte Vivo',subtitle:'Müşteri ile usta arasındaki köprü',thesis:'İki taşıyıcı parça ortadaki kilit taşıyla birleşip sağlam bir hizmet köprüsü oluşturur.',ux:'Eşleştirme ürününün değer önerisini açıklama gerektirmeden aktarır.',motion:'İki kemer yükselir; merkez kilidi yalnız eşleşme bulunduğunda yerleşir.',signature:'Ortadaki farklı kare kilit taşı ve altındaki açık geçiş.',risk:'Köprü metaforu, ev ve zanaat anlamından kopmamalı.'},
  {id:'scocca',no:'04',name:'Scocca U',subtitle:'Tek yüzeyde çözülmüş karmaşıklık',thesis:'Ayrık modüller birleştiğinde kesintisiz, heykelsi bir U kabuğu ortaya çıkar.',ux:'Hero alanında en sakin seçenek; başlık ve arama alanına en çok nefes bırakır.',motion:'Üç yüzey tek seferde birbirine akar ve son konturda sabitlenir.',signature:'U negatif alanı, uzun gerilim çizgisi ve tek mavi kesit.',risk:'Aşırı soyutlaşırsa usta ve iş fikri ilk bakışta kaybolabilir.'},
  {id:'officina',no:'05',name:'Officina Modulo',subtitle:'Parçadan çalışan ürüne',thesis:'Beş atölye modülü bir araya gelerek soyut bir iş tezgâhı ve tamamlanmış ürün oluşturur.',ux:'Kapsam soruları yanıtlandıkça yapı görünür biçimde kurulabilir.',motion:'Her cevap bir modülü yerleştirir; son müşteri onayı üst parçayı kilitler.',signature:'Beş modül, bir tezgâh çizgisi ve son onay pimi.',risk:'Talep akışında görsel ilerleme, gerçek form ilerlemesinden ayrılmamalı.'},
];

const gates=[
  ['01','Bir saniyelik siluet','Şekil açıklama olmadan diğer dört seçenekten ayrışmalı.'],
  ['02','Arama önceliği','Motif ikinci bakışta görülmeli; başlık ve arama birinci katmanda kalmalı.'],
  ['03','Ölçek dayanıklılığı','24 px ikon, 320 px kart ve 800 px hero aynı çekirdeği korumalı.'],
  ['04','Ürün anlamı','Geometri eşleşme, kapsam veya tamamlanma davranışlarından en az birini taşımalı.'],
  ['05','Tek hareket–tek sonuç','Animasyon bir kez çalışmalı ve çözümlenmiş statik formda bitmeli.'],
  ['06','Sabit renk bağı','Yeşil yapı, mavi bağlantı, koyu merkez ekranlar arasında değişmemeli.'],
  ['07','Mobil kırpılma','Sağ üstten taşsa bile ayırt edici merkez görünür kalmalı.'],
  ['08','Erişilebilir sürüm','Hareket azaltıldığında anlam kaybolmamalı.'],
  ['09','Sistem genişliği','Hero, sihirbaz, takip, garanti ve doğrulama rozetine taşınabilmeli.'],
  ['10','Gecikmeli hatırlama','Seçim beğeniyle değil, 24 saat ve 7 gün sonraki tanımayla yapılmalı.'],
];

function Shape({id,large=false}:{id:string;large?:boolean}){return <div className={`${styles.shape} ${styles[id]} ${large?styles.large:''}`} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>}

export default function ConceptsPage(){
  const [active,setActive]=useState(concepts[0]);
  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.brand}><span>∞</span> Ankara Usta</Link><nav><a href="/inspiration">18 ilham örneği</a><a href="/motif-lab">Örgü laboratuvarı</a><b>Centro Prodotto / 05</b></nav></header>
    <section className={styles.intro}><div><span>UZMAN UX/UI DEĞERLENDİRMESİ</span><h1>Önce neye<br/><em>bakmalıyız?</em></h1></div><p>İyi görünen şekil yeterli değil. Seçilecek ürün kimliği, müşterinin işini kolaylaştırmalı; markayı hatırlatmalı ve ana ürün akışının her aşamasına taşınabilmelidir.</p></section>
    <section className={styles.gates}>{gates.map(([no,title,text])=><article key={no}><span>{no}</span><div><b>{title}</b><p>{text}</p></div></article>)}</section>
    <section className={styles.manifesto}><span>ITALIAN INDUSTRIAL DESIGN LENS</span><div><b>Form + işlev</b><b>Pozitif + negatif hacim</b><b>Gerilim + sakin yüzey</b><b>İmza + tutarlılık</b></div><p>Otomobil biçimi veya Ferrari görsel kimliği kopyalanmadı. Referans, keyfî dekor yerine araştırma ve işlevden doğan heykelsi form yaklaşımıdır.</p></section>
    <section className={styles.heroPreview}>
      <Shape id={active.id} large/>
      <div className={styles.heroCopy}><span>{active.no} / {active.name.toUpperCase()}</span><h2>Güvenilir ustayı bul,<br/>evindeki işi <em>tamamla.</em></h2><div className={styles.search}>Ne konuda yardıma ihtiyacınız var?<b>→</b></div><small>{active.subtitle}</small></div>
    </section>
    <section className={styles.designs}><div className={styles.title}><span>BEŞ ÜRÜN YÖNÜ</span><h2>Aynı araştırma,<br/>beş ayrı karakter.</h2></div><div className={styles.grid}>{concepts.map(item=><button type="button" onClick={()=>setActive(item)} className={active.id===item.id?styles.selected:''} key={item.id}><div className={styles.visual}><Shape id={item.id}/><span>{item.no}</span></div><div className={styles.cardTitle}><div><h3>{item.name}</h3><p>{item.subtitle}</p></div><b>↗</b></div><dl><div><dt>Ürün tezi</dt><dd>{item.thesis}</dd></div><div><dt>UX rolü</dt><dd>{item.ux}</dd></div><div><dt>Hareket</dt><dd>{item.motion}</dd></div><div><dt>İmza</dt><dd>{item.signature}</dd></div><div><dt>Risk</dt><dd>{item.risk}</dd></div></dl></button>)}</div></section>
    <section className={styles.recommendation}><span>UZMAN ÖN SEÇİMİ</span><h2>Casa Interlink</h2><p>Ev sonucu, H Interlink geçmesi ve ürün boyunca genişleyebilecek modüler yapı aynı formda buluşuyor. İkinci prototip adayı Telaio 06; en sakin premium alternatif ise Scocca U.</p><a href="#top">Seçili tasarımı tekrar gör ↑</a></section>
    <footer className={styles.footer}><b>Ankara Usta · Ürün kimliği çalışması</b><span>5 yön / 10 UX kapısı</span><a href="/inspiration">Araştırmaya dön →</a></footer>
  </main>
}
