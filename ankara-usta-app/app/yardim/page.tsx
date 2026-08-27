import InfoPage from '../components/InfoPage';

export default function HelpPage() {
  return <InfoPage eyebrow="YARDIM MERKEZİ" title="İşin hangi aşamasında desteğe ihtiyacınız var?" intro="Talep oluşturma, teklif seçimi, devam eden iş veya uyuşmazlık süreci için izleyebileceğiniz yolları burada topladık." sections={[
    {title:'Talep ve teklif',body:'Ana sayfada sorununuzu kendi cümlelerinizle yazın. Hizmeti birlikte doğruladıktan sonra kapsam sorularını yanıtlayabilir ve uygun teklifleri karşılaştırabilirsiniz.'},
    {title:'Devam eden iş',body:'Mesajlar, kapsam değişiklikleri, randevular ve iş aşamaları İşlerim alanında kayıt altında tutulur.'},
    {title:'Şikâyet ve uyuşmazlık',body:'Tamamlanmayan veya kapsamdan ayrılan bir iş için iş sayfasından uyuşmazlık açabilirsiniz.',items:['Kanıtları yalnız ilgili taraflar ve yetkili ekip görür.','Kararlar müşteri ve ustaya ayrı, anlaşılır açıklamalarla iletilir.','İtiraz süresi dosyanın içinde gösterilir.']},
  ]}/>;
}
