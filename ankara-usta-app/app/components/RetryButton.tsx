'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button className="wizard-secondary" type="button" disabled={pending} aria-busy={pending}
    onClick={() => startTransition(() => router.refresh())}>{pending ? 'Yenileniyor…' : 'Yeniden dene'}</button>;
}
