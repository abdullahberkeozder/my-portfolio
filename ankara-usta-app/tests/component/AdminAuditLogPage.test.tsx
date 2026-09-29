import { render, screen, cleanup, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminAuditLogPage from '../../app/yonetim/denetim-izi/page';

type AuditItem = {
  id: number;
  actor_id: string | null;
  actor_type: 'user' | 'system';
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

const mockState = vi.hoisted(() => ({
  user: { id: 'admin-1', email: 'admin@example.com' },
  roles: ['admin'] as string[],
  logs: [] as AuditItem[],
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
        data: mockState.logs,
        error: mockState.error,
        count: mockState.count,
      };
      const methods = ['select', 'eq', 'order', 'range', 'limit'];
      for (const m of methods) {
        queryObj[m] = vi.fn().mockReturnValue(queryObj);
      }
      return queryObj;
    },
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Admin Audit Log Page (app/yonetim/denetim-izi/page.tsx)', () => {
  afterEach(() => {
    cleanup();
    mockState.logs = [];
    mockState.count = 0;
    mockState.error = null;
  });

  it('renders header, admin tabs and empty state when no audit records exist', async () => {
    mockState.logs = [];
    mockState.count = 0;

    render(await AdminAuditLogPage());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Değiştirilemez Denetim İzi (Audit Log)');
    const adminNav = screen.getByRole('navigation', { name: 'Yönetim Sekmeleri' });
    expect(within(adminNav).getByRole('link', { name: /Usta Başvuruları/i })).toHaveAttribute('href', '/yonetim/usta-basvurulari');
    expect(within(adminNav).getByRole('link', { name: /Uyuşmazlıklar/i })).toHaveAttribute('href', '/yonetim/uyusmazliklar');
  });

  it('renders audit entries with actor, action, note, and diff summary', async () => {
    mockState.logs = [
      {
        id: 101,
        actor_id: 'admin-1111-2222',
        actor_type: 'user',
        action: 'UPDATE',
        entity_type: 'tradesperson_profiles',
        entity_id: 'tp-user-9999',
        before_data: { application_status: 'under_review' },
        after_data: { application_status: 'approved', review_note: 'MYK belgesi ve referanslar doğrulandı.' },
        created_at: '2026-09-28T14:30:00Z',
      },
      {
        id: 102,
        actor_id: null,
        actor_type: 'system',
        action: 'tradesperson_document_expired',
        entity_type: 'tradesperson_documents',
        entity_id: 'doc-8888',
        before_data: { status: 'verified' },
        after_data: { status: 'expired', reason: 'Otomatik günlük süre sonu tetiklendi.' },
        created_at: '2026-09-29T00:00:00Z',
      },
    ];
    mockState.count = 2;

    render(await AdminAuditLogPage());

    expect(screen.getByText(/Yönetici \(admin-11\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistem \(Otomatik Görev\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MYK belgesi ve referanslar doğrulandı\./i)).toBeInTheDocument();
    expect(screen.getByText(/Otomatik günlük süre sonu tetiklendi\./i)).toBeInTheDocument();
    expect(screen.getByText(/under_review/i)).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('renders error state when database query fails', async () => {
    mockState.error = { message: 'DB connection interrupted' };

    render(await AdminAuditLogPage());

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Denetim Kayıtları Yüklenemedi')).toBeInTheDocument();
  });
});
