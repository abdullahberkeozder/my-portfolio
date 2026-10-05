import type { MetadataRoute } from 'next';
import { getAllDistrictSlugs } from './data/districtSlugs';
import { services } from './data/serviceTaxonomy';

const BASE_URL = 'https://ankarausta.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ustalar`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/nasil-calisir`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/yardim`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/gizlilik`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/kullanim-kosullari`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/harita`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/usta-basvurusu`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic local SEO routes (9 districts x 26 services = 234 routes)
  const districtSlugs = getAllDistrictSlugs();
  const localRoutes: MetadataRoute.Sitemap = [];

  for (const districtSlug of districtSlugs) {
    for (const service of services) {
      localRoutes.push({
        url: `${BASE_URL}/ankara/${districtSlug}/${service.slug}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: service.popularRank ? 0.85 : 0.75,
      });
    }
  }

  return [...staticRoutes, ...localRoutes];
}
