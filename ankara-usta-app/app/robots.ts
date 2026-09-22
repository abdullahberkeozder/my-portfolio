import type { MetadataRoute } from 'next';
import { isIndexingEnabled } from './lib/seoMetadata';

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
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
  };
}
