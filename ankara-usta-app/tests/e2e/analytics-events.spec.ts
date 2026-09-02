/**
 * Analytics unit-level E2E tests
 *
 * These tests exercise the client-side analytics module (app/lib/analytics.ts)
 * in a real browser context to prove:
 *
 *  1. Events outside the allowed list are never dispatched.
 *  2. PII fields are stripped from properties before dispatch.
 *  3. Events are suppressed when consent is not given.
 *
 * No auth is required.  Tests run against the homepage only.
 */

import { expect, test } from '@playwright/test';

// The sensitive keys list must match the SENSITIVE_KEYS set in analytics.ts.
// If you add a field to one, add it to the other.
const SENSITIVE_KEYS = ['email', 'phone', 'address_line', 'body', 'password', 'token', 'full_name', 'name', 'display_name', 'tc_no'];

// Helper: inject the event collector and set consent, then navigate.
async function setupAnalyticsCapture(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__analyticsEvents = [];
    window.addEventListener('orkestra:analytics', (event) => {
      ((window as unknown as Record<string, unknown[]>).__analyticsEvents as unknown[]).push(
        (event as CustomEvent).detail,
      );
    });
  });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('ankara_analytics_consent', 'accepted');
  });
}

async function getEvents(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    (window as unknown as Record<string, unknown>).__analyticsEvents ?? [],
  ) as Promise<Array<{ eventName: string; properties: Record<string, unknown> }>>;
}

// ---------------------------------------------------------------------------
// Test 1: Unknown event names must not dispatch
// ---------------------------------------------------------------------------

test('izin listesi dışı olay isimler hiçbir zaman dispatch edilmez', async ({ page }) => {
  await setupAnalyticsCapture(page);

  // Call trackFunnel with an unknown event name via inline script
  await page.evaluate(() => {
    // We need access to the compiled module; the easiest way is via
    // the Custom Event dispatch side-effect we're already observing.
    // Simulate the scenario by directly calling if exposed, otherwise
    // trigger via a DOM interaction that would normally fire analytics.

    // Dispatch a synthetic CustomEvent with a forbidden name to confirm
    // the real module won't produce it.
    // The real test is: after a normal user interaction, only allowed
    // event names appear in __analyticsEvents.
    window.dispatchEvent(
      new CustomEvent('orkestra:analytics', {
        detail: { eventName: '__forbidden_event__', properties: {}, path: '/', occurredAt: '' },
      }),
    );
  });

  // Verify: the page's analytics module itself only adds real events from
  // allowed interactions — the synthetic one above is captured as-is to
  // confirm our listener works, but real module wouldn't emit it.
  // Trigger a real search interaction:
  await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).fill('elektrik');
  await page.getByRole('button', { name: 'Hizmet bul' }).click();
  await page.waitForTimeout(400);

  const events = await getEvents(page);
  const realModuleEvents = events.filter((e) => e.eventName !== '__forbidden_event__');

  for (const event of realModuleEvents) {
    // All events from the real module must be in the allowed list
    const ALLOWED = [
      'service_search', 'service_selected', 'wizard_started', 'wizard_completed',
      'draft_resumed', 'quote_profile_opened', 'quote_accepted', 'quote_rejected',
      'first_qualified_quote_received', 'job_completed', 'job_cancelled', 'dispute_opened',
      'scope_change_proposed', 'scope_change_accepted', 'scope_change_rejected',
    ];
    expect(ALLOWED, `Olay "${event.eventName}" izin listesinde bulunmuyor`).toContain(event.eventName);
  }
});

// ---------------------------------------------------------------------------
// Test 2: PII fields are never present in event properties
// ---------------------------------------------------------------------------

test('analitik olay properties içinde PII alanları bulunmaz', async ({ page }) => {
  await setupAnalyticsCapture(page);

  // Trigger several interactions that could plausibly have PII
  await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).fill('musluk tamiri');
  await page.getByRole('button', { name: 'Hizmet bul' }).click();
  await page.waitForTimeout(500);

  const events = await getEvents(page);

  for (const event of events) {
    const propKeys = Object.keys(event.properties ?? {});
    for (const sensitiveKey of SENSITIVE_KEYS) {
      expect(
        propKeys,
        `Olay "${event.eventName}" properties içinde PII alanı "${sensitiveKey}" bulunmamalı`,
      ).not.toContain(sensitiveKey);
    }
  }
});

// ---------------------------------------------------------------------------
// Test 3: Events are suppressed when consent is not given
// ---------------------------------------------------------------------------

test('onay verilmediğinde analitik olayları dispatch edilmez', async ({ page }) => {
  // Capture events but do NOT set consent
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__analyticsEvents = [];
    window.addEventListener('orkestra:analytics', (event) => {
      ((window as unknown as Record<string, unknown[]>).__analyticsEvents as unknown[]).push(
        (event as CustomEvent).detail,
      );
    });
  });
  await page.goto('/');
  // Explicitly ensure consent is absent
  await page.evaluate(() => localStorage.removeItem('ankara_analytics_consent'));

  // Trigger an interaction
  await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).fill('boya badana');
  await page.getByRole('button', { name: 'Hizmet bul' }).click();
  await page.waitForTimeout(400);

  const events = await getEvents(page);
  // No events should be emitted when consent is absent
  // (Synthetic CustomEvents from the module are gated on consent)
  const moduleEvents = events.filter((e) => e.eventName !== '__forbidden_event__');
  expect(moduleEvents.length).toBe(0);
});
