'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import NeighborhoodBond from '../components/NeighborhoodBond';

export default function PasswordUpdatePage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

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
    const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage({ type: 'error', text: 'Parola güncellenemedi. Sıfırlama bağlantısının süresi dolmuş olabilir.' });
    } else {
      setMessage({ type: 'success', text: 'Parolanız başarıyla güncellendi! Artık yeni parolanızla giriş yapabilirsiniz.' });
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

          <form className="account-form" onSubmit={submit}>
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
              <div className={`account-alert-box alert-${message.type}`} role="status">
                <span className="alert-icon">{message.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{message.text}</span>
              </div>
            )}

            <button className="dialog-primary account-submit-btn" disabled={busy} type="submit">
              {busy ? 'Güncelleniyor…' : 'Parolayı Güncelle ve Giriş Yap →'}
            </button>
          </form>

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

