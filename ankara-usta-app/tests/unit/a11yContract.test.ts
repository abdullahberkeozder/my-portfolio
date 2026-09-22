import { describe, expect, it } from 'vitest';
import { REQUEST_STATUS_DICTIONARY, resolveCustomerRequestAction, resolveTradespersonOpportunityAction } from '../../app/lib/requestStatusResolver';
import { navigationItems, NavigationContext } from '../../app/lib/navigationModel';

describe('A11Y Contract: WCAG 2.5.3 (Label in Name) & Status Accessibility', () => {
  it('all REQUEST_STATUS_DICTIONARY entries have descriptive, non-empty labels and tones', () => {
    for (const meta of Object.values(REQUEST_STATUS_DICTIONARY)) {
      expect(meta.label.trim().length).toBeGreaterThan(0);
      expect(meta.description.trim().length).toBeGreaterThan(0);
      expect(['neutral', 'info', 'success', 'warning', 'danger', 'accent']).toContain(meta.tone);
    }
  });

  it('customer action resolution satisfies WCAG 2.5.3 (ariaLabel includes visible label if defined)', () => {
    const statuses = ['draft', 'submitted', 'matching', 'quotes_received', 'provider_selected', 'completed', 'cancelled', 'expired'];
    for (const status of statuses) {
      const resWithJob = resolveCustomerRequestAction({ requestId: 'req-1', status, quoteCount: 2, jobId: 'job-1' });
      for (const action of [resWithJob.primaryAction, resWithJob.secondaryAction]) {
        if (action?.ariaLabel) {
          expect(action.ariaLabel.toLowerCase()).toContain(action.label.toLowerCase());
        }
      }

      const resNoJob = resolveCustomerRequestAction({ requestId: 'req-1', status, quoteCount: 2 });
      for (const action of [resNoJob.primaryAction, resNoJob.secondaryAction]) {
        if (action?.ariaLabel) {
          expect(action.ariaLabel.toLowerCase()).toContain(action.label.toLowerCase());
        }
      }
    }
  });

  it('tradesperson opportunity resolution satisfies WCAG 2.5.3 (ariaLabel includes visible label if defined)', () => {
    const cases = [
      { requestId: 'req-1', myQuote: null },
      { requestId: 'req-1', myQuote: { id: 'q-1', status: 'submitted' } },
      { requestId: 'req-1', myQuote: { id: 'q-2', status: 'accepted' }, jobId: 'job-1' },
      { requestId: 'req-1', opportunityClosed: true },
    ];
    for (const c of cases) {
      const res = resolveTradespersonOpportunityAction(c);
      for (const action of [res.primaryAction, res.secondaryAction]) {
        if (action?.ariaLabel) {
          expect(action.ariaLabel.toLowerCase()).toContain(action.label.toLowerCase());
        }
      }
    }
  });

  it('navigationItems never return duplicate hrefs or empty labels for any context', () => {
    const contexts: NavigationContext[] = ['public', 'customer', 'professional', 'operations', 'auth', 'reference'];
    for (const ctx of contexts) {
      const items = navigationItems(ctx, true);
      const hrefs = items.map(i => i.href);
      const uniqueHrefs = new Set(hrefs);
      expect(uniqueHrefs.size).toBe(hrefs.length);

      for (const item of items) {
        expect(item.label.trim().length).toBeGreaterThan(0);
        expect(item.href.startsWith('/') || item.href.startsWith('#')).toBe(true);
      }
    }
  });
});
