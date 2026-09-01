import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Gizlilik Politikası | Ankara Usta',
  description: 'Ankara Usta kişisel verilerin korunması, medya yayın izinleri ve veri güvenliği ilkeleri.',
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="GİZLİLİK POLİTİKASI & KVKK"
      title="Bilgileriniz ve evinizin mahremiyeti işin gerektirdiği ölçüde korunur."
      intro="Ankara Usta; hesap, talep, teklif, iş günlüğü ve uyuşmazlık kayıtlarını 6698 sayılı KVKK ve ilgili mevzuat uyarınca güvenle işler."
      sections={[
        {
          title: '1. Hesap, İletişim ve Konum Verileri',
          body: 'Ad, soyad, telefon ve e-posta bilgileriniz hesabınızı yönetmek; ilçe ve mahalle verileriniz ise doğru yerel ustalarla eşleşmenizi sağlamak için kullanılır. Açık adresiniz ve telefon numaranız, siz bir ustanın teklifini kabul edip işi başlatana kadar ustalara açık şekilde gösterilmez.',
        },
        {
          title: '2. Fotoğraf, Video ve Medya Yayın İzinleri',
          body: 'Talep ve iş günlüğü sırasında yüklediğiniz fotoğraflar varsayılan olarak gizlidir ve yalnızca işin tarafları ile yetkili operasyon ekibine açıktır. Ustanın tamamlanan iş fotoğraflarını kendi profilinde veya portföyünde sergileyebilmesi, müşterinin uygulama içerisinden vereceği "Medya Yayın İzni" onayına bağlıdır. Müşteri izni olmaksızın ev içi veya özel mülkiyet görselleri kamusal alanda paylaşılamaz.',
        },
        {
          title: '3. Kanıt Dosyaları ve Uyuşmazlık Kayıtları',
          body: 'Uyuşmazlık veya şikâyet süreçlerinde taraflarca sunulan ses kayıtları, mesaj dökümleri, faturalar ve teknik belgeler şifrelenmiş alanda saklanır. Bu veriler yalnız uyuşmazlık hakem heyeti ve platform operasyon ekibi tarafından hukuki ve operasyonel çözüm amacıyla incelenir.',
        },
        {
          title: '4. Rol Bazlı Veri İzolasyonu',
          body: 'Müşteri, usta ve yönetici hesapları kesin yetki sınırlarıyla ayrılmıştır. Hiçbir usta veya üçüncü taraf, diğer müşterilerin geçmiş taleplerine veya özel iş detaylarına erişemez.',
        },
      ]}
    />
  );
}
