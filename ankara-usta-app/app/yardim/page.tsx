import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Yardım ve Süreç Rehberi | Orkestra',
  description: 'Orkestra platformunda talep oluşturma, usta tekliflerini değerlendirme, dijital iş günlüğü ve uyuşmazlık kayıt süreci rehberi.',
};

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="YARDIM VE SÜREÇ REHBERİ"
      title="Hizmet sürecinin her adımında şeffaf ve kayıtlı ilerleyin."
      intro="Talep oluşturma, usta tekliflerini karşılaştırma, iş günlüğü takibi ve olası aksaklıklarda kayıt oluşturma adımlarına dair rehber."
      sections={[
        {
          title: '1. Talep Oluşturma ve Hizmet Seçimi',
          body: 'İhtiyacınızı kendi cümlelerinizle arama kutusuna yazarak ya da hizmet kataloğundan seçerek başlayabilirsiniz. Sistem, Ankara ilçeniz ve probleminizin niteliğine göre uygun hizmet kategorisini ve kapsam sorularını belirler.',
          items: [
            'Teklif Karşılaştırma: Ustalar, belirttiğiniz detaylara göre işçilik ücreti, malzeme, tahmini süre ve garanti şartlarını içeren tekliflerini iletir.',
            'Keşif ve Tespit: Kapsamı yerinde incelenmesi gereken durumlar için taraflar randevu saati belirler.',
            'Şeffaf Kapsam: Her hizmette nelerin dahil, nelerin hariç olduğu açık sorularla netleştirilir; sürpriz ek masrafların önüne geçilir.',
          ],
        },
        {
          title: '2. Teklif Kabulü ve Dijital İş Günlüğü',
          body: 'Gelen teklifleri inceleyip bir ustanın teklifini kabul ettiğinizde, sistem üzerinde taraflara özel iş kaydı açılır. Açık adres ve doğrudan iletişim bilgileri yalnızca bu aşamadan sonra işin yürütülmesi amacıyla paylaşılır.',
          items: [
            'Tarihli Kayıtlar: Randevu zamanı, malzeme listesi ve yapılan müdahaleler iş sayfasına kaydedilir.',
            'Kapsam Değişikliği: İş sırasında ek onarım veya malzeme gerekirse, ustanın teklif ettiği kapsam değişikliği müşteri tarafından onaylanmadan geçerlilik kazanmaz.',
          ],
        },
        {
          title: '3. Uyuşmazlık Kaydı ve Moderasyon İncelemesi',
          body: 'İşin kararlaştırılan kapsama uymaması, taahhüt edilen sürede tamamlanmaması veya usta ile mutabakat sağlanamaması halinde iş detay ekranından "Uyuşmazlık Bildirimi" oluşturulabilir.',
          items: [
            'Karşılıklı Kanıt Sunumu: Taraflar açıklama, fotoğraf ve belgelerini uyuşmazlık dosyasına ekler.',
            'Kayıt Bütünlüğü: Platform; dijital iş günlüğü, onaylanmış kapsam maddeleri ve tarafların yazılı beyanlarını tarafsız bir inceleme zemini olarak saklar.',
            'Pilot Moderasyon Değerlendirmesi: Yetkili platform yöneticileri uyuşmazlık dosyasını inceleyerek taraflarla iletişime geçer ve sistem içi çözüm sürecini yürütür.',
          ],
        },
        {
          title: '4. Pilot Destek ve Geri Bildirim',
          body: 'Orkestra kontrollü pilot döneminde platform kullanımına ilişkin soru, öneri ve destek taleplerinizi destek@ankarausta.app adresine iletebilirsiniz. Pilot döneminde talepler sırayla incelenerek en kısa sürede dönüş sağlanır.',
        },
      ]}
    />
  );
}
