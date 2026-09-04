import { expect, it } from 'vitest';
import { navigationActive, navigationContext, navigationItems } from '../../app/lib/navigationModel';
it('does not confuse public professional profiles with the professional workspace', () => {
  expect(navigationContext('/ustalar')).toBe('public');
  expect(navigationContext('/ustalar/123')).toBe('public');
  expect(navigationContext('/usta/talepler')).toBe('professional');
  expect(navigationContext('/usta/kayit')).toBe('auth');
});
it('covers shared detail screens and operations without using navigation as authorization', () => {
  for(const path of ['/teklifler/1','/gorusmeler/1/2','/uyusmazliklar/1','/hesap']) expect(navigationContext(path)).toBe('customer');
  expect(navigationContext('/yonetim/moderasyon')).toBe('operations');
  expect(navigationContext('/inspiration')).toBe('reference');
});
it('keeps gated chat off navigation and preserves active route boundaries', () => {
  expect(navigationItems('customer').some(link=>link.href==='/gorusmeler')).toBe(false);
  expect(navigationItems('customer',true).some(link=>link.href==='/gorusmeler')).toBe(true);
  expect(navigationActive('/taleplerim/1/teklifler','/taleplerim')).toBe(true);
  expect(navigationActive('/ustalar','/usta')).toBe(false);
});
