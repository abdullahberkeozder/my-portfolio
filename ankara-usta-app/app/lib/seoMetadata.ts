import type { Metadata } from 'next';

export type RobotsMetadata = NonNullable<Exclude<Metadata['robots'], string | null | undefined>>;

/**
 * Pre-pilot and preview environments default to noindex, nofollow.
 * Search engine indexing is only enabled when explicitly opted in
 * via ORKESTRA_INDEXING_ENABLED=true after real verified supply,
 * formal legal review, and operations SLA gates are satisfied.
 */
export function isIndexingEnabled(): boolean {
  return process.env.NODE_ENV === 'production'
    && process.env.ORKESTRA_DEPLOYMENT_ENV === 'production'
    && process.env.ORKESTRA_INDEXING_ENABLED === 'true';
}

export function getRobotsMetadata(): RobotsMetadata {
  const enabled = isIndexingEnabled();
  return {
    index: enabled,
    follow: enabled,
    nocache: !enabled,
    googleBot: {
      index: enabled,
      follow: enabled,
      noimageindex: !enabled,
    },
  };
}
