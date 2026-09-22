import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccountPage from '../../app/hesap/page';

type TPProfile = {
  user_id: string;
  application_status: string;
  review_note: string | null;
  reviewed_at: string | null;
};

const mockState = vi.hoisted(() => ({
  user: { id: 'pro-123', email: 'usta@example.com', user_metadata: { service_city: 'Ankara' } },
  profile: { display_name: 'Ahmet Usta', created_at: '2026-01-01' } as Record<string, unknown> | null,
  roles: [{ role: 'tradesperson' }] as { role: string }[],
  tradespersonProfile: null as TPProfile | null,
  hasPublicVerification: false,
  error: null as null | { message: string },
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: mockState.user } }),
    },
    rpc: async (fn: string) => {
      if (fn === 'get_public_professional_verification') {
        return { data: mockState.hasPublicVerification, error: null };
      }
      return { data: null, error: null };
    },
    from: (table: string) => {
      let returnData: unknown = null;
      if (table === 'user_profiles') returnData = mockState.profile;
      if (table === 'user_roles') returnData = mockState.roles;
      if (table === 'tradesperson_profiles') returnData = mockState.tradespersonProfile;

      const queryObj: Record<string, unknown> = {
        data: returnData,
        error: mockState.error,
        count: Array.isArray(returnData) ? returnData.length : 0,
      };

      const methods = ['select', 'eq', 'order', 'range', 'in', 'maybeSingle'];
      for (const m of methods) {
        queryObj[m] = vi.fn().mockReturnValue(queryObj);
      }
      return queryObj;
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}));

vi.mock('../../app/components/AccountProfileForm', () => ({
  default: () => <div data-testid="profile-form">Profil Formu</div>,
}));

vi.mock('../../app/components/AccountCityForm', () => ({
  default: () => <div data-testid="city-form">Şehir Formu</div>,
}));

vi.mock('../../app/components/AccountSignOut', () => ({
  default: () => <button type="button">Çıkış Yap</button>,
}));

describe('AccountPage - Artisan Status Card (P4)', () => {
  afterEach(() => {
    cleanup();
    mockState.tradespersonProfile = null;
    mockState.hasPublicVerification = false;
    mockState.error = null;
  });

  it('renders needs_changes status with moderator note and update CTA', async () => {
    mockState.tradespersonProfile = {
      user_id: 'pro-123',
      application_status: 'needs_changes',
      review_note: 'Mesleki yeterlilik belgenizin geçerlilik tarihi okunamıyor, lütfen yenisini yükleyin.',
      reviewed_at: '2026-09-20T10:00:00Z',
    };

    render(await AccountPage());

    expect(screen.getByRole('region', { name: 'Usta başvuru ve doğrulama durumu' })).toBeInTheDocument();
    expect(screen.getByText('Düzeltme Bekleniyor')).toBeInTheDocument();
    expect(screen.getByText(/Mesleki yeterlilik belgenizin geçerlilik tarihi okunamıyor/)).toBeInTheDocument();

    const updateLink = screen.getByRole('link', { name: 'Eksik Belgeleri Güncelle ve Gönder →' });
    expect(updateLink).toHaveAttribute('href', '/usta-basvurusu');
  });

  it('renders approved status with public badge when verified certificate exists', async () => {
    mockState.tradespersonProfile = {
      user_id: 'pro-123',
      application_status: 'approved',
      review_note: 'Belgeler eksiksiz, onaylandı.',
      reviewed_at: '2026-09-20T12:00:00Z',
    };
    mockState.hasPublicVerification = true;

    render(await AccountPage());

    expect(screen.getByText('✓ Başvuru Onaylandı')).toBeInTheDocument();
    expect(screen.getByText('✓ Başvuru Onaylı')).toBeInTheDocument();
    expect(screen.getByText('★ Mesleki Belge Güncel')).toBeInTheDocument();

    const profileLink = screen.getByRole('link', { name: 'Kamuya Açık Profilinizi İnceleyin →' });
    expect(profileLink).toHaveAttribute('href', '/ustalar/pro-123');

    const jobsLink = screen.getByRole('link', { name: 'İş Fırsatlarını Gör →' });
    expect(jobsLink).toHaveAttribute('href', '/usta/talepler');
  });

  it('renders approved status without pro certificate badge when certificate expired or missing', async () => {
    mockState.tradespersonProfile = {
      user_id: 'pro-123',
      application_status: 'approved',
      review_note: null,
      reviewed_at: '2026-09-20T12:00:00Z',
    };
    mockState.hasPublicVerification = false;

    render(await AccountPage());

    expect(screen.getByText('✓ Başvuru Onaylandı')).toBeInTheDocument();
    expect(screen.getByText('✓ Başvuru Onaylı')).toBeInTheDocument();
    expect(screen.queryByText('★ Mesleki Belge Güncel')).not.toBeInTheDocument();
  });

  it('renders under_review status with review notice', async () => {
    mockState.tradespersonProfile = {
      user_id: 'pro-123',
      application_status: 'under_review',
      review_note: null,
      reviewed_at: null,
    };

    render(await AccountPage());

    expect(screen.getByText('İnceleniyor')).toBeInTheDocument();
    expect(screen.getByText(/Başvurunuz ve yüklediğiniz belgeler moderatör ekibi tarafından incelenmektedir/)).toBeInTheDocument();
  });

  it('does not render artisan status card when user has no tradesperson profile', async () => {
    mockState.tradespersonProfile = null;

    render(await AccountPage());

    expect(screen.queryByRole('region', { name: 'Usta başvuru ve doğrulama durumu' })).not.toBeInTheDocument();
  });
});
