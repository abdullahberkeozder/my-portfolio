import {afterEach, describe, expect, it} from 'vitest';
import {getSupabaseConfig, hasSupabaseConfig} from '../../app/lib/supabase/config';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;

  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe('Supabase configuration boundary', () => {
  it('reports missing configuration without manufacturing fallback credentials', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(hasSupabaseConfig()).toBe(false);
    expect(() => getSupabaseConfig()).toThrow('Supabase environment variables are not configured.');
  });

  it('returns an explicitly configured public endpoint and key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_example';

    expect(hasSupabaseConfig()).toBe(true);
    expect(getSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'sb_publishable_example',
    });
  });
});
