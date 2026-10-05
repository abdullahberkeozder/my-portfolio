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

  it('computes dynamic price estimates based on offered services and taxonomy ranges', () => {
    const markers = generateUstaMapMarkers(
      mockProfiles,
      mockAreaMap,
      mockServiceMap,
      mockNeighborhoodMap,
      mockMetricsMap
    );

    // Musluk Tamiri: usually ~₺350 - ₺900 or similar in SERVICE_PRICE_RANGES
    expect(markers[0].priceEstimate).toMatch(/₺/);
    // Kombi: should have dynamic range
    expect(markers[1].priceEstimate).toMatch(/₺/);
    // Mobilya: should have dynamic range
    expect(markers[2].priceEstimate).toMatch(/₺/);
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
      expect(m.priceEstimate).toMatch(/₺/);
    });
  });
});
