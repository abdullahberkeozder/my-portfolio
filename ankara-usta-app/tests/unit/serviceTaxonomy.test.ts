import { describe, expect, it } from 'vitest';
import {
  popularServices,
  serviceCategories,
  services,
  servicesByCategory,
} from '../../app/data/serviceTaxonomy';

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

describe('service taxonomy', () => {
  it('contains the approved six categories and 26 services', () => {
    expect(serviceCategories).toHaveLength(6);
    expect(services).toHaveLength(26);
  });

  it('uses unique identifiers and slugs', () => {
    expect(duplicateValues(serviceCategories.map((category) => category.id))).toEqual([]);
    expect(duplicateValues(serviceCategories.map((category) => category.slug))).toEqual([]);
    expect(duplicateValues(services.map((service) => service.id))).toEqual([]);
    expect(duplicateValues(services.map((service) => service.slug))).toEqual([]);
  });

  it('links every service to an existing category', () => {
    const categoryIds = new Set(serviceCategories.map((category) => category.id));

    expect(services.every((service) => categoryIds.has(service.categoryId))).toBe(true);
  });

  it('defines searchable aliases for every service', () => {
    expect(services.every((service) => service.aliases.length > 0)).toBe(true);
  });

  it('selects services by category and keeps popular ranks ordered', () => {
    expect(servicesByCategory('temizlik').map((service) => service.id)).toEqual([
      'ev-temizligi',
      'detayli-temizlik',
      'tadilat-sonrasi-temizlik',
      'cam-temizligi',
    ]);

    const ranks = popularServices.map((service) => service.popularRank!);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
