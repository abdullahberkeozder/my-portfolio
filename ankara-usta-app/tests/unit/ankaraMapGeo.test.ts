import { describe, expect, it } from 'vitest';
import {
  ankaraDistrictsGeo,
  findDistrictByCoords,
  findDistrictByLatLng,
  ankaraRepresentativeShops,
  ankaraCraftHubs,
  calculateDispatchSla,
  clusterShops,
  chaikinSmooth,
} from '../../app/data/ankaraMapGeo';

describe('ankaraMapGeo domain & geo calculations', () => {
  it('contains the pilot district geometry without synthetic shop identities', () => {
    expect(ankaraDistrictsGeo.length).toBeGreaterThan(0);
    const cankaya = ankaraDistrictsGeo.find(d => d.id === 'cankaya');
    expect(cankaya).toBeDefined();
    expect(cankaya?.name).toBe('Çankaya');
  });

  it('finds district by Cartesian coordinates', () => {
    const district = findDistrictByCoords(400, 300);
    expect(district).toBeDefined();
    expect(district.id).toBeDefined();
  });

  it('finds district by LatLng inside polygon or fallback to center distance', () => {
    // Exact center coordinate of Cankaya
    const cankaya = ankaraDistrictsGeo.find(d => d.id === 'cankaya')!;
    const matched = findDistrictByLatLng(cankaya.latLngCenter[0], cankaya.latLngCenter[1]);
    expect(matched.id).toBe('cankaya');

    // Remote coordinate falling back to closest district center
    const fallback = findDistrictByLatLng(39.9, 32.8);
    expect(fallback).toBeDefined();
    expect(fallback.name).toBeDefined();
  });

  it('validates representative craft shops have real coordinates and categories', () => {
    expect(ankaraRepresentativeShops.length).toBeGreaterThan(5);

    ankaraRepresentativeShops.forEach(shop => {
      expect(shop.id).toBeDefined();
      expect(shop.name).toBeDefined();
      expect(shop.rating).toBeGreaterThanOrEqual(4.0);
      expect(shop.latLng?.lat).toBeGreaterThan(39.5);
      expect(shop.latLng?.lat).toBeLessThan(40.5);
      expect(shop.latLng?.lng).toBeGreaterThan(32.0);
      expect(shop.latLng?.lng).toBeLessThan(33.5);
      expect(['carpentry', 'repair', 'plumbing', 'electric', 'paint', 'cleaning']).toContain(
        shop.categoryIcon
      );
    });
  });

  it('validates Ankara Craft Triangle Hubs and their coordinates', () => {
    expect(ankaraCraftHubs.length).toBe(3);
    const hubIds = ankaraCraftHubs.map(h => h.id);
    expect(hubIds).toContain('siteler');
    expect(hubIds).toContain('ostim');
    expect(hubIds).toContain('ruzgarli');

    ankaraCraftHubs.forEach(hub => {
      expect(hub.name).toBeDefined();
      expect(hub.latLng[0]).toBeGreaterThan(39.8);
      expect(hub.latLng[0]).toBeLessThan(40.1);
      expect(hub.latLng[1]).toBeGreaterThan(32.6);
      expect(hub.latLng[1]).toBeLessThan(33.0);
      expect(hub.tradeCapacity).toBeGreaterThan(100);
    });
  });

  it('calculates realistic dispatch SLA and curved route points from craft hubs', () => {
    // Target: Çankaya Kızılay [39.9208, 32.8541]
    const kizilay: [number, number] = [39.9208, 32.8541];

    // Plumbing request should route from Rüzgarlı Hub
    const plumbingSla = calculateDispatchSla(kizilay, 'plumbing');
    expect(plumbingSla.hub.id).toBe('ruzgarli');
    expect(plumbingSla.distanceKm).toBeGreaterThan(1.5);
    expect(plumbingSla.distanceKm).toBeLessThan(6.0);
    expect(plumbingSla.estimatedMinutes).toBeGreaterThanOrEqual(15);
    expect(plumbingSla.routePoints.length).toBeGreaterThan(10);

    // Carpentry request should route from Siteler Hub
    const carpentrySla = calculateDispatchSla(kizilay, 'carpentry');
    expect(carpentrySla.hub.id).toBe('siteler');
    expect(carpentrySla.distanceKm).toBeGreaterThan(3.0);
    expect(carpentrySla.distanceKm).toBeLessThan(10.0);

    // Repair (Metal) request should route from Ostim Hub
    const metalSla = calculateDispatchSla(kizilay, 'repair');
    expect(metalSla.hub.id).toBe('ostim');
    expect(metalSla.distanceKm).toBeGreaterThan(8.0);
    expect(metalSla.estimatedMinutes).toBeGreaterThan(20);
  });

  it('clusters representative shops dynamically at overview zoom levels (10-12) and unclusters at detailed zoom (13+)', () => {
    // Zoom 11: Overview of Ankara, nearby shops should be grouped into clusters
    const clustersZoom11 = clusterShops(ankaraRepresentativeShops, 11);
    expect(clustersZoom11.length).toBeLessThan(ankaraRepresentativeShops.length);
    expect(clustersZoom11.length).toBeGreaterThan(1);

    const hasClusters = clustersZoom11.some(c => c.isCluster && c.count > 1);
    expect(hasClusters).toBe(true);

    const multiCluster = clustersZoom11.find(c => c.isCluster && c.count > 1)!;
    expect(multiCluster.center[0]).toBeGreaterThan(39.8);
    expect(multiCluster.center[1]).toBeGreaterThan(32.6);
    expect(multiCluster.label).toContain('Atölye');
    expect(multiCluster.items.length).toBe(multiCluster.count);

    // Zoom 14: Deep inspection zoom, every shop must be an individual pin
    const clustersZoom14 = clusterShops(ankaraRepresentativeShops, 14);
    expect(clustersZoom14.length).toBe(ankaraRepresentativeShops.length);
    expect(clustersZoom14.every(c => !c.isCluster && c.count === 1)).toBe(true);
  });

  it('smooths polygonal coordinates using Chaikin corner-cutting algorithm into organic curves', () => {
    // 4-point square
    const square: [number, number][] = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ];

    // Iteration 1: 4 edges * 2 = 8 points (+1 closing)
    const pass1 = chaikinSmooth(square, 1, true);
    expect(pass1.length).toBe(9);
    // Closed polygon check
    expect(pass1[0][0]).toBe(pass1[pass1.length - 1][0]);
    expect(pass1[0][1]).toBe(pass1[pass1.length - 1][1]);

    // Iteration 2: 8 edges * 2 = 16 points (+1 closing)
    const pass2 = chaikinSmooth(square, 2, true);
    expect(pass2.length).toBe(17);

    // Verify organic curvature on real Çankaya boundary coordinates
    const cankaya = ankaraDistrictsGeo.find(d => d.id === 'cankaya')!;
    const smoothedCankaya = chaikinSmooth(cankaya.polygonLatLngs, 2, true);
    expect(smoothedCankaya.length).toBeGreaterThan(cankaya.polygonLatLngs.length * 2);
  });
});


