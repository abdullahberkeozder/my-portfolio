import { describe, expect, it } from 'vitest';
import {
  districtSlugMap,
  getAllDistrictSlugs,
  getDistrictFromSlug,
  getSlugFromDistrict,
} from '../../app/data/districtSlugs';
import { generateMetadata, generateStaticParams } from '../../app/ankara/[district]/[service]/page';
import sitemap from '../../app/sitemap';
import { services } from '../../app/data/serviceTaxonomy';

describe('Local SEO District Mapping (app/data/districtSlugs)', () => {
  it('maps all 9 Ankara pilot districts to their normalized slugs', () => {
    const slugs = getAllDistrictSlugs();
    expect(slugs).toHaveLength(9);
    expect(slugs).toContain('cankaya');
    expect(slugs).toContain('kecioren');
    expect(slugs).toContain('yenimahalle');
    expect(slugs).toContain('etimesgut');
    expect(slugs).toContain('mamak');

    expect(districtSlugMap['cankaya']).toBe('Çankaya');
    expect(getDistrictFromSlug('cankaya')).toBe('Çankaya');
    expect(getDistrictFromSlug('kecioren')).toBe('Keçiören');
    expect(getDistrictFromSlug('golbasi')).toBe('Gölbaşı');
    expect(getDistrictFromSlug('invalid-slug')).toBeNull();

    expect(getSlugFromDistrict('Çankaya')).toBe('cankaya');
    expect(getSlugFromDistrict('Bilinmeyen')).toBeNull();
  });
});

describe('Local SEO Page Generation (app/ankara/[district]/[service]/page.tsx)', () => {
  it('generates static params for all 9 districts and 26 services', async () => {
    const params = await generateStaticParams();
    const expectedCount = 9 * services.length;
    expect(params).toHaveLength(expectedCount);
    expect(params[0]).toHaveProperty('district');
    expect(params[0]).toHaveProperty('service');

    const cankayaMusluk = params.find(p => p.district === 'cankaya' && p.service === 'musluk-batarya-degisimi');
    expect(cankayaMusluk).toBeDefined();
  });

  it('generates rich metadata with canonical URL and descriptive title for valid routes', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({
        district: 'cankaya',
        service: 'musluk-batarya-degisimi',
      }),
    });

    expect(meta.title).toContain('Çankaya Musluk Değişimi Ustası');
    expect(meta.description).toContain('Çankaya');
    expect(meta.alternates?.canonical).toBe('https://ankarausta.com/ankara/cankaya/musluk-batarya-degisimi');
    expect(meta.openGraph?.url).toBe('https://ankarausta.com/ankara/cankaya/musluk-batarya-degisimi');
  });

  it('handles invalid district or service gracefully in metadata generation', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({
        district: 'invalid-district',
        service: 'invalid-service',
      }),
    });

    expect(meta.title).toBe('Hizmet Bulunamadı | Orkestra');
  });
});

describe('Dynamic XML Sitemap (app/sitemap.ts)', () => {
  it('generates a full sitemap containing static pages and 234 local landing pages', () => {
    const site = sitemap();
    expect(site.length).toBeGreaterThanOrEqual(240);

    const urls = site.map(item => item.url);
    expect(urls).toContain('https://ankarausta.com');
    expect(urls).toContain('https://ankarausta.com/ustalar');
    expect(urls).toContain('https://ankarausta.com/ankara/cankaya/musluk-batarya-degisimi');
    expect(urls).toContain('https://ankarausta.com/ankara/kecioren/avize-montaji');

    const sample = site.find(item => item.url.includes('/ankara/cankaya/musluk-batarya-degisimi'));
    expect(sample?.changeFrequency).toBe('weekly');
    expect(sample?.priority).toBeGreaterThanOrEqual(0.75);
  });
});
