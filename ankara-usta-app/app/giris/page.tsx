'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { landingPathForRoles, safeNextPath } from '../lib/authRedirect';
import NeighborhoodBond from '../components/NeighborhoodBond';

export default function SignInPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function requestedPath() {
    if (typeof window === 'undefined') return null;
    return safeNextPath(new URLSearchParams(window.location.search).get('next'));
  }

  async function authenticate(mode: 'sign-in' | 'sign-up') {
    setBusy(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const result = mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      setBusy(false);

      if (result.error) {
        return setMessage({ type: 'error', text: result.error.message });
      }

      if (mode === 'sign-up' && !result.data.session) {
        return setMessage({
          type: 'success',
          text: 'Hesabınız oluşturuldu! Etkinleştirmek için e-posta adresinize gelen bağlantıya tıklayın.'
        });
      }

      const { data: rolesResult } = await supabase.from('user_roles').select('role');
      const targetPath = landingPathForRoles(
        (rolesResult ?? []).map((item: { role: string }) => item.role),
        requestedPath()
      );

      router.push(targetPath);
      router.refresh();
    } catch {
      setBusy(false);
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' });
    }
  }

  async function requestPasswordReset() {
    if (!email) {
      return setMessage({ type: 'error', text: 'Parola sıfırlama bağlantısı için lütfen e-posta adresinizi girin.' });
    }
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/parola-yenile`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);

    if (error) {
      setMessage({ type: 'error', text: 'Sıfırlama bağlantısı gönderilemedi. Lütfen adresi kontrol edip tekrar deneyin.' });
    } else {
      setMessage({ type: 'success', text: 'Parola yenileme bağlantısı e-posta adresinize gönderildi.' });
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void authenticate(authMode);
  }

  return (
    <main className="account-shell">
      <header className="account-top-bar">
        <Link className="account-back-link" href="/">
          ← Ana Sayfaya Dön
        </Link>
        <div className="account-brand-pill">
          <NeighborhoodBond variant="brand" className="account-brand-icon" />
          <span>ORKESTRA</span>
        </div>
      </header>

      <div className="account-card-wrapper">
        <section className="account-card">
          <div className="account-card-header">
            <span className="account-eyebrow">ORKESTRA HESAP MERKEZİ</span>
            <h1 className="account-title">
              {authMode === 'sign-in' ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
            </h1>
            <p className="account-subtitle">
              {authMode === 'sign-in'
                ? 'Rolünüze göre taleplerinize, usta operasyon panelinize veya yönetim ekranına yönlendirilirsiniz.'
                : 'Dakikalar içinde kaydolun; teklifleri karşılaştırın veya zanaat hizmetinizi sunun.'}
            </p>
          </div>

          <div className="account-mode-tabs" role="tablist" aria-label="Giriş / Kayıt Seçimi">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'sign-in'}
              className={`mode-tab-btn ${authMode === 'sign-in' ? 'active' : ''}`}
              onClick={() => { setAuthMode('sign-in'); setMessage(null); }}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'sign-up'}
              className={`mode-tab-btn ${authMode === 'sign-up' ? 'active' : ''}`}
              onClick={() => { setAuthMode('sign-up'); setMessage(null); }}
            >
              Kayıt Ol
            </button>
          </div>

          <form className="account-form" onSubmit={submit} autoComplete="off">
            <div className="form-field-group">
              <label htmlFor="auth-email">E-posta Adresi</label>
              {/* autoComplete="new-password" is intentional: prevents browser password managers
                  from auto-filling saved localhost/test credentials into production login form. */}
              <input
                id="auth-email"
                type="email"
                autoComplete="new-password"
                required
                placeholder="ornek@ankarausta.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </div>

            <div className="form-field-group">
              <div className="label-with-action">
                <label htmlFor="auth-password">Parola</label>
                {authMode === 'sign-in' && (
                  <button
                    type="button"
                    className="inline-text-btn"
                    onClick={() => void requestPasswordReset()}
                    disabled={busy}
                  >
                    Parolamı unuttum?
                  </button>
                )}
              </div>
              <div className="password-input-wrap">
                <input
                  id="auth-password"
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
                  aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            </div>

            {message && (
              <div className={`account-alert-box alert-${message.type}`} role="status">
                <span className="alert-icon">{message.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{message.text}</span>
              </div>
            )}

            <button className="dialog-primary account-submit-btn" disabled={busy} type="submit">
              {busy
                ? 'İşleniyor…'
                : authMode === 'sign-in'
                ? 'Giriş Yap →'
                : 'Hesap Oluştur ve Devam Et →'}
            </button>
          </form>

          <footer className="account-card-footer">
            <p>
              Usta olarak hizmet vermek mi istiyorsunuz?{' '}
              <Link href="/usta-basvurusu" className="footer-action-link">
                Usta Başvuru Formu →
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
