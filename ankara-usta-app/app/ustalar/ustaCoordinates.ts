import { ankaraDistrictsGeo } from '../data/ankaraMapGeo';
import type { TradespersonMapMarker } from '../components/map/RealAnkaraMap';

export function generateUstaMapMarkers(
  profiles: { user_id: string; display_name: string; city: string | null }[],
  areaMap: Record<string, string[]>,
  serviceMap: Record<string, string[]>
): TradespersonMapMarker[] {
  return profiles.map(profile => {
    const areas = areaMap[profile.user_id] ?? [];
    const primaryDistrictName = areas[0] || 'Çankaya';

    const districtGeo =
      ankaraDistrictsGeo.find(
        d =>
          d.name.toLowerCase() === primaryDistrictName.toLowerCase() ||
          d.id === primaryDistrictName.toLowerCase()
      ) ?? ankaraDistrictsGeo[0];

    const baseCenter = districtGeo.latLngCenter;

    // Deterministic pseudo-random offset based on user_id string hash
    let hash = 0;
    for (let i = 0; i < profile.user_id.length; i++) {
      hash = (hash << 5) - hash + profile.user_id.charCodeAt(i);
      hash |= 0;
    }

    const offsetLat = (((Math.abs(hash) % 1000) - 500) / 10000) * 0.35;
    const offsetLng = (((Math.abs(hash >> 3) % 1000) - 500) / 10000) * 0.35;

    return {
      id: profile.user_id,
      name: profile.display_name,
      services: serviceMap[profile.user_id] ?? [],
      district: primaryDistrictName,
      latLng: [baseCenter[0] + offsetLat, baseCenter[1] + offsetLng],
      badge: 'Doğrulanmış Usta',
      rating: 4.8 + ((Math.abs(hash) % 3) / 10),
    };
  });
}
