/**
 * Orkestra Ankara Pilot Coverage & Calibration Architecture
 *
 * Core Principle: Real Supply Only.
 * Under no circumstances does Orkestra show synthetic, simulated, or fabricated
 * artisan profiles or inflated "X artisans near you" counts. Where active, verified
 * supply is limited or absent, this is communicated transparently to the user.
 */

export const CORE_PILOT_SERVICES = [
  'musluk-degisimi',
  'su-kacagi',
  'elektrik-arizasi',
  'mobilya-kurulumu',
  'tek-oda-boya',
] as const;

export type CorePilotServiceId = (typeof CORE_PILOT_SERVICES)[number];

export const CORE_PILOT_DISTRICTS = [
  'Çankaya',
  'Yenimahalle',
  'Keçiören',
  'Etimesgut',
  'Mamak',
] as const;

export const EXTENDED_PILOT_DISTRICTS = [
  'Altındağ',
  'Gölbaşı',
  'Pursaklar',
  'Sincan',
] as const;

export type PilotDistrictTier = 'core' | 'extended' | 'unsupported';

export type ServiceCalibration = {
  serviceId: string;
  name: string;
  deliveryModel: 'package' | 'inspection' | 'quote';
  isCorePilot: boolean;
  priorityRank: number;
  shortSummary: string;
  includedScope: readonly string[];
  excludedScope: readonly string[];
  safetyProtocol?: string;
};

const CALIBRATED_SERVICES: Record<string, ServiceCalibration> = {
  'musluk-degisimi': {
    serviceId: 'musluk-degisimi',
    name: 'Musluk Değişimi',
    deliveryModel: 'package',
    isCorePilot: true,
    priorityRank: 1,
    shortSummary: 'Eski bataryanın sökülmesi, yeni bataryanın montajı ve sızdırmazlık testi.',
    includedScope: [
      'Mevcut musluk / bataryanın demontajı',
      'Standart spiral hortum bağlantısı ve montaj',
      'Sızdırmazlık ve debi kontrolü',
    ],
    excludedScope: [
      'Duvar içi boru hattı yenilemesi veya kırım işleri',
      'Batarya / musluk malzeme bedeli (tercihe göre)',
      'Gider / sifon mekanik arızaları',
    ],
  },
  'su-kacagi': {
    serviceId: 'su-kacagi',
    name: 'Su Kaçağı Tespiti',
    deliveryModel: 'inspection',
    isCorePilot: true,
    priorityRank: 2,
    shortSummary: 'Termal kamera ve akustik dinleme cihazıyla noktasal kaçak tespiti.',
    includedScope: [
      'Termal ve akustik cihazla tesisat taraması',
      'Noktasal kaçak tespiti ve raporlanması',
      'Onarım kapsamı ve yönteminin belirlenmesi',
    ],
    excludedScope: [
      'Geniş kırım, fayans değişimi ve boru onarımı (ayrı tekliflendirilir)',
      'Bina ana kolon borusu veya sayaç öncesi kaçaklar',
      'Daire dışı altyapı müdahaleleri',
    ],
    safetyProtocol: 'Su elektrik tesisatına ulaşıyorsa önce ana şalteri kapatın. Güvenliyse ana vanayı kapatıp usta gelene kadar bekleyin.',
  },
  'elektrik-arizasi': {
    serviceId: 'elektrik-arizasi',
    name: 'Elektrik Arızası',
    deliveryModel: 'inspection',
    isCorePilot: true,
    priorityRank: 3,
    shortSummary: 'Pano, sigorta, priz veya hat bazlı arızanın tespiti ve güvenlik kontrolü.',
    includedScope: [
      'Hat ve sigorta kontrolü, kısa devre tespiti',
      'Basit bağlantı onarımı ve güvenli izolasyon',
      'Topraklama ve kaçak akım rölesi testi',
    ],
    excludedScope: [
      'Komple hat yenilemesi veya sıva altı kanal kırma',
      'Yeni sigorta panosu veya pano büyütme işleri',
      'Bina ana giriş panosu / sayaç müdahaleleri',
    ],
    safetyProtocol: 'Kıvılcım, duman veya yanık kokusu varsa alana dokunmayın. Ana şalteri kapatın; yangın riski varsa 112’yi arayın.',
  },
  'mobilya-kurulumu': {
    serviceId: 'mobilya-kurulumu',
    name: 'Mobilya Kurulumu',
    deliveryModel: 'package',
    isCorePilot: true,
    priorityRank: 4,
    shortSummary: 'Demonte kutu mobilyaların montaj şemasına uygun kurulumu.',
    includedScope: [
      'Şemaya uygun demonte parçaların montajı',
      'Kapak ayarları ve çekmece ray testleri',
      'Devrilmeye karşı duvara sabitleme işçiliği',
    ],
    excludedScope: [
      'Özel kesim, marangozluk tadilatı veya parça imalatı',
      'Eski büyük gardırop sökümü (ayrı belirtilmedikçe)',
      'Eksik fabrika vidalarının temini',
    ],
  },
  'tek-oda-boya': {
    serviceId: 'tek-oda-boya',
    name: 'Tek Oda Boya',
    deliveryModel: 'quote',
    isCorePilot: true,
    priorityRank: 5,
    shortSummary: 'Yüzey hazırlığı, zemin koruma ve 2 kat kaliteli boya uygulaması.',
    includedScope: [
      'Küçük çivi/dübel deliklerinin macunlanması ve zımpara',
      'Süpürgelik, kapı ve prizlerin maskelenmesi',
      '2 kat duvar ve tavan boya işçiliği',
    ],
    excludedScope: [
      'Geniş çaplı alçı sıva döküğü veya rutubet kazıma',
      'Boya ve sarf malzemesi bedeli (müşteri seçimine göre)',
      'Mobilya taşıma / hamaliye işleri',
    ],
  },
  'avize-montaji': {
    serviceId: 'avize-montaji',
    name: 'Avize Montajı',
    deliveryModel: 'package',
    isCorePilot: false,
    priorityRank: 6,
    shortSummary: 'Tavan askı aparatının sabitlenmesi, elektrik bağlantısı ve lamba montajı.',
    includedScope: [
      'Eski aydınlatma armatürünün sökülmesi',
      'Tavan kanca/dübel bağlantısının montajı ve taşıma kontrolü',
      'Kablo klemens bağlantısı, faz kontrolü ve çalışma testi',
    ],
    excludedScope: [
      'Yeni avize ve ampul malzeme bedelleri',
      'Tavan sıva/alçı tadilatı veya delik kapatma',
      'Tavana sıfırdan yeni elektrik hattı çekilmesi',
    ],
    safetyProtocol: 'Montaj öncesi odanın aydınlatma sigortasını ana panodan kapatın.',
  },
  'kornis-perde-montaji': {
    serviceId: 'kornis-perde-montaji',
    name: 'Korniş Montajı',
    deliveryModel: 'package',
    isCorePilot: false,
    priorityRank: 7,
    shortSummary: 'Korniş tavan montajı, ray hizalaması ve sağlam dübel montajı.',
    includedScope: [
      'Tavan ölçüsüne göre korniş hizalama ve delik delme',
      'Beton/alçıpan tipine uygun dübel ve vidalama',
      'Ray geçiş ve kilit kontrolü',
    ],
    excludedScope: [
      'Korniş rayı ve perde ruletleri malzeme bedeli',
      'Tül ve perde asımı / ütüleme işleri',
      'Asma tavan metal taşıyıcı karkas montajı',
    ],
  },
  'klozet-rezervuar': {
    serviceId: 'klozet-rezervuar',
    name: 'Klozet ve Rezervuar Onarımı',
    deliveryModel: 'quote',
    isCorePilot: false,
    priorityRank: 8,
    shortSummary: 'İç takım değişimi, su kaçıran şamandıra tamiri ve sızdırmazlık.',
    includedScope: [
      'Rezervuar iç takımı arıza tespiti',
      'Şamandıra ve boşaltma contası değişimi/ayarı',
      'Su dolum ve tahliye sızdırmazlık testi',
    ],
    excludedScope: [
      'Rezervuar iç takım ve yedek parça malzeme bedeli',
      'Klozet taşı seramik değişimi veya komple söküm',
      'Bina ana pis su borusu tıkanıklıkları',
    ],
  },
  'ev-temizligi': {
    serviceId: 'ev-temizligi',
    name: 'Ev Temizliği',
    deliveryModel: 'package',
    isCorePilot: false,
    priorityRank: 9,
    shortSummary: 'Standart ev temizliği; zemin silme, toz alma ve mutfak/banyo dezenfeksiyonu.',
    includedScope: [
      'Zeminlerin süpürülmesi ve paspaslanması',
      'Ulaşılabilir mobilya ve yüzeylerin tozunun alınması',
      'Mutfak tezgahı, lavabo ve banyo/klozet temizliği',
    ],
    excludedScope: [
      'İnşaat / tadilat sonrası harç ve boya kazıma işleri',
      'Dış cephe tehlikeli pencere silme',
      'Koltuk / halı yıkama makinesiyle derin yıkama',
    ],
  },
};

export type PilotCoverageResult = {
  district: string;
  tier: PilotDistrictTier;
  isCoreDistrict: boolean;
  serviceId?: string;
  isCoreService: boolean;
  hasSyntheticArtisans: false;
  message: string;
};

export function getPilotCoverage(district: string, serviceId?: string): PilotCoverageResult {
  const isCoreDistrict = (CORE_PILOT_DISTRICTS as readonly string[]).includes(district);
  const isExtendedDistrict = (EXTENDED_PILOT_DISTRICTS as readonly string[]).includes(district);
  const tier: PilotDistrictTier = isCoreDistrict ? 'core' : isExtendedDistrict ? 'extended' : 'unsupported';
  const isCoreService = serviceId ? (CORE_PILOT_SERVICES as readonly string[]).includes(serviceId as CorePilotServiceId) : false;

  let message: string;
  if (tier === 'core') {
    message = `${district} ilçesi Orkestra Ankara çekirdek pilot bölgesindedir. Yalnızca doğrulanmış ve mesleki belgesi güncel ustalar eşleştirilir.`;
  } else if (tier === 'extended') {
    message = `${district} ilçesinde pilot aşaması genişletilmektedir; uygunluk durumunda doğrulanmış yerel ustalar yanıt verir.`;
  } else {
    message = `${district} bölgesi henüz aktif pilot kapsama alanımızda değildir. Canlı usta ağı genişletildikçe hizmete açılacaktır.`;
  }

  return {
    district,
    tier,
    isCoreDistrict,
    serviceId,
    isCoreService,
    hasSyntheticArtisans: false,
    message,
  };
}

export function getServiceCalibration(serviceId: string): ServiceCalibration | undefined {
  return CALIBRATED_SERVICES[serviceId];
}

export function isCorePilotService(serviceId: string): boolean {
  return (CORE_PILOT_SERVICES as readonly string[]).includes(serviceId as CorePilotServiceId);
}
