import {beforeEach, expect, it, vi} from 'vitest';
import {GET} from '../../app/auth/callback/route';

const mocks = vi.hoisted(() => ({exchangeCodeForSession: vi.fn()}));
vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({auth: {exchangeCodeForSession: mocks.exchangeCodeForSession}}),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchangeCodeForSession.mockResolvedValue({error: null});
});

it('exchanges a PKCE code before redirecting to a safe local path', async () => {
  const response = await GET(new Request('http://localhost:4187/auth/callback?code=valid&next=/taleplerim'));
  expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith('valid');
  expect(response.headers.get('location')).toBe('http://localhost:4187/taleplerim');
});

it('allows a fragment-based recovery link to reach only the password page', async () => {
  const response = await GET(new Request('http://localhost:4187/auth/callback?next=/parola-yenile'));
  expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  expect(response.headers.get('location')).toBe('http://localhost:4187/parola-yenile');
});

it('keeps missing or failed codes on the neutral callback error route', async () => {
  const missing = await GET(new Request('http://localhost:4187/auth/callback?next=/taleplerim'));
  expect(missing.headers.get('location')).toBe('http://localhost:4187/giris?authError=callback&next=%2Ftaleplerim');

  mocks.exchangeCodeForSession.mockResolvedValue({error: {message: 'expired'}});
  const failed = await GET(new Request('http://localhost:4187/auth/callback?code=expired&next=/parola-yenile'));
  expect(failed.headers.get('location')).toBe('http://localhost:4187/giris?authError=callback&next=%2Fparola-yenile');
});

it('does not turn an external next value into a redirect target', async () => {
  const response = await GET(new Request('http://localhost:4187/auth/callback?next=https://attacker.example'));
  expect(response.headers.get('location')).toBe('http://localhost:4187/giris?authError=callback&next=%2Ftaleplerim');
});
