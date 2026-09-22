// Ankara 9 Pilot District Geometries and Tradesperson Shop Locations
// Dual Coordinate System: WGS84 GPS (lat, lng) + SVG viewBox (1000x750) fallback

export interface DistrictGeo {
  id: string;
  name: string;
  cluster: 'merkez' | 'bati' | 'cevre';
  center: { x: number; y: number };
  latLngCenter: [number, number];
  bounds: [[number, number], [number, number]]; // [SouthWest, NorthEast]
  polygonLatLngs: [number, number][];
  path: string;
  color: string;
  neighborhoods: string[];
  description: string;
  tradeCount: number;
}

export interface ShopPin {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  categoryIcon: 'plumbing' | 'electric' | 'carpentry' | 'paint' | 'repair' | 'cleaning';
  serviceId: string;
  district: string;
  neighborhood: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  verifiedBadge: boolean;
  coords: { x: number; y: number };
  latLng?: { lat: number; lng: number };
  isEmergency?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

// 9 Pilot Districts with real GPS coordinates and boundaries
export const ankaraDistrictsGeo: DistrictGeo[] = [
  {
    id: 'sincan',
    name: 'Sincan',
    cluster: 'bati',
    center: { x: 170, y: 310 },
    latLngCenter: [39.9650, 32.5700],
    bounds: [[39.8200, 32.4200], [40.0400, 32.6200]],
    polygonLatLngs: [
      [39.900, 32.600],
      [39.960, 32.595],
      [40.030, 32.580],
      [40.020, 32.490],
      [39.930, 32.500],
      [39.850, 32.460],
      [39.900, 32.600],
    ],
    path: 'M 70,220 L 190,190 L 260,260 L 250,370 L 210,430 L 130,460 L 60,390 L 50,300 Z',
    color: '#e8f0fe',
    neighborhoods: ['Fatih', 'Plevne', 'Temelli', 'Törekent', 'Yenikent'],
    description: 'Batı sanayi ve yerleşim aksı, organize sanayi bağlantılı ustalar.',
    tradeCount: 16,
  },
  {
    id: 'etimesgut',
    name: 'Etimesgut',
    cluster: 'bati',
    center: { x: 335, y: 345 },
    latLngCenter: [39.9450, 32.6500],
    bounds: [[39.8800, 32.5800], [40.0100, 32.7200]],
    polygonLatLngs: [
      [39.925, 32.710],
      [39.950, 32.715],
      [39.995, 32.660],
      [40.005, 32.600],
      [39.960, 32.600],
      [39.900, 32.620],
      [39.925, 32.710],
    ],
    path: 'M 260,260 L 370,240 L 410,290 L 420,380 L 370,440 L 250,420 L 250,370 Z',
    color: '#edf4fb',
    neighborhoods: ['Eryaman', 'Elvankent', 'Bağlıca', 'Göksu', 'Şaşmaz', 'Yapracık'],
    description: 'Eryaman, Bağlıca ve Şaşmaz Oto Sanayi bölgesi zanaatkarları.',
    tradeCount: 24,
  },
  {
    id: 'yenimahalle',
    name: 'Yenimahalle',
    cluster: 'merkez',
    center: { x: 440, y: 220 },
    latLngCenter: [39.9700, 32.7500],
    bounds: [[39.9200, 32.6800], [40.0300, 32.8200]],
    polygonLatLngs: [
      [39.935, 32.780],
      [39.930, 32.830],
      [39.960, 32.830],
      [40.010, 32.780],
      [40.020, 32.720],
      [39.980, 32.680],
      [39.945, 32.720],
      [39.935, 32.780],
    ],
    path: 'M 370,240 L 420,130 L 530,120 L 550,220 L 500,280 L 410,290 Z',
    color: '#e2edfc',
    neighborhoods: ['Batıkent', 'Demetevler', 'İvedik', 'Ostim', 'Şentepe', 'Yuva'],
    description: 'Ostim ve İvedik Organize Sanayi kalbi; metal, mekanik ve tesisat merkezi.',
    tradeCount: 42,
  },
  {
    id: 'kecioren',
    name: 'Keçiören',
    cluster: 'merkez',
    center: { x: 580, y: 155 },
    latLngCenter: [39.9950, 32.8650],
    bounds: [[39.9500, 32.8200], [40.0700, 32.9100]],
    polygonLatLngs: [
      [39.955, 32.835],
      [39.960, 32.885],
      [40.020, 32.910],
      [40.060, 32.860],
      [40.030, 32.825],
      [39.980, 32.825],
      [39.955, 32.835],
    ],
    path: 'M 530,120 L 630,70 L 680,120 L 660,220 L 550,220 Z',
    color: '#e9f1fd',
    neighborhoods: ['Aktepe', 'Bağlum', 'Etlik', 'İncirli', 'Kalaba', 'Ovacık'],
    description: 'Kuzey metropol nüfus aksı, ev tadilatı, elektrik ve kombi servisleri.',
    tradeCount: 29,
  },
  {
    id: 'pursaklar',
    name: 'Pursaklar',
    cluster: 'cevre',
    center: { x: 740, y: 100 },
    latLngCenter: [40.0400, 32.9000],
    bounds: [[39.9900, 32.8500], [40.1000, 32.9800]],
    polygonLatLngs: [
      [39.995, 32.880],
      [40.030, 32.850],
      [40.080, 32.880],
      [40.090, 32.960],
      [40.040, 32.970],
      [39.995, 32.880],
    ],
    path: 'M 680,120 L 750,40 L 850,70 L 840,170 L 760,190 L 680,120 Z',
    color: '#f0f5fd',
    neighborhoods: ['Altınova', 'Fatih', 'Merkez', 'Saray', 'Tevfik İleri'],
    description: 'Havaalanı güzergahı ve Saray sanayi bölgesi teknik hizmetleri.',
    tradeCount: 11,
  },
  {
    id: 'altindag',
    name: 'Altındağ',
    cluster: 'merkez',
    center: { x: 610, y: 275 },
    latLngCenter: [39.9600, 32.8900],
    bounds: [[39.9300, 32.8450], [40.0200, 32.9900]],
    polygonLatLngs: [
      [39.935, 32.850],
      [39.955, 32.850],
      [39.970, 32.890],
      [40.010, 32.950],
      [39.980, 32.985],
      [39.940, 32.920],
      [39.935, 32.850],
    ],
    path: 'M 550,220 L 660,220 L 710,290 L 660,350 L 570,330 L 500,280 Z',
    color: '#dbeafe',
    neighborhoods: ['Aydınlıkevler', 'Hacı Bayram', 'Karapürçek', 'Önder', 'Ulubey', 'Siteler'],
    description: 'Siteler Mobilya Sanayi ve tarihi Ulus zanaat atölyeleri merkezi.',
    tradeCount: 38,
  },
  {
    id: 'mamak',
    name: 'Mamak',
    cluster: 'merkez',
    center: { x: 765, y: 320 },
    latLngCenter: [39.9250, 32.9300],
    bounds: [[39.8700, 32.8800], [39.9700, 33.0200]],
    polygonLatLngs: [
      [39.935, 32.885],
      [39.965, 32.920],
      [39.960, 33.010],
      [39.900, 33.000],
      [39.880, 32.930],
      [39.910, 32.890],
      [39.935, 32.885],
    ],
    path: 'M 710,290 L 840,240 L 920,330 L 890,430 L 770,410 L 660,350 Z',
    color: '#e4effc',
    neighborhoods: ['Abidinpaşa', 'Akdere', 'Boğaziçi', 'Ege', 'Hüseyingazi', 'Natoyolu'],
    description: 'Doğu yerleşim koridoru; boya, mantolama ve sıhhi tesisat ustaları.',
    tradeCount: 21,
  },
  {
    id: 'cankaya',
    name: 'Çankaya',
    cluster: 'merkez',
    center: { x: 480, y: 440 },
    latLngCenter: [39.8860, 32.8530],
    bounds: [[39.8000, 32.7000], [39.9400, 32.9000]],
    polygonLatLngs: [
      [39.935, 32.840],
      [39.925, 32.870],
      [39.900, 32.890],
      [39.850, 32.880],
      [39.810, 32.840],
      [39.820, 32.730],
      [39.880, 32.710],
      [39.910, 32.780],
      [39.935, 32.840],
    ],
    path: 'M 410,290 L 500,280 L 570,330 L 660,350 L 670,450 L 610,540 L 460,530 L 370,440 L 420,380 Z',
    color: '#d6e6fe',
    neighborhoods: ['Ayrancı', 'Bahçelievler', 'Balgat', 'Çayyolu', 'Dikmen', 'Kızılay', 'Oran', 'Ümitköy'],
    description: 'Kızılay, Balgat ve Çayyolu konut & ofis bölgeleri teknik hizmet ağı.',
    tradeCount: 45,
  },
  {
    id: 'golbasi',
    name: 'Gölbaşı',
    cluster: 'cevre',
    center: { x: 530, y: 620 },
    latLngCenter: [39.7900, 32.8050],
    bounds: [[39.6800, 32.6500], [39.8400, 32.9200]],
    polygonLatLngs: [
      [39.820, 32.720],
      [39.840, 32.820],
      [39.825, 32.890],
      [39.750, 32.900],
      [39.700, 32.840],
      [39.720, 32.730],
      [39.790, 32.700],
      [39.820, 32.720],
    ],
    path: 'M 460,530 L 610,540 L 670,450 L 770,410 L 800,530 L 730,690 L 560,720 L 420,650 L 460,530 Z',
    color: '#ecf3fd',
    neighborhoods: ['Bahçelievler', 'İncek', 'Karşıyaka', 'Kızılcaşar', 'Taşpınar'],
    description: 'Mogan ve Eymir Gölleri çevresi, İncek yerleşimi ve mekanik tesisat ağı.',
    tradeCount: 14,
  },
];

// Usta ve işletme noktaları yalnız doğrulanmış ürün verisinden üretilecektir.
// Tasarım konsepti kendi açıkça temsili noktalarını bileşen içinde oluşturur.

export function findDistrictByCoords(x: number, y: number): DistrictGeo {
  let closest = ankaraDistrictsGeo[0];
  let minDistance = Number.MAX_VALUE;

  for (const d of ankaraDistrictsGeo) {
    const dx = d.center.x - x;
    const dy = d.center.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return closest;
}

export function findDistrictByLatLng(lat: number, lng: number): DistrictGeo {
  // 1. Ray-casting point in polygon test
  for (const district of ankaraDistrictsGeo) {
    if (isPointInPolygon([lat, lng], district.polygonLatLngs)) {
      return district;
    }
  }

  // 2. Fallback to Euclidean distance to district center
  let closest = ankaraDistrictsGeo[0];
  let minDist = Number.MAX_VALUE;

  for (const district of ankaraDistrictsGeo) {
    const dLat = district.latLngCenter[0] - lat;
    const dLng = district.latLngCenter[1] - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDist) {
      minDist = dist;
      closest = district;
    }
  }

  return closest;
}

function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
