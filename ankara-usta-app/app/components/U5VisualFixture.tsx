'use client';

import Link from 'next/link';
import { useState } from 'react';

export type U5VisualFixtureKind = 'empty' | 'partial-error' | 'expired' | 'direct-link';
type Props = { audience: 'customer' | 'tradesperson'; kind: U5VisualFixtureKind; view: 'open' | 'direct'; onRetry?: () => void | Promise<void> };

const copy: Record<U5VisualFixtureKind, { title: string; body: string }> = {
  empty: { title: 'Henüz kayıt yok', body: 'İlk talebinizi oluşturarak çalışma alanınızı başlatabilirsiniz.' },
  'partial-error': { title: 'Bazı bilgiler eksik', body: 'Listeyi gösterdik; özet bilgiler için yeniden deneyebilirsiniz.' },
  expired: { title: 'Bağlantının süresi doldu', body: 'Güvenli devam etmek için yeni bir bağlantı oluşturun.' },
  'direct-link': { title: 'Doğrudan iş bağlantısı', body: 'Bu alan yalnızca ilgili hesapla görüntülenebilir.' },
};

export function RetryButton({ onRetry }: { onRetry?: () => void | Promise<void> }) {
  const [isPending, setIsPending] = useState(false);

  const handleRetry = async () => {
    setIsPending(true);
    try {
      if (onRetry) {
        await onRetry();
        setIsPending(false);
      } else if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
        window.location.reload();
      }
    } catch {
      setIsPending(false);
    }
  };

  return (
    <button type="button" onClick={handleRetry} disabled={isPending} aria-busy={isPending}>
      Yeniden dene
    </button>
  );
}

export function U5VisualFixture({ audience, kind, view, onRetry }: Props) {
  const item = copy[kind];
  return <main data-testid="u5-visual-fixture" data-audience={audience} data-view={view} className="u5-visual-fixture"><span className="u5-kicker">{audience === 'customer' ? 'MÜŞTERİ ALANI' : 'USTA ALANI'}</span><h1>{item.title}</h1><p>{item.body}</p>{kind === 'partial-error' && <RetryButton onRetry={onRetry} />}<Link href={audience === 'customer' ? '/#services' : '/ustalar'}>Güvenli alana dön</Link></main>;
}
