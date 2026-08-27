'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function authenticate(mode: 'sign-in' | 'sign-up') {
    setBusy(true);
    setMessage('');
    const supabase = createSupabaseBrowserClient();
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({email, password})
      : await supabase.auth.signUp({email, password});
    setBusy(false);

    if (result.error) return setMessage(result.error.message);
    if (mode === 'sign-up' && !result.data.session) {
      return setMessage('Hesabınızı etkinleştirmek için e-postanızı kontrol edin.');
    }
    router.push('/taleplerim');
    router.refresh();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void authenticate('sign-in');
  }

  return <main className="account-shell"><Link className="account-back" href="/">← Ankara Usta</Link><section className="account-card"><span>MÜŞTERİ HESABI</span><h1>Talebinizi kaydedin</h1><p>Taslaklarınız ve gönderdiğiniz işler yalnızca hesabınızda görünür.</p><form onSubmit={submit}><label>E-posta<input type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)}/></label><label>Parola<input type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(event)=>setPassword(event.target.value)}/></label>{message&&<p className="account-message" role="status">{message}</p>}<button className="dialog-primary" disabled={busy} type="submit">Giriş yap</button><button className="wizard-secondary" disabled={busy} type="button" onClick={()=>void authenticate('sign-up')}>Yeni hesap oluştur</button></form></section></main>;
}
