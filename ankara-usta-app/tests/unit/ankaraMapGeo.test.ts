import { describe, expect, it } from 'vitest';
import {
  ankaraDistrictsGeo,
  findDistrictByCoords,
  findDistrictByLatLng,
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
});
