/**
 * Orkestra Canonical Auth & Recovery Release Matrix (AUTH-01 / P1.3)
 *
 * Mock Supabase istemcisiyle rol, callback ve yönlendirme sözleşmelerini sınar.
 * Gerçek signup, e-posta teslimi ve çoklu hesap taslak izolasyonu kanıtı değildir.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET as handleAuthCallback } from '../../app/auth/callback/route';
import {
  safeNextPath,
  isPathAllowedForRoles,
  landingPathForRoles,
  roleLandingPages,
  roleAllowedRoutePrefixes,
} from '../../app/lib/authRedirect';
import { getServerUserAndRoles } from '../../app/lib/authServer';

// ---------------------------------------------------------------------------
// Mock Altyapısı
// ---------------------------------------------------------------------------
const authMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  selectRoles: vi.fn(),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      exchangeCodeForSession: authMocks.exchangeCodeForSession,
      getUser: authMocks.getUser,
    },
    from: (table: string) => {
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: authMocks.selectRoles,
          }),
        };
      }
      return { select: () => ({ eq: vi.fn().mockResolvedValue({ data: [] }) }) };
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  authMocks.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@orkestra.app' } } });
  authMocks.selectRoles.mockResolvedValue({ data: [{ role: 'customer' }] });
});

describe('AUTH-01 / Journey 1 & 2: Kayıt ve Niyet İzolasyonu (Signup & Intent)', () => {
  it('tanımlı roller ve iniş sayfaları eksiksizdir', () => {
    const expectedRoles = ['customer', 'tradesperson', 'moderator', 'admin'];
    for (const role of expectedRoles) {
      expect(roleLandingPages[role as keyof typeof roleLandingPages]).toBeTruthy();
      expect(roleAllowedRoutePrefixes[role as keyof typeof roleAllowedRoutePrefixes]).toBeDefined();
    }
  });

  it('müşteri iniş sayfası doğrudan müşteri çalışma alanıdır (/taleplerim)', () => {
    expect(roleLandingPages.customer).toBe('/taleplerim');
  });

  it('usta iniş sayfası doğrudan usta çalışma alanıdır (/usta/talepler)', () => {
    expect(roleLandingPages.tradesperson).toBe('/usta/talepler');
  });

  it('yönetim ve moderasyon iniş sayfaları ayrılmıştır', () => {
    expect(roleLandingPages.moderator).toBe('/yonetim/moderasyon');
    expect(roleLandingPages.admin).toBe('/yonetim/uyusmazliklar');
  });
});

describe('AUTH-01 / Journey 3: Hesap Varlığı Gizliliği ve Güvenlik (Enumeration Defense)', () => {
  it('safeNextPath zararlı veya harici protokolleri reddeder', () => {
    // Open redirect saldırıları
    expect(safeNextPath('https://evil.com')).toBeNull();
    expect(safeNextPath('http://evil.com')).toBeNull();
    expect(safeNextPath('//evil.com')).toBeNull();
    expect(safeNextPath('/\\evil.com')).toBeNull();
    expect(safeNextPath('\\evil.com')).toBeNull();
    expect(safeNextPath('javascript:alert(1)')).toBeNull();
    expect(safeNextPath('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeNextPath('/valid\\path')).toBeNull();
    expect(safeNextPath('/valid' + String.fromCharCode(10) + 'path')).toBeNull();
    expect(safeNextPath('/valid' + String.fromCharCode(0) + 'path')).toBeNull();
  });

  it('safeNextPath güvenli uygulama içi yolları onaylar', () => {
    expect(safeNextPath('/taleplerim')).toBe('/taleplerim');
    expect(safeNextPath('/islerim/job-123')).toBe('/islerim/job-123');
    expect(safeNextPath('/hesap?workspace=customer')).toBe('/hesap?workspace=customer');
    expect(safeNextPath('/?resume=1&service=musluk-tamiri')).toBe('/?resume=1&service=musluk-tamiri');
  });
});

describe('AUTH-01 / Journey 4: Callback Kod Takası ve Yönlendirme (/auth/callback)', () => {
  it('geçerli PKCE kodunu oturumla takas eder ve güvenli hedefe yönlendirir', async () => {
    const req = new Request('http://localhost:4187/auth/callback?code=valid-pkce-code&next=/taleplerim');
    const res = await handleAuthCallback(req);

    expect(authMocks.exchangeCodeForSession).toHaveBeenCalledWith('valid-pkce-code');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:4187/taleplerim');
  });

  it('kodsuz fragment recovery çağrısını yalnızca /parola-yenile rotasına geçirir', async () => {
    const req = new Request('http://localhost:4187/auth/callback?next=/parola-yenile');
    const res = await handleAuthCallback(req);

    expect(authMocks.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:4187/parola-yenile');
  });

  it('başarısız veya süresi dolmuş kod durumunda güvenli hata rotasına döner', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValue({ error: { message: 'Token expired' } });
    const req = new Request('http://localhost:4187/auth/callback?code=expired-code&next=/taleplerim');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'http://localhost:4187/giris?authError=callback&next=%2Ftaleplerim'
    );
  });

  it('harici open-redirect parametresi verildiğinde varsayılan güvenli yola yönlendirir', async () => {
    const req = new Request('http://localhost:4187/auth/callback?code=valid&next=https://attacker.org');
    const res = await handleAuthCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:4187/taleplerim');
  });
});

describe('AUTH-01 / Journey 5: Rol Tabanlı Yetkilendirme ve İniş Çözümleyici (authRedirect & RBAC)', () => {
  it('müşteri rolünün yetki alanlarını ve sınırlarını korur', () => {
    expect(isPathAllowedForRoles(['customer'], '/taleplerim')).toBe(true);
    expect(isPathAllowedForRoles(['customer'], '/islerim/job-1')).toBe(true);
    expect(isPathAllowedForRoles(['customer'], '/gorusmeler')).toBe(true);
    expect(isPathAllowedForRoles(['customer'], '/hesap')).toBe(true);

    // Müşteri usta veya operasyon alanlarına erişemez
    expect(isPathAllowedForRoles(['customer'], '/usta/talepler')).toBe(false);
    expect(isPathAllowedForRoles(['customer'], '/yonetim/uyusmazliklar')).toBe(false);
  });

  it('usta rolünün yetki alanlarını korur', () => {
    expect(isPathAllowedForRoles(['tradesperson'], '/usta/talepler')).toBe(true);
    expect(isPathAllowedForRoles(['tradesperson'], '/usta/musaitlik')).toBe(true);
    expect(isPathAllowedForRoles(['tradesperson'], '/islerim')).toBe(true);
    expect(isPathAllowedForRoles(['tradesperson'], '/hesap')).toBe(true);

    // Usta yönetim alanına erişemez
    expect(isPathAllowedForRoles(['tradesperson'], '/yonetim/moderasyon')).toBe(false);
  });

  it('çapraz giriş koruması: müşteri usta girişine geldiğinde müşteri alanına yönlendirilir', () => {
    const landing = landingPathForRoles(['customer'], '/usta/talepler');
    // Usta taleplerine izin verilmediği için müşterinin ana çalışma alanı döner
    expect(landing).toBe('/taleplerim');
  });

  it('birden fazla role sahip kullanıcıda en yüksek öncelikli çalışma alanı seçilir', () => {
    expect(landingPathForRoles(['customer', 'tradesperson'])).toBe('/usta/talepler');
    expect(landingPathForRoles(['customer', 'admin'])).toBe('/yonetim/uyusmazliklar');
    expect(landingPathForRoles(['tradesperson', 'admin'])).toBe('/yonetim/uyusmazliklar');
  });

  it('oturumsuz kullanıcı özel hesap sayfasına giremez', () => {
    expect(isPathAllowedForRoles([], '/hesap')).toBe(false);
  });
});

describe('AUTH-01 / Journey 6: Sunucu Tarafı Kullanıcı ve Rol Çözümlemesi (getServerUserAndRoles)', () => {
  it('oturum açmış kullanıcının rollerini veritabanından çeker', async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: { id: 'usr-1', email: 'usta@test.com' } },
    });
    authMocks.selectRoles.mockResolvedValue({
      data: [{ role: 'tradesperson' }],
    });

    const res = await getServerUserAndRoles();
    expect(res.user?.id).toBe('usr-1');
    expect(res.roles).toEqual(['tradesperson']);
  });

  it('rol tablosunda kaydı olmayan kullanıcıya varsayılan olarak customer atar', async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: { id: 'usr-fresh', email: 'yeni@test.com' } },
    });
    authMocks.selectRoles.mockResolvedValue({
      data: [],
    });

    const res = await getServerUserAndRoles();
    expect(res.user?.id).toBe('usr-fresh');
    expect(res.roles).toEqual(['customer']);
  });

  it('oturum yoksa boş rol ve kullanıcı döndürür', async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: null },
    });

    const res = await getServerUserAndRoles();
    expect(res.user).toBeNull();
    expect(res.roles).toEqual([]);
  });
});

describe('AUTH-01 / Journey 7: Taslak Koruma ve Auth Dönüşü (Draft Return & Resume Integrity)', () => {
  it('anonim taslak dönüş query stringi hem giriş öncesi hem sonrası korunur', () => {
    const draftQuery = '/?resume=1&service=musluk-tamiri';
    expect(safeNextPath(draftQuery)).toBe(draftQuery);
    expect(landingPathForRoles([], draftQuery)).toBe(draftQuery);
    expect(landingPathForRoles(['customer'], draftQuery)).toBe(draftQuery);
  });

  it('yönlendirme query parametreleri URL pathname ayrıştırıldığında kaybolmaz', () => {
    const complexNext = '/taleplerim?filter=active&sort=desc';
    expect(safeNextPath(complexNext)).toBe(complexNext);
    expect(landingPathForRoles(['customer'], complexNext)).toBe(complexNext);
  });
});
