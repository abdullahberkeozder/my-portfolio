import InfoPage from '../components/InfoPage';

export default function PrivacyPage() {
  return <InfoPage eyebrow="GİZLİLİK" title="Bilgileriniz işin gerektirdiği ölçüde kullanılır." intro="Ankara Usta; hesap, talep, teklif ve iş kayıtlarını hizmetin yürütülmesi, güvenlik ve uyuşmazlık incelemesi amacıyla işler." sections={[
    {title:'Hesap ve talep verileri',body:'Kimlik ve iletişim bilgileri hesabınızı yönetmek; hizmet, konum ve kapsam bilgileri doğru ustalarla eşleşmek için kullanılır.'},
    {title:'Fotoğraf, belge ve kanıtlar',body:'Özel yüklemeler varsayılan olarak kamusal değildir. Yayın izni olmayan iş medyası profil veya galeri alanında gösterilmez.'},
    {title:'Erişim sınırları',body:'Müşteri, usta ve yönetici rolleri farklı yetkilere sahiptir. Başka bir müşterinin talep ve medya kayıtlarına erişim engellenir.'},
  ]}/>;
}
