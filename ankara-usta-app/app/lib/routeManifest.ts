/** Canonical public route names shared by navigation and server-rendered links. */
const ROUTE_ALIASES: Record<string, string> = {
  '/usta/kayit': '/usta-basvurusu',
};

export function canonicalRoute(path: string): string {
  if (!path) return '/';
  const [pathname, suffix = ''] = path.split(/([?#].*)/, 2);
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return `${ROUTE_ALIASES[normalized] ?? normalized}${suffix}`;
}

export const routeManifest = {
  home: '/',
  directory: '/ustalar',
  map: '/harita',
  customerAccount: '/hesap',
  professionalApplication: '/usta-basvurusu',
} as const;

