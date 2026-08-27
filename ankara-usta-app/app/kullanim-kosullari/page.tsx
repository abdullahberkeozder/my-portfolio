import InfoPage from '../components/InfoPage';

export default function TermsPage() {
  return <InfoPage eyebrow="KULLANIM KOŞULLARI" title="Şeffaf kapsam, kayıtlı karar ve karşılıklı sorumluluk." intro="Platform müşteri ile ustayı buluşturur; teklif, kapsam, değişiklik ve iş kabulü kayıtlarının taraflarca doğru tutulmasını bekler." sections={[
    {title:'Müşteri sorumluluğu',body:'Talep kapsamını, adres erişimini ve iş alanındaki koşulları doğru paylaşmak; kapsam değişikliklerini kayıt üzerinden onaylamak gerekir.'},
    {title:'Usta sorumluluğu',body:'Yalnız doğrulanmış hizmet ve bölgelerde teklif verilmesi; fiyat, malzeme, süre, garanti ve hariç kapsamın açıkça belirtilmesi gerekir.'},
    {title:'Uyuşmazlık ve yaptırım',body:'Yanıltıcı belge, sahte değerlendirme, izinsiz medya veya kayıt dışı kapsam değişiklikleri inceleme ve hesap yaptırımı doğurabilir.'},
  ]}/>;
}
