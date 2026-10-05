import { describe, it, expect } from 'vitest';
import {
  getMaskedLocation,
  calculateHaversineDistanceKm,
  getNearestCraftHub,
} from '../../app/lib/kvkkSpatialShield';
import { ankaraDistrictsGeo } from '../../app/data/ankaraMapGeo';
import { ankaraNeighborhoods } from '../../app/data/ankaraLocations';

describe('BR-16: KVKK Coğrafi Maskeleme Kalkanı (Spatial Privacy Shield)', () => {
  it('correctly resolves neighborhood centroid and 300m privacy radius for Çankaya / Ayrancı', () => {
    const masked = getMaskedLocation('Çankaya', 'Ayrancı');
    expect(masked.isMasked).toBe(true);
    expect(masked.radiusMeters).toBe(300);
    expect(masked.lat).toBeCloseTo(39.894, 3);
    expect(masked.lng).toBeCloseTo(32.852, 3);
    expect(masked.district).toBe('Çankaya');
    expect(masked.neighborhood).toBe('Ayrancı');
    expect(masked.legalNotice).toContain('KVKK 6698');
  });

  it('safely resolves all 54 pilot neighborhoods across 9 districts without errors', () => {
    for (const [district, neighborhoods] of Object.entries(ankaraNeighborhoods)) {
      for (const neighborhood of neighborhoods) {
        const masked = getMaskedLocation(district, neighborhood);
        expect(masked.isMasked).toBe(true);
        expect(masked.radiusMeters).toBe(300);
        expect(typeof masked.lat).toBe('number');
        expect(typeof masked.lng).toBe('number');
        expect(masked.lat).toBeGreaterThan(39.5);
        expect(masked.lat).toBeLessThan(40.5);
        expect(masked.lng).toBeGreaterThan(32.2);
        expect(masked.lng).toBeLessThan(33.2);
      }
    }
  });

  it('gracefully falls back to district center if neighborhood is unknown', () => {
    const masked = getMaskedLocation('Keçiören', 'BilinmeyenMahalle');
    expect(masked.isMasked).toBe(true);
    expect(masked.radiusMeters).toBe(600);
    const kecioren = ankaraDistrictsGeo.find((d) => d.id === 'kecioren');
    expect(masked.lat).toBe(kecioren!.latLngCenter[0]);
    expect(masked.lng).toBe(kecioren!.latLngCenter[1]);
  });

  it('accurately computes Haversine distance between coordinates', () => {
    // Distance between Kızılay [39.9208, 32.8541] and Ostim [39.9720, 32.7480] is approx 10.7 km
    const dist = calculateHaversineDistanceKm(39.9208, 32.8541, 39.9720, 32.7480);
    expect(dist).toBeGreaterThan(9.0);
    expect(dist).toBeLessThan(12.5);
  });

  it('computes closest Ankara craft triangle hub and realistic transit SLA', () => {
    // Ayrancı is very close to Rüzgarlı / Kızılay
    const proximity = getNearestCraftHub(39.894, 32.852);
    expect(proximity.hub).toBeDefined();
    expect(proximity.distanceKm).toBeGreaterThan(0);
    expect(proximity.estimatedTransitMinutes).toBeGreaterThanOrEqual(15);
    expect(proximity.transitSlaText).toContain('Merkezinden transit');
  });

  it('prioritizes category-matched craft hub (e.g. Siteler for carpentry)', () => {
    const proximity = getNearestCraftHub(39.894, 32.852, 'carpentry');
    expect(proximity.hub.id).toBe('siteler');
  });
});
