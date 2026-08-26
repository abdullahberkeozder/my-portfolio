import { describe, expect, it } from 'vitest';
import { CatalogIntegrityError, validateServiceCatalog } from '../../app/domain';
import { serviceCategories, services } from '../../app/data/serviceTaxonomy';

describe('service catalog integrity', () => {
  it('validates the production catalog as six categories and 26 services', () => {
    const catalog = validateServiceCatalog(serviceCategories, services);
    expect(catalog.categories).toHaveLength(6);
    expect(catalog.services).toHaveLength(26);
  });

  it.each([
    ['duplicate ID', [{...services[0]}, {...services[0], slug: 'another-slug'}]],
    ['duplicate slug', [{...services[0]}, {...services[1], slug: services[0].slug}]],
    ['missing category reference', [{...services[0], categoryId: 'missing-category'}]],
  ])('rejects %s', (_label, invalidServices) => {
    expect(() => validateServiceCatalog(serviceCategories, invalidServices)).toThrow(CatalogIntegrityError);
  });
});
