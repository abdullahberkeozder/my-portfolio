import { ankaraDistrictsGeo, getNeighborhoodCoordinates } from '../data/ankaraMapGeo';
import type { TradespersonMapMarker } from '../components/map/RealAnkaraMap';

export type TradespersonMetrics = {
  totalCompletedJobs: number;
  averageRating: number;
  totalReviews?: number;
};

export function generateUstaMapMarkers(
  profiles: { user_id: string; display_name: string; city: string | null }[],
  areaMap: Record<string, string[]>,
  serviceMap: Record<string, string[]>,
  neighborhoodMap?: Record<string, string[]>,
  metricsMap?: Record<string, TradespersonMetrics>
): TradespersonMapMarker[] {
  return profiles.map(profile => {
    const areas = areaMap[profile.user_id] ?? [];
    // Do not silently assign a different district when service-area data is
    // missing. Use the profile city until a real district is available.
    const primaryDistrictName = areas[0] || profile.city || 'Ankara';
    const neighborhoods = neighborhoodMap?.[profile.user_id] ?? [];
    const primaryNeighborhood = neighborhoods[0];

    // 1. Resolve GPS Coordinates (Neighborhood centroid priority, then District centroid)
    let baseCenter: [number, number] | null = null;
    let isNeighborhoodExact = false;

    if (primaryNeighborhood) {
      const neighCoords = getNeighborhoodCoordinates(primaryDistrictName, primaryNeighborhood);
      if (neighCoords) {
        baseCenter = neighCoords;
        isNeighborhoodExact = true;
      }
    }

    if (!baseCenter) {
      const districtGeo =
        ankaraDistrictsGeo.find(
          d =>
            d.name.toLowerCase() === primaryDistrictName.toLowerCase() ||
            d.id === primaryDistrictName.toLowerCase()
        ) ?? ankaraDistrictsGeo[0];
      baseCenter = districtGeo.latLngCenter;
    }

    // Deterministic pseudo-random offset based on user_id string hash
    let hash = 0;
    for (let i = 0; i < profile.user_id.length; i++) {
      hash = (hash << 5) - hash + profile.user_id.charCodeAt(i);
      hash |= 0;
    }

    // Exact neighborhood centroid receives micro-jitter (40-60m / ~0.0005 deg) so multiple ustas don't overlap completely.
    // District-level receives standard dispersion (~350m).
    const jitterMultiplier = isNeighborhoodExact ? 0.01 : 0.35;
    const offsetLat = (((Math.abs(hash) % 1000) - 500) / 10000) * jitterMultiplier;
    const offsetLng = (((Math.abs(hash >> 3) % 1000) - 500) / 10000) * jitterMultiplier;

    // Prices are only trustworthy after a quote. Keep the map neutral instead
    // of presenting taxonomy ranges as if they were this professional's rate.
    const services = serviceMap[profile.user_id] ?? [];
    const priceEstimate = 'Teklif alınır';

    // 3. Resolve Verified Metrics (TRUST-01: Authentic Data from Database)
    const metrics = metricsMap?.[profile.user_id];
    let rating: number;
    let reviewCount = 0;
    let badge = 'Doğrulanmış Usta';

    if (metrics && metrics.totalCompletedJobs > 0) {
      reviewCount = metrics.totalReviews ?? metrics.totalCompletedJobs;
      rating = metrics.averageRating > 0 ? metrics.averageRating : 0;
      badge = metrics.totalCompletedJobs >= 20 ? 'Onaylı Usta' : 'Doğrulanmış Usta';
    } else {
      // In pilot / onboarding mode when a verified usta has zero completed jobs yet
      reviewCount = 0;
      rating = 0;
      badge = 'Yeni Katıldı';
    }

    return {
      id: profile.user_id,
      name: profile.display_name,
      services,
      district: primaryDistrictName,
      latLng: [baseCenter[0] + offsetLat, baseCenter[1] + offsetLng],
      badge,
      rating,
      priceEstimate,
      reviewCount,
      source: 'verified_public_projection',
      locationPrecision: isNeighborhoodExact ? 'neighborhood' : 'district',
      locationDisclosure: 'approximate_service_area',
    };
  });
}
