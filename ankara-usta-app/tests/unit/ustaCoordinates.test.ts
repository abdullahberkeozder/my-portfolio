import { describe, expect, it } from 'vitest';
import { generateUstaMapMarkers, type TradespersonMetrics } from '../../app/ustalar/ustaCoordinates';
import { getNeighborhoodCoordinates } from '../../app/data/ankaraMapGeo';

describe('ustaCoordinates - Live Supabase Showcase Synchronization', () => {
  const mockProfiles = [
    { user_id: 'usta-kizilay', display_name: 'Ahmet Usta', city: 'Ankara' },
    { user_id: 'usta-unknown-neigh', display_name: 'Mehmet Usta', city: 'Ankara' },
    { user_id: 'usta-veteran', display_name: 'Hasan Usta', city: 'Ankara' },
  ];

  const mockAreaMap: Record<string, string[]> = {
    'usta-kizilay': ['Çankaya'],
    'usta-unknown-neigh': ['Etimesgut'],
    'usta-veteran': ['Yenimahalle'],
  };

  const mockServiceMap: Record<string, string[]> = {
    'usta-kizilay': ['Musluk Tamiri / Değişimi'],
    'usta-unknown-neigh': ['Kombi Bakımı'],
    'usta-veteran': ['Mobilya Montajı', 'Mutfak Dolabı Yapımı'],
  };

  const mockNeighborhoodMap: Record<string, string[]> = {
    'usta-kizilay': ['Kızılay'],
    'usta-unknown-neigh': ['BilinmeyenMahalle'],
    'usta-veteran': ['Ostim'],
  };

  const mockMetricsMap: Record<string, TradespersonMetrics> = {
    'usta-kizilay': { totalCompletedJobs: 0, averageRating: 0 },
    'usta-unknown-neigh': { totalCompletedJobs: 6, averageRating: 4.8 },
    'usta-veteran': { totalCompletedJobs: 28, averageRating: 4.9 },
  };

  it('resolves exact neighborhood centroid with micro-jitter when neighborhood is known', () => {
    const markers = generateUstaMapMarkers(
      [mockProfiles[0]],
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    expect(markers.length).toBe(1);
    const marker = markers[0];
    const expectedKizilayCoords = getNeighborhoodCoordinates('Çankaya', 'Kızılay')!;
    expect(expectedKizilayCoords).toBeDefined();

    // Verify coordinates are extremely close to Kızılay centroid (within micro-jitter ~60m / 0.001 deg)
    expect(Math.abs(marker.latLng[0] - expectedKizilayCoords[0])).toBeLessThan(0.002);
    expect(Math.abs(marker.latLng[1] - expectedKizilayCoords[1])).toBeLessThan(0.002);
  });

  it('falls back to district centroid when neighborhood is unknown or missing', () => {
    const markers = generateUstaMapMarkers(
      [mockProfiles[1]],
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    expect(markers.length).toBe(1);
    const marker = markers[0];
    expect(marker.district).toBe('Etimesgut');
    // Etimesgut center is roughly [39.9450, 32.6500]
    expect(marker.latLng[0]).toBeGreaterThan(39.90);
    expect(marker.latLng[0]).toBeLessThan(40.00);
    expect(marker.latLng[1]).toBeGreaterThan(32.60);
    expect(marker.latLng[1]).toBeLessThan(32.70);
  });

  it('does not assign a different district when the profile has no service-area row', () => {
    const [marker] = generateUstaMapMarkers(
      [{ user_id: 'usta-city-only', display_name: 'Şehir Usta', city: 'Ankara' }],
      {},
      {},
    );

    expect(marker.district).toBe('Ankara');
  });

  it('does not invent price amounts before a quote exists', () => {
    const markers = generateUstaMapMarkers(
      mockProfiles,
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    expect(markers.map(marker => marker.priceEstimate)).toEqual([
      'Teklif alınır',
      'Teklif alınır',
      'Teklif alınır',
    ]);
  });

  it('applies honest TRUST-01 rating and review metrics (debut vs veteran)', () => {
    const markers = generateUstaMapMarkers(
      mockProfiles,
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    // Debut usta with 0 jobs
    expect(markers[0].reviewCount).toBe(0);
    expect(markers[0].badge).toBe('Yeni Katıldı');

    // Proven usta with 6 jobs
    expect(markers[1].reviewCount).toBe(6);
    expect(markers[1].rating).toBe(4.8);
    expect(markers[1].badge).toBe('Doğrulanmış Usta');

    // Veteran usta with 28 jobs
    expect(markers[2].reviewCount).toBe(28);
    expect(markers[2].rating).toBe(4.9);
    expect(markers[2].badge).toBe('Onaylı Usta');
  });

  it('preserves backwards compatibility when optional maps are omitted', () => {
    const markers = generateUstaMapMarkers(
      mockProfiles,
      mockAreaMap,
      mockServiceMap
    );

    expect(markers.length).toBe(3);
    markers.forEach(m => {
      expect(m.id).toBeDefined();
      expect(m.latLng.length).toBe(2);
      expect(m.badge).toBe('Yeni Katıldı');
      expect(m.reviewCount).toBe(0);
      expect(m.priceEstimate).toBe('Teklif alınır');
    });
  });

  it('marks every public pin as an approximate verified projection', () => {
    const [neighborhoodMarker, districtMarker] = generateUstaMapMarkers(
      [mockProfiles[0], mockProfiles[1]],
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    expect(neighborhoodMarker.source).toBe('verified_public_projection');
    expect(neighborhoodMarker.locationPrecision).toBe('neighborhood');
    expect(districtMarker.locationPrecision).toBe('district');
    expect(neighborhoodMarker.locationDisclosure).toBe('approximate_service_area');
  });
});
