import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRobotsMetadata, isIndexingEnabled } from '../../app/lib/seoMetadata';
import robots from '../../app/robots';

const originalEnv = process.env.ORKESTRA_INDEXING_ENABLED;

afterEach(() => {
  vi.unstubAllEnvs();
  if (originalEnv === undefined) {
    delete process.env.ORKESTRA_INDEXING_ENABLED;
  } else {
    process.env.ORKESTRA_INDEXING_ENABLED = originalEnv;
  }
});

describe('P0.4 Pre-pilot SEO & Robots Gate', () => {
  it('defaults to noindex, nofollow and disallow all when ORKESTRA_INDEXING_ENABLED is not set', () => {
    delete process.env.ORKESTRA_INDEXING_ENABLED;
    expect(isIndexingEnabled()).toBe(false);

    const robotsMeta = getRobotsMetadata();
    expect(robotsMeta).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    });

    const robotsTxt = robots();
    expect(robotsTxt).toEqual({
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    });
  });

  it('defaults to noindex when ORKESTRA_INDEXING_ENABLED has any value other than true', () => {
    process.env.ORKESTRA_INDEXING_ENABLED = 'false';
    expect(isIndexingEnabled()).toBe(false);

    const robotsMeta = getRobotsMetadata();
    expect(robotsMeta.index).toBe(false);
    expect(robotsMeta.follow).toBe(false);

    const robotsTxt = robots();
    expect(robotsTxt.rules).toEqual({
      userAgent: '*',
      disallow: '/',
    });
  });

  it('allows indexing and protects private routes only when explicitly opted in via true', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ORKESTRA_DEPLOYMENT_ENV', 'production');
    process.env.ORKESTRA_INDEXING_ENABLED = 'true';
    expect(isIndexingEnabled()).toBe(true);

    const robotsMeta = getRobotsMetadata();
    expect(robotsMeta).toEqual({
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
      },
    });

    const robotsTxt = robots();
    expect(robotsTxt).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/yonetim/',
          '/hesap/',
          '/islerim/',
          '/taleplerim/',
          '/concepts/',
          '/inspiration/',
          '/motif-lab/',
        ],
      },
    });
  });

  it.each(['preview', 'staging', 'development', undefined])('blocks indexing in deployment %s even with a production build and opt-in', (deployment) => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ORKESTRA_DEPLOYMENT_ENV', deployment);
    vi.stubEnv('ORKESTRA_INDEXING_ENABLED', 'true');
    expect(getRobotsMetadata().index).toBe(false);
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' });
  });

  it('blocks a development runtime even when deployment and indexing are opted in', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ORKESTRA_DEPLOYMENT_ENV', 'production');
    vi.stubEnv('ORKESTRA_INDEXING_ENABLED', 'true');
    expect(isIndexingEnabled()).toBe(false);
  });
});
