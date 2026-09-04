'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {announceAccountChange} from '../hooks/useAccountSummary';
import {z} from 'zod';

export default function AccountSignOut({buttonClassName = 'dialog-primary'}: {buttonClassName?: string}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST',signal:AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Oturum kapatılamadı.');
      const result=z.object({success:z.boolean()}).parse(await response.json());
      if(result.success!==true)throw new Error('Oturum kapatılamadı.');
      announceAccountChange();
      router.replace('/giris');
      router.refresh();
    } catch {
      setError('Oturum kapatılamadı. Lütfen tekrar deneyin.');
      setBusy(false);
    }
  }

  return <div><button type="button" className={buttonClassName} disabled={busy} onClick={() => void signOut()}>{busy ? 'Çıkılıyor…' : 'Oturumu kapat'}</button>{error && <p className="account-message" role="alert">{error}</p>}</div>;
}
