export type FlatRatePackage = {
  id: string;
  serviceId: string;
  title: string;
  categoryName: string;
  badge?: string;
  referencePriceTRY: number;
  estimatedDuration: string;
  warrantyDays: number;
  shortDescription: string;
  included: readonly string[];
  excluded: readonly string[];
  icon: string;
};

export const FLAT_RATE_PACKAGES: readonly FlatRatePackage[] = [
  {
    id: 'paket-musluk-degisimi',
    serviceId: 'musluk-degisimi',
    title: 'Standart Musluk / Batarya Değişimi',
    categoryName: 'Su Tesisatı',
    badge: 'Popüler Paket',
    referencePriceTRY: 750,
    estimatedDuration: '45–60 dk',
    warrantyDays: 90,
    shortDescription: 'Mutfak veya banyo bataryanızın sökülüp yenisinin montajı ve basınç testi.',
    included: [
      'Eski bataryanın güvenli demontajı',
      'Yeni batarya ve fleks hortum montajı',
      'Sızdırmazlık ve debi kontrolü',
    ],
    excluded: [
      'Batarya malzeme bedeli (tercihe göre)',
      'Duvar içi boru yenileme veya kırım işleri',
    ],
    icon: '🚰',
  },
  {
    id: 'paket-avize-montaji',
    serviceId: 'avize-montaji',
    title: 'Avize & Aydınlatma Montajı',
    categoryName: 'Montaj & Elektrik',
    badge: 'Hızlı Randevu',
    referencePriceTRY: 500,
    estimatedDuration: '30–45 dk',
    warrantyDays: 60,
    shortDescription: 'Tavan askı aparatının sabitlenmesi, klemens bağlantısı ve faz testi.',
    included: [
      'Mevcut avizenin sökülmesi',
      'Tavan dübel ve kanca sabitlemesi',
      'Elektrik bağlantısı ve aydınlatma testi',
    ],
    excluded: [
      'Yeni avize ve ampuller',
      'Tavana sıfırdan hat çekilmesi',
    ],
    icon: '💡',
  },
  {
    id: 'paket-klozet-rezervuar',
    serviceId: 'klozet-rezervuar',
    title: 'Klozet İç Takım & Sifon Tamiri',
    categoryName: 'Su Tesisatı',
    badge: 'Su Tasarrufu',
    referencePriceTRY: 850,
    estimatedDuration: '45–60 dk',
    warrantyDays: 90,
    shortDescription: 'Su kaçıran rezervuar iç takımının onarımı, şamandıra ve conta yenileme.',
    included: [
      'Arızalı iç takımın sökülmesi',
      'Yeni şamandıra ve klape montajı',
      'Dolum ve boşaltma sızdırmazlık testi',
    ],
    excluded: [
      'İç takım yedek parça bedeli',
      'Klozet seramik taşı değişimi',
    ],
    icon: '🚽',
  },
  {
    id: 'paket-kornis-montaji',
    serviceId: 'kornis-perde-montaji',
    title: 'Korniş Montajı (Oda Başı)',
    categoryName: 'Montaj',
    badge: 'Sağlam Dübel',
    referencePriceTRY: 600,
    estimatedDuration: '40–60 dk',
    warrantyDays: 90,
    shortDescription: 'Tavana lazer/terazi ile düzgün korniş montajı ve ray sabitlemesi.',
    included: [
      'Ölçüye göre tavan deliklerinin açılması',
      'Beton/alçıpan tipine uygun dübel ve vidalama',
      'Perde ray kilitlerinin takılması',
    ],
    excluded: [
      'Korniş rayı malzeme bedeli',
      'Perde asma ve ütüleme hizmeti',
    ],
    icon: '🪟',
  },
  {
    id: 'paket-tv-montaji',
    serviceId: 'tv-duvar-montaji',
    title: 'TV Duvar Montajı',
    categoryName: 'Montaj',
    badge: 'Lazer Terazi',
    referencePriceTRY: 650,
    estimatedDuration: '45–60 dk',
    warrantyDays: 180,
    shortDescription: 'Televizyonunuzun askı aparatıyla duvara terazi ayarında sağlam montajı.',
    included: [
      'Duvar yapısına uygun ağır yük dübellemesi',
      'Lazer terazi ile hassas hizalama',
      'Askı aparatı ve TV kilit testi',
    ],
    excluded: [
      'TV askı aparatı malzeme bedeli',
      'Kanal içi kablo saklama tadilatı',
    ],
    icon: '📺',
  },
] as const;
