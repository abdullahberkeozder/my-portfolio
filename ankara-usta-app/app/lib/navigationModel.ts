import { canonicalRoute } from './routeManifest';

export type NavigationContext = 'public' | 'customer' | 'professional' | 'operations' | 'auth' | 'reference';
export type NavigationItem = { href: string; label: string; primary?: boolean };
const route = (href: string) => canonicalRoute(href);
const servicesHref = `${route('/')}#services`;
const within = (path: string, root: string) => path === root || path.startsWith(`${root}/`);

// Navigation context is presentation only. Server authorization remains unchanged.
export function navigationContext(path: string): NavigationContext {
  if (['/concepts', '/inspiration', '/motif-lab'].some(root => within(path, root))) return 'reference';
  if (['/giris', '/kayit', '/usta/giris', '/usta/kayit', '/parola-yenile'].includes(path)) return 'auth';
  if (within(path, '/yonetim')) return 'operations';
  if (within(path, '/usta') || path === '/usta-basvurusu') return 'professional';
  if (['/taleplerim', '/islerim', '/gorusmeler', '/teklifler', '/uyusmazliklar', '/hesap'].some(root => within(path, root))) return 'customer';
  return 'public';
}

export function navigationItems(context: NavigationContext, conversations = false): NavigationItem[] {
  if (context === 'operations') return [
    { href: route('/yonetim/usta-basvurulari'), label: 'Başvurular' },
    { href: route('/yonetim/uyusmazliklar'), label: 'Uyuşmazlıklar' },
    { href: route('/yonetim/moderasyon'), label: 'İçerik inceleme' },
    { href: route('/yonetim/denetim-izi'), label: 'Denetim İzi' },
    { href: route('/hesap'), label: 'Hesap' },
  ];
  if (context === 'auth') return [{ href: route('/'), label: 'Ana sayfa' }, { href: route('/yardim'), label: 'Yardım' }];
  if (context === 'professional') return [
    { href: route('/usta/talepler'), label: 'İş fırsatları' },
    { href: route('/islerim'), label: 'İşlerim' },
    { href: route('/uyusmazliklar'), label: 'Uyuşmazlıklar' },
    { href: route('/usta/musaitlik'), label: 'Müsaitlik' },
    { href: route('/usta-basvurusu'), label: 'Profil ve belgeler' },
    { href: route('/hesap'), label: 'Hesap' },
  ];
  if (context === 'customer') return [
    { href: route('/taleplerim'), label: 'Taleplerim' },
    { href: route('/islerim'), label: 'İşlerim' },
    ...(conversations ? [{ href: route('/gorusmeler'), label: 'Görüşmeler' }] : []),
    { href: route('/uyusmazliklar'), label: 'Uyuşmazlıklar' },
    { href: route('/hesap'), label: 'Hesap' },
    { href: servicesHref, label: 'Yeni talep', primary: true },
  ];
  return [
    { href: servicesHref, label: 'Hizmetler' },
    { href: route('/ustalar'), label: 'Ustalar' },
    { href: route('/nasil-calisir'), label: 'Nasıl çalışır?' },
    { href: route('/hesap'), label: 'Hesabım' },
    { href: route('/usta/kayit'), label: 'Usta olarak katıl' },
  ];
}

export function navigationActive(path: string, href: string) {
  return href !== '/' && !href.includes('#') && within(path, href);
}
