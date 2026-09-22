import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Kullanım Koşulları | Orkestra',
  description: 'Orkestra platformu kullanım kuralları, aracı hizmet modeli, usta bağımsızlığı ve iş günlüğü ilkeleri.',
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="KULLANIM KOŞULLARI"
      title="Şeffaf süreç, kayıtlı onay ve karşılıklı sorumluluk ilkeleri."
      intro="Orkestra, hizmet arayan müşteriler ile bağımsız hizmet veren ustaları buluşturan aracı bir teknoloji platformudur. Süreçlerin güvenle yürütülmesi için temel ilkeler aşağıda tanımlanmıştır."
      sections={[
        {
          title: '1. Platformun Rolü ve Aracı Hizmet Sağlayıcı Statüsü',
          body: 'Orkestra, 6563 sayılı Kanun ve ilgili mevzuat uyarınca aracı hizmet sağlayıcı olarak faaliyet gösterir. Platform; teklif alma, kapsam karşılaştırma, mesajlaşma ve dijital iş günlüğü tutma altyapısı sunar. Orkestra; işveren, alt işveren, bayi, acente, sigortacı veya finansal emanetçi değildir; ustalara doğrudan istihdam sağlamaz veya işçilik sonucunu garanti etmez.',
        },
        {
          title: '2. Teklif Bağlayıcılığı, Malzeme ve Ücret Şeffaflığı',
          body: 'Usta tarafından iletilen teklif; işçilik tutarını, kullanılacak malzemelerin niteliğini, tahmini iş süresini ve varsa garanti şartlarını açıkça belirtir. Hizmet bedeli ve ödeme taraflar arasında doğrudan kararlaştırılır. Müşterinin sistem üzerinden yazılı onayı alınmayan hiçbir ek masraf veya sonradan eklenen işlem müşteriden talep edilemez.',
        },
        {
          title: '3. Kapsam Değişikliği ve Dijital İş Günlüğü',
          body: 'İşin yapımı sırasında öngörülemeyen teknik zorunluluklar ortaya çıkarsa, ustanın teklif edeceği kapsam ve maliyet revizyonu sisteme girilmelidir. Müşteri sistem üzerinden onay vermedikçe ilk kabul edilen teklif kapsamı esas alınır.',
        },
        {
          title: '4. Randevu, Karşılıklı Sorumluluk ve İptaller',
          body: 'Taraflar kararlaştırılan keşif veya iş başlangıç saatine riayet etmekle yükümlüdür. İş başlangıcına makul süreden az kala sebepsiz iptaller veya randevuya gelinmemesi, platform nezdinde güvenilirlik kayıtlarına işlenir ve hesaba yönelik idari tedbirlere konu olabilir.',
        },
        {
          title: '5. İş Kabulü, Garanti ve Uyuşmazlık Kayıtları',
          body: 'İş bittiğinde müşteri tamamlanan işi yerinde inceler ve sistem üzerinden tamamlandı onayı verir ya da eksik bildirir. Taahhüt edilen garanti ustanın doğrudan mesleki sorumluluğundadır. İhtilaf durumunda platformdaki dijital iş günlüğü, fotoğraflar ve mesaj kayıtları tarafsız delil zemini olarak taraflara ve yetkili mercilere sunulabilir.',
        },
        {
          title: '6. Pilot Aşama Şerhi',
          body: 'Bu kullanım koşulları Ankara kontrollü pilot aşaması için geçerli çerçeve kurallardır. Tam ticari sürüm öncesinde Türkiye tüketici ve elektronik ticaret mevzuatı uyarınca hukuki inceleme ile güncellenecektir.',
        },
      ]}
    />
  );
}
