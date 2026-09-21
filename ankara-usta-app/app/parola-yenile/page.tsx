'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import type {AuthChangeEvent, Session, User} from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import NeighborhoodBond from '../components/NeighborhoodBond';

export default function PasswordUpdatePage() {
  const [client] = useState<ReturnType<typeof createSupabaseBrowserClient>>(() => createSupabaseBrowserClient());
  const [recoveryState, setRecoveryState] = useState<'checking' | 'ready' | 'invalid' | 'success'>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const {data: {subscription}} = client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active && session?.user) setRecoveryState(current => current === 'success' ? current : 'ready');
    });

    void (async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const isRecovery = fragment.get('type') === 'recovery';
      const accessToken = fragment.get('access_token');
      const refreshToken = fragment.get('refresh_token');

      if (isRecovery && accessToken && refreshToken) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        const {error} = await client.auth.setSession({access_token: accessToken, refresh_token: refreshToken});
        if (error) {
          if (active) setRecoveryState('invalid');
          return;
        }
      }

      const {data}: {data: {user: User | null}} = await client.auth.getUser();
      if (active) setRecoveryState(data.user ? 'ready' : 'invalid');
    })().catch(() => {
      if (active) setRecoveryState('invalid');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      return setMessage({ type: 'error', text: 'Girdiğiniz parolalar birbiriyle eşleşmiyor.' });
    }
    if (password.length < 8) {
      return setMessage({ type: 'error', text: 'Parolanız en az 8 karakter uzunluğunda olmalıdır.' });
    }

    setBusy(true);
    setMessage(null);
    const { error } = await client.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage({ type: 'error', text: 'Parola güncellenemedi. Sıfırlama bağlantısının süresi dolmuş olabilir.' });
    } else {
      setPassword('');
      setConfirmation('');
      setRecoveryState('success');
      setMessage({ type: 'success', text: 'Parolanız başarıyla güncellendi.' });
    }
  }

  return (
    <main className="account-shell">
      <header className="account-top-bar">
        <Link className="account-back-link" href="/giris">
          ← Giriş Sayfasına Dön
        </Link>
        <div className="account-brand-pill">
          <NeighborhoodBond variant="brand" className="account-brand-icon" />
          <span>ORKESTRA</span>
        </div>
      </header>

      <div className="account-card-wrapper">
        <section className="account-card">
          <div className="account-card-header">
            <span className="account-eyebrow">HESAP GÜVENLİĞİ</span>
            <h1 className="account-title">Yeni Parolanızı Belirleyin</h1>
            <p className="account-subtitle">
              Hesabınızın güvenliği için en az 8 karakterden oluşan güçlü bir parola seçin.
            </p>
          </div>

          {recoveryState === 'checking' && (
            <div className="account-alert-box" role="status" aria-live="polite">
              Sıfırlama bağlantısı doğrulanıyor…
            </div>
          )}

          {recoveryState === 'invalid' && (
            <div className="account-form">
              <div className="account-alert-box alert-error" role="alert">
                Bu sıfırlama bağlantısı geçersiz veya süresi dolmuş. Giriş sayfasından yeni bir bağlantı isteyin.
              </div>
              <Link href="/giris" className="dialog-primary account-submit-btn">
                Yeni bağlantı iste
              </Link>
            </div>
          )}

          {recoveryState === 'success' && message && (
            <div className="account-form">
              <div className="account-alert-box alert-success" role="status" aria-live="polite">
                <span className="alert-icon" aria-hidden="true">✓</span>
                <span>{message.text}</span>
              </div>
              <Link href="/hesap" className="dialog-primary account-submit-btn">
                Hesabıma git
              </Link>
            </div>
          )}

          {recoveryState === 'ready' && <form className="account-form" onSubmit={submit}>
            <div className="form-field-group">
              <label htmlFor="reset-new-password">Yeni Parola</label>
              <div className="password-input-wrap">
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="En az 8 karakter"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="reset-confirm-password">Yeni Parola (Tekrar)</label>
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Parolayı tekrar girin"
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
              />
            </div>

            {message && (
              <div className={`account-alert-box alert-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
                <span className="alert-icon" aria-hidden="true">{message.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{message.text}</span>
              </div>
            )}

            <button className="dialog-primary account-submit-btn" disabled={busy} type="submit">
              {busy ? 'Güncelleniyor…' : 'Parolayı güncelle'}
            </button>
          </form>}

          <footer className="account-card-footer">
            <p>
              Giriş ekranına dönmek mi istiyorsunuz?{' '}
              <Link href="/giris" className="footer-action-link">
                Giriş Yap →
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

