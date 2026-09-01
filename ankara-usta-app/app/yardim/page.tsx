import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Yardım Merkezi & Şikâyet Çözümü | Orkestra',
  description: 'Orkestra platformu talep oluşturma, zanaatkar seçimi, uyuşmazlık çözümü ve SLA süreleri rehberi.',
};


export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="YARDIM & ÇÖZÜM MERKEZİ"
      title="İşin her adımında ihtiyaç duyduğunuz destek yanınızda."
      intro="Talep oluşturma, teklif değerlendirme, iş takibi veya uyuşmazlık yönetimi ile ilgili tüm sorularınızın yanıtlarını burada bulabilirsiniz."
      sections={[
        {
          title: '1. Talep Oluşturma ve Doğru Hizmeti Bulma',
          body: 'Ana sayfada ihtiyacınızı kendi cümlelerinizle arama kutusuna yazın. Akıllı eşleştirme motorumuz 26 uzmanlık alanından en uygun hizmet modelini (Paket, Teklif veya Keşif) önerir.',
          items: [
            'Paket Hizmet: Kapsamı ve fiyatı baştan belli standart işler (avize montajı, musluk tamiri vb.).',
            'Teklif Karşılaştırma: Özelleştirilmiş işler için ilçenizdeki ustalardan doğrudan fiyat ve süre teklifi alma.',
            'Keşif: Yerinde tespit gerektiren büyük tadilat ve boya projeleri.',
          ],
        },
        {
          title: '2. İş Takibi ve Dijital İş Günlüğü Nasıl Kullanılır?',
          body: 'Ustanın teklifini kabul ettiğinizde iş kaydınız "İşlerim" alanında açılır. Randevu saati, malzeme listesi, yapılan işlemler ve fotoğraflar burada tarihli olarak kaydedilir. Taraflar mesajlaşma üzerinden güvenle iletişim kurabilir.',
        },
        {
          title: '3. Şikâyet ve Uyuşmazlık Yönetimi (SLA Süreleri)',
          body: 'İşin vaat edilen kapsama uymaması, gecikmesi veya hasar oluşması durumunda iş sayfasından "Uyuşmazlık Bildirimi" başlatabilirsiniz.',
          items: [
            'Kanıt Yükleme: Taraflara 24 saat kanıt ve beyan süresi tanınır.',
            'Operasyon İncelemesi: Orkestra uzman heyeti dosyayı azami 48 saat içinde inceleyerek gerekçeli karar oluşturur.',
            'İtiraz Hakkı: Karara 72 saat içinde yeni kanıtla itiraz edilebilir.',
          ],
        },
        {
          title: '4. İletişim ve Acil Destek',
          body: 'Platform operasyon ekibine hafta içi 08:30 – 19:00, Cumartesi 09:00 – 17:00 saatleri arasında destek paneli veya iletisim@ankarausta.app üzerinden ulaşabilirsiniz.',
        },
      ]}
    />
  );
}
