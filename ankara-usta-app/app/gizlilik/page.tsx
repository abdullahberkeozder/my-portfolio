import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | Orkestra',
  description: 'Orkestra kişisel verilerin korunması, 6698 sayılı KVKK hakları, açık adres gizliliği ve veri güvenliği ilkeleri.',
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ"
      title="Kişisel verileriniz ve evinizin mahremiyeti kanun güvencesiyle korunur."
      intro="Orkestra platformu (Pilot Uygulama), 6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') uyarınca veri sorumlusu sıfatıyla kişisel verilerinizi şeffaflık, amaçla sınırlılık ve yüksek güvenlik ilkeleriyle işler."
      sections={[
        {
          title: '1. Veri Sorumlusu ve Kapsam',
          body: 'Bu aydınlatma metni, Orkestra platformunu ziyaret eden, hizmet talebi oluşturan müşteriler ve zanaatkar başvurusunda bulunan meslek profesyonellerinin kişisel verilerinin işlenmesine ilişkin usul ve esasları açıklar.',
        },
        {
          title: '2. İşlenen Kişisel Veri Kategorileri',
          body: 'Platform üzerinden toplanan kişisel veriler şunlardır:',
          items: [
            'Kimlik ve İletişim Verileri: Ad, soyad, telefon numarası, e-posta adresi.',
            'Konum ve Adres Verileri: Hizmet eşleşmesi için ilçe ve mahalle bilgisi; teklif kabulünden sonra işin ifası için tam açık adres.',
            'Talep ve İş Kayıtları: Problem tanımı, kapsam yanıtları, randevu tarihleri, iş fotoğrafları, teklif dökümleri ve mesajlaşma kayıtları.',
            'Mesleki Bilgiler (Ustalar için): Mesleki yeterlilik belgeleri, ustalık/kalfalık belgesi, çalışma bölgeleri ve referans bilgileri.',
            'İşlem Güvenliği Verileri: IP adresi, oturum belirteçleri ve sistem denetim kayıtları.',
          ],
        },
        {
          title: '3. Veri İşleme Amaçları ve Hukuki Sebepleri',
          body: 'Kişisel verileriniz KVKK Madde 5 ve 6 hükümleri uyarınca şu hukuki sebeplerle işlenir: Sözleşmenin kurulması ve ifası (talebin ustalara iletilmesi, teklif karşılaştırma, iş günlüğü), veri sorumlusunun meşru menfaati (sahte arzın ve dolandırıcılığın önlenmesi, platform denetimi) ve kanuni yükümlülüklerin yerine getirilmesi.',
        },
        {
          title: '4. Açık Adres Gizliliği ve Veri Aktarımı İlkeleri',
          body: 'Evinizin mahremiyeti temel önceliğimizdir. Bu doğrultuda şu katı aktarım kuralları uygulanır:',
          items: [
            'Adres Gizliliği: İlçe ve mahalle verisi ustalarla eşleşmede kullanılır; tam açık adresiniz ve telefon numaranız, siz bir ustanın teklifini sistem üzerinden kabul edene kadar ustalara kesinlikle gösterilmez.',
            'Medya Yayın İzni: Yüklediğiniz iş fotoğrafları varsayılan olarak gizlidir. Ustanın tamamlanan iş görselini profilinde yayınlayabilmesi, müşterinin açık "Medya Yayın İzni" vermesine bağlıdır.',
            'Üçüncü Taraflarla Paylaşım: Verileriniz ticari veya reklam amaçlı üçüncü taraflara satılmaz; yalnızca işin ifası için yetkili taraflarla ve mevzuat gerektirdiğinde adli mercilerle paylaşılır.',
          ],
        },
        {
          title: '5. Veri Güvenliği ve Satır Bazlı Yetki İzolasyonu',
          body: 'Veritabanı düzeyinde Row-Level Security (RLS) politikaları uygulanır. Müşteri, usta ve yönetici hesapları kesin yetki sınırlarıyla ayrılmıştır; hiçbir usta yetkisi dışındaki taleplere veya diğer kullanıcıların özel detaylarına erişemez.',
        },
        {
          title: '6. İlgili Kişi Hakları (KVKK Madde 11) ve Başvuru',
          body: 'KVKK\'nın 11. maddesi uyarınca kullanıcılarımız; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, verilerin düzeltilmesini veya silinmesini isteme hakkına sahiptir. Başvurularınızı destek@ankarausta.app adresine iletebilirsiniz.',
        },
      ]}
    />
  );
}
