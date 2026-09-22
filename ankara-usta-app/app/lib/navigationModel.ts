export type NavigationContext = 'public' | 'customer' | 'professional' | 'operations' | 'auth' | 'reference';
export type NavigationItem = { href: string; label: string; primary?: boolean };
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
    { href: '/yonetim/usta-basvurulari', label: 'Başvurular' },
    { href: '/yonetim/uyusmazliklar', label: 'Uyuşmazlıklar' },
    { href: '/yonetim/moderasyon', label: 'İçerik inceleme' },
    { href: '/hesap', label: 'Hesap' },
  ];
  if (context === 'auth') return [{ href: '/', label: 'Ana sayfa' }, { href: '/yardim', label: 'Yardım' }];
  if (context === 'professional') return [
    { href: '/usta/talepler', label: 'İş fırsatları' },
    { href: '/islerim', label: 'İşlerim' },
    { href: '/usta/musaitlik', label: 'Müsaitlik' },
    { href: '/usta-basvurusu', label: 'Profil ve belgeler' },
    { href: '/hesap', label: 'Hesap' },
  ];
  if (context === 'customer') return [
    { href: '/taleplerim', label: 'Taleplerim' }, { href: '/islerim', label: 'İşlerim' },
    ...(conversations ? [{ href: '/gorusmeler', label: 'Görüşmeler' }] : []),
    { href: '/hesap', label: 'Hesap' }, { href: '/#services', label: 'Yeni talep', primary: true },
  ];
  return [{ href: '/#services', label: 'Hizmetler' }, { href: '/ustalar', label: 'Ustalar' },
    { href: '/nasil-calisir', label: 'Nasıl çalışır?' }, { href: '/hesap', label: 'Hesabım' },
    { href: '/usta/kayit', label: 'Usta olarak katıl' }];
}

export function navigationActive(path: string, href: string) {
  return href !== '/' && !href.includes('#') && within(path, href);
}
