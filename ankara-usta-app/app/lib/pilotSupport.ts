/**
 * Orkestra (Ankara Usta) — Pilot Saha Operasyonu ve WhatsApp Destek Çekirdeği
 * FAZ 6.3: Ankara 9 Pilot İlçe & Zanaat Üçgeni Saha Koordinasyon Altyapısı
 */

export const ANKARA_PILOT_SUPPORT = {
  phoneDisplay: '+90 (312) 800 06 06',
  phoneTel: '+903128000606',
  whatsAppDigits: '903128000606',
  email: 'destek@ankarausta.app',
  operatingHours: {
    weekdays: '08:30 – 19:00',
    saturday: '09:00 – 17:00',
    sunday: 'Nöbetçi Acil Ekip (Tesisat & Elektrik)',
  },
  pilotDistricts: [
    'Çankaya',
    'Yenimahalle',
    'Keçiören',
    'Mamak',
    'Altındağ',
    'Etimesgut',
    'Sincan',
    'Gölbaşı',
    'Pursaklar',
  ] as const,
  craftTriangleHubs: [
    { name: 'Siteler', specialty: 'Mobilya, Ahşap & Marangozluk', transitSla: '20–35 dk' },
    { name: 'Ostim / İvedik', specialty: 'Metal İşleri, Torna & Mekanik', transitSla: '20–30 dk' },
    { name: 'Rüzgarlı', specialty: 'Sıhhi Tesisat, Armatür & Banyo', transitSla: '15–25 dk' },
  ],
} as const;

export type SupportCategory =
  | 'general'
  | 'customer_request'
  | 'artisan_support'
  | 'job_sos'
  | 'dispute_coordination';

export interface WhatsAppUrlOptions {
  category: SupportCategory;
  district?: string;
  requestId?: string;
  jobId?: string;
  customNote?: string;
}

/**
 * Builds a deterministic wa.me deeplink with pre-filled, professional Turkish copy.
 */
export function buildWhatsAppSupportUrl(options: WhatsAppUrlOptions): string {
  const { category, district, requestId, jobId, customNote } = options;
  let message = 'Merhaba Orkestra Saha Koordinatörlüğü, ';

  switch (category) {
    case 'customer_request':
      message += `Ankara ${district ? district + ' bölgesindeki ' : ''}hizmet talebim${
        requestId ? ` (#${requestId})` : ''
      } hakkında bilgi almak istiyorum.`;
      break;

    case 'artisan_support':
      message += `Orkestra zanaatkâr başvurum ve mesleki belge doğrulama sürecim hakkında görüşmek istiyorum.`;
      break;

    case 'job_sos':
      message += `Aktif işim${
        jobId ? ` (#${jobId})` : ''
      } için acil saha koordinasyonu desteğine ihtiyacım var.`;
      break;

    case 'dispute_coordination':
      message += `İşim${
        jobId ? ` (#${jobId})` : ''
      } kapsamındaki uyuşmazlık dosyam hakkında moderasyon ekibiyle görüşmek istiyorum.`;
      break;

    case 'general':
    default:
      message += `Orkestra Ankara pilot süreci ve hizmetler hakkında bilgi almak istiyorum.`;
      break;
  }

  if (customNote) {
    message += ` Ek Not: ${customNote}`;
  }

  return `https://wa.me/${ANKARA_PILOT_SUPPORT.whatsAppDigits}?text=${encodeURIComponent(message)}`;
}
