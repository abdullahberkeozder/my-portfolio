export const districtSlugMap: Record<string, string> = {
  'altindag': 'Altındağ',
  'cankaya': 'Çankaya',
  'etimesgut': 'Etimesgut',
  'golbasi': 'Gölbaşı',
  'kecioren': 'Keçiören',
  'mamak': 'Mamak',
  'pursaklar': 'Pursaklar',
  'sincan': 'Sincan',
  'yenimahalle': 'Yenimahalle',
};

export const districtToSlug: Record<string, string> = Object.entries(districtSlugMap).reduce(
  (acc, [slug, name]) => {
    acc[name] = slug;
    return acc;
  },
  {} as Record<string, string>
);

export function getDistrictFromSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  return districtSlugMap[normalized] ?? null;
}

export function getSlugFromDistrict(district: string): string | null {
  return districtToSlug[district] ?? null;
}

export function getAllDistrictSlugs(): string[] {
  return Object.keys(districtSlugMap);
}
