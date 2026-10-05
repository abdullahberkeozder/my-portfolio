import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminTradespersonQueuePage from '../../app/yonetim/usta-basvurulari/page';

type ApplicationItem = {
  user_id: string;
  display_name: string;
  bio: string;
  application_status: string;
  submitted_at: string | null;
  review_note: string | null;
  tradesperson_services: { service_id: string }[];
  tradesperson_service_areas: { district: string }[];
  tradesperson_documents: {
    id: string;
    kind: string;
    status: string;
    original_name: string;
    expires_at: string | null;
    storage_path?: string;
  }[];
  tradesperson_references: {
    id: string;
    reference_name: string;
    relationship: string;
    status: string;
  }[];
};

const mockState = vi.hoisted(() => ({
  user: { id: 'admin-1', email: 'admin@example.com' },
  roles: ['admin'] as string[],
  applications: [] as ApplicationItem[],
  count: 0,
  error: null as null | { message: string },
}));

vi.mock('../../app/lib/authServer', () => ({
  getServerUserAndRoles: async () => ({
    user: mockState.user,
    roles: mockState.roles,
  }),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    from: () => {
      const queryObj: Record<string, unknown> = {
        data: mockState.applications,
        error: mockState.error,
        count: mockState.count,
      };
      const methods = ['select', 'in', 'order', 'range', 'limit'];
      for (const m of methods) {
        queryObj[m] = vi.fn().mockReturnValue(queryObj);
      }
      return queryObj;
    },
    storage: {
      from: () => ({
        createSignedUrl: async () => ({
          data: { signedUrl: 'https://storage.test/signed-doc' },
          error: null,
        }),
      }),
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}));

vi.mock('../../app/components/AdminReviewControls', () => ({
  default: () => <div data-testid="admin-review-controls" />,
}));

describe('AdminTradespersonQueuePage (P5)', () => {
  afterEach(() => {
    cleanup();
    mockState.applications = [];
    mockState.count = 0;
    mockState.error = null;
  });

  it('renders explicit error alert when loading queue fails', async () => {
    mockState.error = { message: 'Database query timeout' };

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kuyruk yüklenemedi' })).toBeInTheDocument();
    expect(screen.queryByText('İncelenecek başvuru yok')).not.toBeInTheDocument();
  });

  it('renders empty queue message when no applications are waiting', async () => {
    mockState.applications = [];
    mockState.count = 0;

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('heading', { name: 'İncelenecek başvuru yok' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders application list when applications are present', async () => {
    mockState.applications = [
      {
        user_id: 'tp-1',
        display_name: 'Kemal Usta',
        bio: '15 yıllık sıhhi tesisat ustası.',
        application_status: 'submitted',
        submitted_at: '2026-09-20T10:00:00Z',
        review_note: null,
        tradesperson_services: [{ service_id: 'musluk-tamiri' }],
        tradesperson_service_areas: [{ district: 'Çankaya' }],
        tradesperson_documents: [],
        tradesperson_references: [],
      },
    ];
    mockState.count = 1;

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('heading', { name: 'Kemal Usta' })).toBeInTheDocument();
    expect(screen.getByText('15 yıllık sıhhi tesisat ustası.')).toBeInTheDocument();
    expect(screen.getByText('Çankaya')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders pagination when count exceeds page size', async () => {
    mockState.applications = Array.from({ length: 12 }, (_, i) => ({
      user_id: `tp-${i}`,
      display_name: `Usta ${i}`,
      bio: `Bio ${i}`,
      application_status: 'submitted',
      submitted_at: '2026-09-20T10:00:00Z',
      review_note: null,
      tradesperson_services: [],
      tradesperson_service_areas: [],
      tradesperson_documents: [],
      tradesperson_references: [],
    }));
    mockState.count = 25;

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('navigation', { name: /sayfa/i })).toBeInTheDocument();
  });

  it('highlights verified MYK certificate and public directory badge eligibility', async () => {
    mockState.applications = [
      {
        user_id: 'tp-verified',
        display_name: 'Ahmet Usta',
        bio: 'Sertifikalı elektrik teknisyeni.',
        application_status: 'approved',
        submitted_at: '2026-09-20T10:00:00Z',
        review_note: null,
        tradesperson_services: [{ service_id: 'elektrik-tesisati' }],
        tradesperson_service_areas: [{ district: 'Yenimahalle' }],
        tradesperson_documents: [
          {
            id: 'doc-myk-1',
            kind: 'professional_certificate',
            status: 'verified',
            original_name: 'MYK_Elektrik_Seviye4.pdf',
            expires_at: '2028-12-31',
            storage_path: 'docs/myk.pdf',
          },
        ],
        tradesperson_references: [],
      },
    ];
    mockState.count = 1;

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByText(/MYK \/ Ustalık Belgesi:/i)).toBeInTheDocument();
    expect(screen.getByText(/DOĞRULANDI/i)).toBeInTheDocument();
    expect(screen.getByText(/Geçerlilik: 2028-12-31/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamusal Dizin Doğrulama Rozetine Uygun/i)).toBeInTheDocument();
  });

  it('renders structured vocational credential box with certificate number and checklist', async () => {
    mockState.applications = [
      {
        user_id: 'tp-structured',
        display_name: 'Metin Usta',
        bio: 'MYK belgeli iklimlendirme ve kombi teknisyeni.',
        application_status: 'submitted',
        submitted_at: '2026-09-20T11:00:00Z',
        review_note: null,
        tradesperson_services: [{ service_id: 'kombi-bakimi' }],
        tradesperson_service_areas: [{ district: 'Keçiören' }],
        tradesperson_documents: [
          {
            id: 'doc-myk-2',
            kind: 'professional_certificate',
            status: 'pending',
            original_name: '[MYK-level_4-YB21/004812] kombi_ustalik.pdf',
            expires_at: '2029-06-30',
            storage_path: 'docs/myk_kombi.pdf',
          },
        ],
        tradesperson_references: [],
      },
    ];
    mockState.count = 1;

    render(await AdminTradespersonQueuePage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByText('Metin Usta')).toBeInTheDocument();
    expect(screen.getByText(/YB21\/004812/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Biçim Kontrolü Başarılı/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Ankara Saha Masası Yetki Alanı/)).toBeInTheDocument();
  });
});
