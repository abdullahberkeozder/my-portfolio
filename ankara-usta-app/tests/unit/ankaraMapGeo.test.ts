import { beforeEach, describe, expect, it } from 'vitest';
import {
  ankaraDistrictsGeo,
  findDistrictByCoords,
  findDistrictByLatLng,
  loadSavedShopPins,
  saveShopPin,
  initialShopPins,
  type ShopPin,
} from '../../app/data/ankaraMapGeo';

describe('ankaraMapGeo domain & geo calculations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains expected districts and verified shop pins', () => {
    expect(ankaraDistrictsGeo.length).toBeGreaterThan(0);
    expect(initialShopPins.length).toBeGreaterThan(0);
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

  it('loads and saves custom shop pins to localStorage', () => {
    expect(loadSavedShopPins()).toEqual([]);

    const newPin: ShopPin = {
      id: 'custom-pin-1',
      name: 'Test Usta',
      ownerName: 'Kemal Test',
      category: 'Tesisat & Mekanik',
      categoryIcon: 'plumbing',
      district: 'Çankaya',
      neighborhood: 'Ayrancı',
      serviceId: 'musluk-tamiri',
      address: 'Tunalı Hilmi Cd. No:10',
      phone: '0312 000 00 00',
      rating: 4.9,
      reviewCount: 5,
      verifiedBadge: true,
      coords: { x: 410, y: 310 },
      latLng: { lat: 39.905, lng: 32.86 },
    };

    const saved = saveShopPin(newPin);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('custom-pin-1');

    const loaded = loadSavedShopPins();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Test Usta');

    // Overwriting the same pin updates it without duplicates
    const updated = saveShopPin({ ...newPin, name: 'Test Usta Güncel' });
    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Test Usta Güncel');
  });
});
