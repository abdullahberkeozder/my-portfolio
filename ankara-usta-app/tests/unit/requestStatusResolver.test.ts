import { describe, expect, it } from 'vitest';
import {
  REQUEST_STATUS_DICTIONARY,
  resolveCustomerRequestAction,
  resolveTradespersonOpportunityAction,
} from '../../app/lib/requestStatusResolver';

describe('REQUEST_STATUS_DICTIONARY (SSOT)', () => {
  const expectedStatuses = [
    'draft',
    'submitted',
    'matching',
    'quotes_received',
    'provider_selected',
    'completed',
    'cancelled',
    'expired',
  ];

  it('contains valid label, tone, and description for all core statuses', () => {
    for (const status of expectedStatuses) {
      const meta = REQUEST_STATUS_DICTIONARY[status];
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(['neutral', 'info', 'success', 'warning', 'danger', 'accent']).toContain(meta.tone);
      expect(meta.description).toBeTruthy();
    }
  });
});

describe('resolveCustomerRequestAction (P1.1 & U5-01)', () => {
  it('resolves draft request with no primary action (handled by DraftActions)', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-draft',
      status: 'draft',
      isDraft: true,
    });
    expect(res.primaryAction).toBeNull();
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBeNull();
  });

  it('resolves quotes_received with single primary CTA and eliminates duplicate link (P1.1)', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-quotes',
      status: 'quotes_received',
      quoteCount: 3,
    });
    expect(res.primaryAction).toEqual({
      label: 'Teklifleri Karşılaştır (3) →',
      href: '/taleplerim/req-quotes/teklifler',
      variant: 'primary',
    });
    // Critical P1.1 rule: No secondary link pointing to the same /teklifler URL!
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBeNull();
  });

  it('resolves quotes_received without quoteCount gracefully', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-quotes-zero',
      status: 'quotes_received',
    });
    expect(res.primaryAction?.label).toBe('Teklifleri Karşılaştır →');
    expect(res.secondaryAction).toBeNull();
  });

  it('resolves provider_selected with verified jobId to active job screen', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-selected',
      status: 'provider_selected',
      jobId: 'job-verified-1',
    });
    expect(res.primaryAction).toEqual({
      label: 'İş Ekranına Git →',
      href: '/islerim/job-verified-1',
      variant: 'primary',
    });
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBeNull();
  });

  it('resolves provider_selected without verified jobId to jobs fallback with warning helper', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-selected-nojob',
      status: 'provider_selected',
      jobId: null,
    });
    expect(res.primaryAction).toEqual({
      label: 'İşlerimde Kontrol Et →',
      href: '/islerim',
      variant: 'primary',
    });
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBe('İş bağlantısı henüz doğrulanamadı.');
  });

  it('resolves expired request with recovery primary CTA and distinct detail secondary CTA', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-expired',
      status: 'expired',
    });
    expect(res.primaryAction).toEqual({
      label: 'Yeni Talep Oluştur →',
      href: '/#services',
      variant: 'secondary',
    });
    expect(res.secondaryAction).toEqual({
      label: 'Talep ayrıntıları',
      href: '/taleplerim/req-expired/teklifler',
      variant: 'neutral',
    });
    expect(res.helperText).toBeNull();
  });

  it('resolves cancelled request identical to expired recovery', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-cancelled',
      status: 'cancelled',
    });
    expect(res.primaryAction?.label).toBe('Yeni Talep Oluştur →');
    expect(res.secondaryAction?.label).toBe('Talep ayrıntıları');
  });

  it('resolves completed request with jobId to job room and detail secondary CTA', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-completed',
      status: 'completed',
      jobId: 'job-done-1',
    });
    expect(res.primaryAction).toEqual({
      label: 'Tamamlanan İşi İncele →',
      href: '/islerim/job-done-1',
      variant: 'secondary',
    });
    expect(res.secondaryAction).toEqual({
      label: 'Talep ayrıntıları',
      href: '/taleplerim/req-completed/teklifler',
      variant: 'neutral',
    });
    expect(res.helperText).toBeNull();
  });

  it('resolves completed request without jobId to detail secondary CTA', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-completed-nojob',
      status: 'completed',
    });
    expect(res.primaryAction).toEqual({
      label: 'Talep ayrıntıları →',
      href: '/taleplerim/req-completed-nojob/teklifler',
      variant: 'secondary',
    });
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBeNull();
  });

  it('resolves submitted or matching request to tracking page', () => {
    const res = resolveCustomerRequestAction({
      requestId: 'req-matching',
      status: 'matching',
    });
    expect(res.primaryAction).toEqual({
      label: 'Eşleşme ve teklifler →',
      href: '/taleplerim/req-matching/teklifler',
      variant: 'secondary',
    });
    expect(res.secondaryAction).toBeNull();
  });
});

describe('resolveTradespersonOpportunityAction (U5-01)', () => {
  it('resolves accepted quote to job workspace with verified jobId', () => {
    const res = resolveTradespersonOpportunityAction({
      requestId: 'req-opp-1',
      myQuote: { id: 'quote-win', status: 'accepted', version: 1 },
      jobId: 'job-win-100',
    });
    expect(res.primaryAction).toEqual({
      label: 'İş Ekranına Git →',
      href: '/islerim/job-win-100',
      variant: 'primary',
    });
    expect(res.helperText).toBeNull();
  });

  it('resolves accepted quote without jobId to fallback with notice', () => {
    const res = resolveTradespersonOpportunityAction({
      requestId: 'req-opp-1',
      myQuote: { id: 'quote-win', status: 'accepted', version: 1 },
      jobId: null,
    });
    expect(res.primaryAction?.href).toBe('/islerim');
    expect(res.helperText).toBe('İş bağlantısı henüz doğrulanamadı.');
  });

  it('resolves opportunityClosed without any clickable action', () => {
    const res = resolveTradespersonOpportunityAction({
      requestId: 'req-opp-closed',
      opportunityClosed: true,
    });
    expect(res.primaryAction).toBeNull();
    expect(res.secondaryAction).toBeNull();
    expect(res.helperText).toBe('Bu fırsat için yeni işlem yapılamaz');
  });

  it('resolves already submitted quote to review/update action', () => {
    const res = resolveTradespersonOpportunityAction({
      requestId: 'req-opp-active',
      myQuote: { id: 'quote-active', status: 'submitted', version: 2 },
    });
    expect(res.primaryAction).toEqual({
      label: 'Teklifi İncele / Güncelle →',
      href: '/usta/teklifler/req-opp-active',
      variant: 'secondary',
    });
  });

  it('resolves new unquoted opportunity to review/quote primary action', () => {
    const res = resolveTradespersonOpportunityAction({
      requestId: 'req-opp-new',
      myQuote: null,
    });
    expect(res.primaryAction).toEqual({
      label: 'Talebi İncele / Teklif Ver →',
      href: '/usta/teklifler/req-opp-new',
      variant: 'primary',
    });
  });
});
