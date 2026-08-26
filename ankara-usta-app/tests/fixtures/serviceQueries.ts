export type ClassificationFixture = {
  query: string;
  expectedServiceId: string;
};

export const classificationFixtures: ClassificationFixture[] = [
  { query: 'televizyon asma', expectedServiceId: 'tv-duvar-montaji' },
  { query: 'sigorta sürekli atıyor', expectedServiceId: 'sigorta-pano' },
  { query: 'tavandan su geliyor', expectedServiceId: 'su-kacagi' },
  { query: 'oda boyatma', expectedServiceId: 'tek-oda-boya' },
  { query: 'demir kapı sarktı', expectedServiceId: 'metal-kapi-mentese' },
  { query: 'haftalık temizlik', expectedServiceId: 'ev-temizligi' },
];
