import InfoPage from '../components/InfoPage';

export const metadata = {
  title: 'Kullanım Koşulları | Orkestra',
  description: 'Orkestra platformu hizmet alma, usta sorumlulukları, iş günlüğü ve kapsam kuralları.',
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="KULLANIM KOŞULLARI"
      title="Şeffaf kapsam, kayıtlı onay ve karşılıklı sorumluluk ilkeleri."
      intro="Platform müşteri ile ustayı buluşturur; teklif, kapsam, malzeme, iş günlüğü ve teslim onaylarının taraflarca dürüstlükle yürütülmesini güvenceye alır."
      sections={[
        {
          title: '1. Teklif Bağlayıcılığı ve Malzeme Şeffaflığı',
          body: 'Usta tarafından verilen teklif; işçilik ücretini, kullanılacak malzemelerin niteliğini, tahmini iş süresini ve garanti şartlarını net olarak içermelidir. Önceden belirtilmeyen veya müşterinin yazılı onayı alınmayan ek masraflar talep edilemez.',
        },
        {
          title: '2. Kapsam Değişikliği ve Dijital İş Günlüğü',
          body: 'İşin yapımı sırasında ortaya çıkan beklenmedik durumlar, ek tamirat veya tadilat ihtiyaçları derhal "Dijital İş Günlüğü"ne işlenmelidir. Müşteri ek maliyet ve süre değişikliğini onaylamadan ustanın ek işlem yapması durumunda, platform uyuşmazlık incelemesinde ilk kapsamı esas alır.',
        },
        {
          title: '3. Randevu, İptal ve Erteleme Kuralları',
          body: 'Taraflar belirlenen randevu saatine uymakla yükümlüdür. İş başlangıcına 12 saatten az süre kala sebepsiz iptaller veya randevuya gelinmemesi durumunda ilgili tarafın hesap güvenilirlik puanı düşürülür ve yaptırım uygulanabilir.',
        },
        {
          title: '4. İş Kabulü, Garanti ve Uyuşmazlık Çözümü',
          body: 'İş bittiğinde müşteri işi yerinde kontrol ederek sistem üzerinden onay verir veya eksiklik bildirir. Teslimden itibaren usta tarafından taahhüt edilen garanti süresince oluşacak işçilik kusurları ustanın sorumluluğundadır. Çözülemeyen anlaşmazlıklarda Orkestra Uyuşmazlık Operasyonu devreye girer.',
        },
      ]}
    />
  );
}
