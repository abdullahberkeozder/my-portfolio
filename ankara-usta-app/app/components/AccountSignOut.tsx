'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AccountSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (!response.ok) throw new Error('Oturum kapatılamadı.');
      router.replace('/giris');
      router.refresh();
    } catch {
      setError('Oturum kapatılamadı. Lütfen tekrar deneyin.');
      setBusy(false);
    }
  }

  return <div><button type="button" className="dialog-primary" disabled={busy} onClick={() => void signOut()}>{busy ? 'Çıkılıyor…' : 'Oturumu kapat'}</button>{error && <p className="account-message" role="alert">{error}</p>}</div>;
}
