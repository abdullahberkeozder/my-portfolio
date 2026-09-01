'use client';

import { useMemo, useState } from 'react';
import styles from './inspiration.module.css';

type Example = {
  no:string; name:string; studio:string; url:string; group:'Birleşme'|'Halka'|'Hareket'|'Sistem';
  visual:string; lesson:string; transfer:string; caution:string; relevance:number;
};

const examples:Example[] = [
  {no:'01',name:'Play@TED',studio:'Public Address',url:'https://publicaddress.studio/work/play-ted',group:'Birleşme',visual:'studs',lesson:'LEGO çıkıntısı ile TED noktasını tek ortak geometrik birime dönüştürüyor.',transfer:'Usta düğümü, halkanın hem bağlantısı hem marka karakteri olabilir.',caution:'Çocuk markası kadar renkli ve oyuncak hissinde kullanılmamalı.',relevance:5},
  {no:'02',name:'2+ Architects',studio:'Parentheses Studio',url:'https://www.parentheses.studio/work/2plus',group:'Birleşme',visual:'blocks',lesson:'Kare yapı blokları birleşerek güçlü ve ölçeklenebilir bir işaret oluşturuyor.',transfer:'Usta Geçmesi önce parçalara ayrılmalı, sonra tek keskin siluette kilitlenmeli.',caution:'Aşırı köşeli form, yerel hizmet markasını soğuk gösterebilir.',relevance:5},
  {no:'03',name:'AKI BLOK',studio:'Re-Public',url:'https://www.re-public.com/work/aki-blok/',group:'Sistem',visual:'aki',lesson:'Tek fiziksel bloktan logo, desen ve geniş yüzey sistemi üretiyor.',transfer:'Bağ Geçmesi tek işaretten arka plan örgüsüne dönüşebilmelidir.',caution:'Malzeme dokusu, dijital arayüz hiyerarşisini bastırmamalı.',relevance:5},
  {no:'04',name:'OM Mark 3D',studio:'Om Concepts',url:'https://omconcepts.net/work/om-mark-3d',group:'Hareket',visual:'assemble',lesson:'Markayı assemble → measure → focus → resolve bölümleriyle öğretir.',transfer:'Birleşme animasyonu yalnız sonucu değil, işaretin anlamını da açıklamalı.',caution:'WebGL ağırlığına gerek yok; CSS hareketi yeterli olabilir.',relevance:5},
  {no:'05',name:'Quilter',studio:'Gian Paulo Cruz',url:'https://gianpaulocruz.com/quilter/',group:'Birleşme',visual:'interlock',lesson:'İki döner form birleşerek Q işareti oluşturuyor ve desen olarak döşenebiliyor.',transfer:'İki parçalı geçme hem logo hem tekrar eden arka plan modülü olabilir.',caution:'Fazla teknik devre estetiği usta pazarını daraltabilir.',relevance:5},
  {no:'06',name:'Autodesk Tandem',studio:'Torpedo',url:'https://torpedogroup.com/case-studies/autodesk-tandem/',group:'Sistem',visual:'pixels',lesson:'Karmaşık dijital ikiz verisini büyütülmüş kübik piksellerle somutlaştırıyor.',transfer:'Her blok bir iş kanıtını taşıyabilir: fotoğraf, kapsam, malzeme, onay.',caution:'Veri küpleri ana marka işaretinin yerine geçmemeli.',relevance:4},
  {no:'07',name:'STATIX Assembly',studio:'STATIX',url:'https://statix.engineering/animations/index.html',group:'Hareket',visual:'frame',lesson:'Düğümler görünür, parçalar bağlanır ve yapı çözümlenmiş son karede durur.',transfer:'Talep → eşleşme → iş → onay ritmi tek seferlik yapım hareketiyle anlatılabilir.',caution:'Arka planda sürekli dönen mühendislik animasyonu kullanılmamalı.',relevance:5},
  {no:'08',name:'Orbit Identity',studio:'Carbn Labs',url:'https://labs.carbn.studio/',group:'Halka',visual:'orbit',lesson:'Konsantrik halkaları radyal grid ve geometrik geçişlerle sistemleştiriyor.',transfer:'Bağ Halkası farklı ölçeklerde aynı merkez ve çizgi oranlarını korumalı.',caution:'Çok sayıda halka, arama alanıyla dikkat rekabetine girebilir.',relevance:4},
  {no:'09',name:'Off Center Design',studio:'Emerald',url:'https://www.emerald.design/work/off-center-design',group:'Hareket',visual:'offset',lesson:'İsmini yapısal grid içindeki bilinçli merkez kaçıklığıyla görünür kılıyor.',transfer:'Tek bir parçanın 6–12 px kayması kontrollü asimetri yaratabilir.',caution:'Asimetri okunabilirliği veya hizalama güvenini bozmamalı.',relevance:4},
  {no:'10',name:'Zendesk Motion Study',studio:'Erin Smith Design',url:'https://www.designesmith.com/work/motion-graphics',group:'Hareket',visual:'resolve',lesson:'Basit üçgen ve daireler ayrılıp anlatı kurduktan sonra yeniden işarete dönüşüyor.',transfer:'Bağ Geçmesi parçaları yalnız girişte ayrık başlayıp son formda kalabilir.',caution:'Karakter animasyonu hizmet aramasından daha baskın olmamalı.',relevance:4},
  {no:'11',name:'New Assembly',studio:'Motion in Design',url:'https://www.motionin.design/',group:'Hareket',visual:'cluster',lesson:'Dağınık kartlar içe yaklaşarak tek, keskin ve algılanabilir nesneye kilitleniyor.',transfer:'Farklı hizmet parçaları tek eşleşme merkezinde toplanabilir.',caution:'Fare hareketine bağlı sürekli parallax bilişsel yükü artırabilir.',relevance:4},
  {no:'12',name:'Planning Ingenuity',studio:'Percept',url:'https://percept.com.au/work/digital/planning-ingenuity-2/',group:'Sistem',visual:'modgrid',lesson:'Beş hizmet sütununu renkli modüler şekiller ve kayan grid ile temsil ediyor.',transfer:'Hizmet kategorileri şekli değiştirmeden yalnız içerik katmanında ayrışmalı.',caution:'Her kategoriye ayrı marka rengi vermek Bağ Halkası’nı zayıflatabilir.',relevance:4},
  {no:'13',name:'Modus Create',studio:'OhSNAP!',url:'https://ohsnap.agency/our-work/modus-create',group:'Sistem',visual:'chain',lesson:'Strateji, kimlik ve web sitesini ölçeklenen tek bağlantılı sistem olarak ele alıyor.',transfer:'Motif yalnız hero dekoru değil, ürün boyunca kullanılacak bir sözleşme olmalı.',caution:'Sistem anlatısı somut görsel kurallara çevrilmeden soyut kalabilir.',relevance:4},
  {no:'14',name:'Kraft Heinz DXP',studio:'Júnior Morasco',url:'https://portfoliomorasco.com/case-kh-design-system',group:'Sistem',visual:'tokens',lesson:'Aynı bileşen yapısını renk, tipografi, hareket ve yarıçap tokenlarıyla ölçekliyor.',transfer:'Bağ Geçmesi için ölçü, renk, boşluk ve hareket tokenları tanımlanmalı.',caution:'Tema esnekliği çekirdek şeklin değişmesine izin vermemeli.',relevance:3},
  {no:'15',name:'LEGO Website Concept',studio:'Michael Rice',url:'https://www.behance.net/gallery/247640289/Lego-Website-Redesign',group:'Birleşme',visual:'floating',lesson:'Stud desenini, tek tuğla işaretini ve üst üste kurulan kutuları arayüze taşıyor.',transfer:'LEGO çağrışımı çıkıntı–yuva mantığında kalmalı; gerçek tuğla taklidi yapılmamalı.',caution:'Fazla kutu, pazaryerini çocuk ürünleri mağazasına dönüştürebilir.',relevance:4},
  {no:'16',name:'Casa Homes Designer',studio:'Dapth',url:'https://dapth.com/case-studies/casa-homes',group:'Sistem',visual:'config',lesson:'Altı yapı kategorisini gerçek zamanlı görsel ve fiyat değişimiyle tek konfigüratörde birleştiriyor.',transfer:'Müşteri cevapları Bağ Geçmesi’ni adım adım tamamlayabilir.',caution:'Fiyat değişimi arka plan hareketinden ayrıştırılmalı.',relevance:3},
  {no:'17',name:'CabinForge',studio:'SA Prime Ventures',url:'https://saprimeventures.com/work/cabinforge/',group:'Hareket',visual:'cabin',lesson:'Ürün kaydırma boyunca kuruluyor, yeniden yapılandırılıyor ve döşeniyor.',transfer:'İş kapsamı seçildikçe motifin eksik parçaları yerlerine oturabilir.',caution:'Scroll bağımlı kurulum, talep sihirbazında kullanıcı kontrolünü geciktirmemeli.',relevance:4},
  {no:'18',name:'H Interlink Identity',studio:'Samin',url:'https://dribbble.com/shots/27082128-H-Modular-Geometry-Interlink-Identity',group:'Birleşme',visual:'negative',lesson:'Modüler parçalar ve negatif boşluk birlikte gizli olmayan ikinci bir H şekli kuruyor.',transfer:'Usta Geçmesi’nin boşluğu, U veya bağlantı fikrini tek bakışta okutabilir.',caution:'Harf bulmacası markanın hizmet anlamından önce gelmemeli.',relevance:4},
];

const filters = ['Tümü','Birleşme','Halka','Hareket','Sistem'] as const;

function MiniVisual({type}:{type:string}){
  return <div className={`${styles.visual} ${styles[type]}`} aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i}/>)}</div>;
}

export default function InspirationPage(){
  const [filter,setFilter]=useState<(typeof filters)[number]>('Tümü');
  const shown=useMemo(()=>filter==='Tümü'?examples:examples.filter(item=>item.group===filter),[filter]);
  return <main className={styles.page}>
    <header className={styles.header}><a href="/motif-lab" className={styles.brand}><span>∞</span> Orkestra</a><div><a href="/concepts">5 ürün yönü ↗</a><a href="/motif-lab">Örgü laboratuvarı</a><b>İlham araştırması / 18 örnek</b></div></header>
    <section className={styles.hero}><span>BAĞ GEÇMESİ / ÖN ARAŞTIRMA</span><h1>Parça nasıl<br/><em>markaya dönüşür?</em></h1><p>LEGO taklidi aramıyoruz. Modüler parçaların birleşerek ayırt edici bir işaret, hareket dili ve ölçeklenebilir ürün sistemi oluşturduğu örnekleri inceliyoruz.</p></section>
    <section className={styles.shortlist}><div><span>EN GÜÇLÜ ÜÇ YÖN</span><h2>Bağ Geçmesi için<br/>başlangıç koordinatları</h2></div><ol><li><b>Play@TED</b><span>Tek birimden büyüyen sistem</span></li><li><b>OM Mark 3D</b><span>Birleşme hareketinin anlam öğretmesi</span></li><li><b>Quilter</b><span>İki parçadan işaret ve desen üretme</span></li></ol></section>
    <nav className={styles.filters} aria-label="İlham kategorileri">{filters.map(item=><button type="button" className={filter===item?styles.active:''} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</nav>
    <section className={styles.grid}>{shown.map(item=><article key={item.no}>
      <a href={item.url} target="_blank" rel="noreferrer" className={styles.preview}><MiniVisual type={item.visual}/><span>{item.no}</span><em>{item.group}</em></a>
      <div className={styles.cardHead}><div><h2>{item.name}</h2><p>{item.studio}</p></div><b>{'●'.repeat(item.relevance)}{'○'.repeat(5-item.relevance)}</b></div>
      <dl><div><dt>Neyi incelemeli?</dt><dd>{item.lesson}</dd></div><div><dt>Orkestra’ya aktarım</dt><dd>{item.transfer}</dd></div><div><dt>Dikkat</dt><dd>{item.caution}</dd></div></dl>
      <a className={styles.source} href={item.url} target="_blank" rel="noreferrer">Kaynağı aç ↗</a>
    </article>)}</section>
    <footer className={styles.footer}><b>18 örnek · 4 araştırma ekseni</b><span>Bir sonraki adım: üç görsel yön üretmek</span><a href="/motif-lab">Örgülere dön →</a></footer>
  </main>
}
