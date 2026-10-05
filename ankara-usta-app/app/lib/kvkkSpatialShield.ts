import {
  ankaraDistrictsGeo,
  ankaraCraftHubs,
  getNeighborhoodCoordinates,
  type CraftHub,
} from '../data/ankaraMapGeo';

export interface MaskedLocationResult {
  lat: number;
  lng: number;
  radiusMeters: number;
  isMasked: boolean;
  district: string;
  neighborhood: string;
  legalNotice: string;
}

export interface HubProximityResult {
  hub: CraftHub;
  distanceKm: number;
  estimatedTransitMinutes: number;
  transitSlaText: string;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(1));
}

/**
 * BR-16: KVKK 6698 Coğrafi Maskeleme Kalkanı
 * Müşterinin açık adresini gizleyip mahalle ağırlık merkezini ve 300m koruma yarıçapını döndürür.
 */
export function getMaskedLocation(
  district: string,
  neighborhood: string
): MaskedLocationResult {
  const coords = getNeighborhoodCoordinates(district, neighborhood);

  if (coords) {
    return {
      lat: coords[0],
      lng: coords[1],
      radiusMeters: 300,
      isMasked: true,
      district,
      neighborhood,
      legalNotice:
        'KVKK 6698 Madde 5/2 uyarınca açık adres gizlidir; yaklaşık mahalle merkezi (~300m yarıçap) gösterilmektedir.',
    };
  }

  // Fallback to district center if neighborhood is unknown
  const distObj = ankaraDistrictsGeo.find(
    (d) =>
      d.name.toLowerCase() === district.toLowerCase() ||
      d.id.toLowerCase() === district.toLowerCase()
  );
  const fallbackCoords = distObj ? distObj.latLngCenter : [39.9208, 32.8541]; // Kızılay default

  return {
    lat: fallbackCoords[0],
    lng: fallbackCoords[1],
    radiusMeters: 600, // Slightly broader if district-level fallback
    isMasked: true,
    district: distObj ? distObj.name : district,
    neighborhood: neighborhood || 'Genel Bölge',
    legalNotice:
      'KVKK 6698 Madde 5/2 uyarınca açık adres gizlidir; ilçe ağırlık merkezi gösterilmektedir.',
  };
}

/**
 * Calculates transit proximity and SLA to the nearest Ankara Craft Triangle Hub (Siteler, Ostim, Rüzgarlı).
 */
export function getNearestCraftHub(
  lat: number,
  lng: number,
  preferredCategory?: string
): HubProximityResult {
  // If category matches a primary hub, prioritize that hub
  const categoryHubMap: Record<string, string> = {
    carpentry: 'siteler',
    mobilya: 'siteler',
    plumbing: 'ruzgarli',
    tesisat: 'ruzgarli',
    repair: 'ostim',
    metal: 'ostim',
    electric: 'ruzgarli',
    elektrik: 'ruzgarli',
  };

  const prioritizedHubId = preferredCategory
    ? categoryHubMap[preferredCategory.toLowerCase()]
    : undefined;

  let bestHub = ankaraCraftHubs[0];
  let minDistance = Infinity;

  for (const hub of ankaraCraftHubs) {
    const dist = calculateHaversineDistanceKm(
      lat,
      lng,
      hub.latLng[0],
      hub.latLng[1]
    );

    if (prioritizedHubId && hub.id === prioritizedHubId) {
      bestHub = hub;
      minDistance = dist;
      break;
    }

    if (dist < minDistance) {
      minDistance = dist;
      bestHub = hub;
    }
  }

  // Calculate estimated transit SLA based on Ankara urban traffic speed (~25 km/h avg)
  const estimatedTransitMinutes = Math.max(15, Math.round(minDistance * 2.2 + 8));

  return {
    hub: bestHub,
    distanceKm: minDistance,
    estimatedTransitMinutes,
    transitSlaText: `⚡ ${bestHub.shortName} Merkezinden transit: ~${estimatedTransitMinutes} dk (${minDistance} km)`,
  };
}
