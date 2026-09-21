import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminReviewControls from '../../app/components/AdminReviewControls';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe('AdminReviewControls (P4)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const baseDocuments = [
    {
      id: 'doc-1',
      kind: 'professional_certificate',
      status: 'pending',
      original_name: 'ustalik_belgesi.pdf',
      expires_at: null,
      signedUrl: 'https://storage.example.com/signed/ustalik_belgesi.pdf?token=abc',
    },
    {
      id: 'doc-2',
      kind: 'identity',
      status: 'verified',
      original_name: 'kimlik.pdf',
      expires_at: null,
      signedUrl: 'https://storage.example.com/signed/kimlik.pdf?token=xyz',
    },
  ];

  const baseReferences = [
    {
      id: 'ref-1',
      reference_name: 'Mehmet Yılmaz',
      relationship: 'Önceki Müşteri',
      status: 'pending',
    },
  ];

  it('renders documents with signed URLs, kind labels, and verification contract notice', () => {
    render(
      <AdminReviewControls
        tradespersonId="tp-1"
        status="under_review"
        documents={baseDocuments}
        references={[]}
      />
    );

    expect(screen.getByText('ustalik_belgesi.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Mesleki Yeterlilik \/ Ustalık Belgesi/)).toBeInTheDocument();

    const previewLinks = screen.getAllByRole('link', { name: 'Belgeyi Görüntüle ↗' });
    expect(previewLinks[0]).toHaveAttribute('href', 'https://storage.example.com/signed/ustalik_belgesi.pdf?token=abc');
    expect(previewLinks[0]).toHaveAttribute('target', '_blank');

    expect(screen.getByText(/Mesleki Belge \(professional_certificate\) doğrulanıp süresi geçerli olduğunda/)).toBeInTheDocument();
  });

  it('requires an operator review note before enabling document verification', async () => {
    render(
      <AdminReviewControls
        tradespersonId="tp-1"
        status="under_review"
        documents={baseDocuments}
        references={[]}
      />
    );

    const verifyBtn = screen.getByRole('button', { name: 'Belgeyi Doğrula' });
    expect(verifyBtn).toBeDisabled();

    const noteInput = screen.getByLabelText(/İnceleme notu/);
    await userEvent.type(noteInput, 'Belge aslı ve karekodu kontrol edildi, onaylandı.');

    expect(verifyBtn).toBeEnabled();
  });

  it('submits document verification with expiresAt date to backend review API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AdminReviewControls
        tradespersonId="tp-1"
        status="under_review"
        documents={baseDocuments}
        references={[]}
      />
    );

    const noteInput = screen.getByLabelText(/İnceleme notu/);
    await userEvent.type(noteInput, 'Mesleki belge geçerli.');

    const expiryInput = screen.getByLabelText('Son Geçerlilik');
    await userEvent.type(expiryInput, '2028-12-31');

    const verifyBtn = screen.getByRole('button', { name: 'Belgeyi Doğrula' });
    await userEvent.click(verifyBtn);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/documents/doc-1/review',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'verified',
          note: 'Mesleki belge geçerli.',
          expiresAt: '2028-12-31',
        }),
      })
    );

    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('submits application decision (approve / needs_changes / reject) with note', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AdminReviewControls
        tradespersonId="tp-1"
        status="under_review"
        documents={baseDocuments}
        references={[]}
      />
    );

    const actionsContainer = screen.getByRole('button', { name: 'Onayla' }).parentElement!;
    const approveBtn = screen.getByRole('button', { name: 'Onayla' });
    const needsChangesBtn = screen.getByRole('button', { name: 'Düzeltme iste' });
    const rejectBtn = actionsContainer.querySelector('button:last-child')!;

    expect(approveBtn).toBeDisabled();
    expect(needsChangesBtn).toBeDisabled();
    expect(rejectBtn).toBeDisabled();

    const noteInput = screen.getByLabelText(/İnceleme notu/);
    await userEvent.type(noteInput, 'Tüm belgeler kontrol edildi ve onaylandı.');

    expect(approveBtn).toBeEnabled();
    await userEvent.click(approveBtn);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/tradespeople/tp-1/review',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          note: 'Tüm belgeler kontrol edildi ve onaylandı.',
        }),
      })
    );
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('allows verifying pending references with operator note', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AdminReviewControls
        tradespersonId="tp-1"
        status="under_review"
        documents={[]}
        references={baseReferences}
      />
    );

    expect(screen.getByText('Mehmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText(/Önceki Müşteri/)).toBeInTheDocument();

    const noteInput = screen.getByLabelText(/İnceleme notu/);
    await userEvent.type(noteInput, 'Referans telefon ile teyit edildi.');

    const verifyBtn = screen.getByRole('button', { name: 'Doğrula' });
    await userEvent.click(verifyBtn);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/references/ref-1/review',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'verified',
          note: 'Referans telefon ile teyit edildi.',
        }),
      })
    );
  });
});
