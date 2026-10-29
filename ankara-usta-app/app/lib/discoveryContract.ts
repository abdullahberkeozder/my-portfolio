const DEFAULT_VIEW = 'split' as const;
const DEFAULT_SORT = 'recommended' as const;

export type DiscoveryView = 'split' | 'list' | 'map';
export type DiscoverySort = 'recommended' | 'rating' | 'jobs';

export type DiscoveryParams = {
  service?: string;
  district?: string;
  page: number;
  view: DiscoveryView;
  sort: DiscoverySort;
};

export type DiscoveryInput = {
  service?: string | null;
  district?: string | null;
  page?: number | string | null;
  view?: string | null;
  sort?: string | null;
};

type DiscoveryValue = DiscoveryInput | URLSearchParams;

type DiscoveryValidation = {
  serviceIds?: readonly string[];
  districts?: readonly string[];
};

const VIEWS: readonly DiscoveryView[] = ['split', 'list', 'map'];
const SORTS: readonly DiscoverySort[] = ['recommended', 'rating', 'jobs'];

function clean(value: string | null | undefined): string | undefined {
  const result = value?.trim();
  return result ? result : undefined;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function allowed(value: string | undefined, values: readonly string[] | undefined): string | undefined {
  if (!value) return undefined;
  if (!values?.length) return value;
  const exact = values.find((item) => item === value);
  if (exact) return exact;
  const slug = slugify(value);
  return values.find((item) => slugify(item) === slug);
}

function parsePage(value: number | string | null | undefined): number {
  const page = typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function canonicalDiscoveryDistrictSlug(value: string): string {
  return slugify(value);
}

export function parseDiscoveryParams(
  input: DiscoveryInput,
  validation: DiscoveryValidation = {}
): DiscoveryParams {
  const service = allowed(clean(input.service), validation.serviceIds);
  const district = allowed(clean(input.district), validation.districts);
  const view = VIEWS.includes(input.view as DiscoveryView) ? input.view as DiscoveryView : DEFAULT_VIEW;
  const sort = SORTS.includes(input.sort as DiscoverySort) ? input.sort as DiscoverySort : DEFAULT_SORT;

  return {
    ...(service ? { service } : {}),
    ...(district ? { district } : {}),
    page: parsePage(input.page),
    view,
    sort,
  };
}

export function serializeDiscoveryFilters(filters: { service?: string | null; district?: string | null }): string {
  const params = new URLSearchParams();
  const service = clean(filters.service);
  const district = clean(filters.district);
  if (service) params.set('service', service);
  if (district) params.set('district', canonicalDiscoveryDistrictSlug(district));
  return params.toString();
}

export function discoveryHref(params: DiscoveryValue, pathname = '/ustalar'): string {
  const input: DiscoveryInput = params instanceof URLSearchParams
    ? {
        service: params.get('service'),
        district: params.get('district'),
        page: params.get('page'),
        view: params.get('view'),
        sort: params.get('sort'),
      }
    : params;
  const parsed = parseDiscoveryParams(input);
  const query = new URLSearchParams();
  if (parsed.service) query.set('service', parsed.service);
  if (parsed.district) query.set('district', parsed.district);
  if (parsed.page > 1) query.set('page', String(parsed.page));
  // Keep the directory entry point explicit. This makes shared links stable
  // and preserves the selected split/recommended surface after a reset.
  query.set('view', parsed.view);
  query.set('sort', parsed.sort);
  const search = query.toString();
  return `${pathname}${search ? `?${search}` : ''}`;
}

export function updateDiscoveryParams(
  current: URLSearchParams,
  changes: DiscoveryInput,
  validation: DiscoveryValidation = {}
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  const parsed = parseDiscoveryParams(
    {
      service: changes.service === undefined ? next.get('service') : changes.service,
      district: changes.district === undefined ? next.get('district') : changes.district,
      page: changes.page === undefined ? next.get('page') : changes.page,
      view: changes.view === undefined ? next.get('view') : changes.view,
      sort: changes.sort === undefined ? next.get('sort') : changes.sort,
    },
    validation
  );

  for (const key of ['service', 'district', 'page', 'view', 'sort']) next.delete(key);
  if (parsed.service) next.set('service', parsed.service);
  if (parsed.district) next.set('district', parsed.district);
  if (parsed.page > 1) next.set('page', String(parsed.page));
  next.set('view', parsed.view);
  next.set('sort', parsed.sort);
  return next;
}

