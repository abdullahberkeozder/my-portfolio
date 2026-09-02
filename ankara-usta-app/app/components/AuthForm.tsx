'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { landingPathForRoles, safeNextPath } from '../lib/authRedirect';
import NeighborhoodBond from './NeighborhoodBond';

// Eye icon for password toggle
function EyeIcon({ closed }: { closed?: boolean }) {
  return closed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AuthForm({
  audience = 'customer',
  initialMode = 'sign-in',
  nextPath = null,
}: {
  audience?: 'customer' | 'tradesperson';
  initialMode?: 'sign-in' | 'sign-up';
  nextPath?: string | null;
}) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const professional = audience === 'tradesperson';
  const withNext = (path: string) =>
    nextPath ? `${path}?next=${encodeURIComponent(nextPath)}` : path;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function requestedPath() {
    return safeNextPath(nextPath);
  }

  async function authenticate(mode: 'sign-in' | 'sign-up') {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === 'sign-in'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { display_name: displayName.trim(), registration_intent: audience },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                  requestedPath() ??
                    (professional ? '/usta-basvurusu' : '/taleplerim')
                )}`,
              },
            });

      if (result.error) {
        return setMessage({
          type: 'error',
          text:
            mode === 'sign-in'
              ? 'Giriş yapılamadı. E-posta, parola ve e-posta doğrulamanızı kontrol edin.'
              : 'Kayıt tamamlanamadı. Bilgilerinizi kontrol edin veya mevcut hesabınızla giriş yapın.',
        });
      }

      if (mode === 'sign-up' && !result.data.session) {
        return setMessage({
          type: 'success',
          text: 'Doğrulama bağlantısı e-posta adresinize gönderildi. Mevcut hesabınız varsa giriş yapabilirsiniz.',
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Session unavailable');
      const { data: rolesResult, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (rolesError) throw rolesError;
      const targetPath = landingPathForRoles(
        (rolesResult ?? []).map((item: { role: string }) => item.role),
        requestedPath() ??
          (professional
            ? (rolesResult ?? []).some((item: { role: string }) => item.role === 'tradesperson')
              ? '/usta/talepler'
              : '/usta-basvurusu'
            : '/taleplerim')
      );

      router.push(targetPath);
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    if (!email) {
      return setMessage({
        type: 'error',
        text: 'Parola sıfırlama için lütfen önce e-posta adresinizi girin.',
      });
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/parola-yenile`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setMessage({
          type: 'error',
          text: 'Sıfırlama bağlantısı gönderilemedi. Lütfen adresi kontrol edip tekrar deneyin.',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Parola yenileme bağlantısı e-posta adresinize gönderildi.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.' });
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void authenticate(authMode);
  }

  const pageTitle =
    authMode === 'sign-in'
      ? professional
        ? 'Usta Girişi'
        : 'Hesabınıza Giriş Yapın'
      : professional
      ? 'Usta Hesabı Oluştur'
      : 'Hesap Oluşturun';

  const pageSubtitle =
    authMode === 'sign-in'
      ? professional
        ? 'İş fırsatlarınızı ve başvurunuzu takip edin.'
        : 'Taleplerinizi ve tekliflerinizi kendi hesabınızdan takip edin.'
      : professional
      ? 'Hesabınızı oluşturun; ardından hizmetlerinizi ve belgelerinizi ekleyin.'
      : 'Hesabınızı oluşturun; hazırladığınız talebe dönüp teklif almaya başlayın.';

  return (
    <main className="auth-shell account-shell">
      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-default)' }}>
        <Link className="auth-back-link" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          Ana Sayfa
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>
          <NeighborhoodBond variant="brand" className="brand-bond" />
          ORKESTRA
        </div>
      </div>

      {/* Card */}
      <div style={{ paddingTop: '72px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="auth-card">
          <span className="auth-eyebrow">ORKESTRA HESAP MERKEZİ</span>
          <h1>{pageTitle}</h1>
          <p className="auth-subtitle">{pageSubtitle}</p>

          {/* Giriş / Kayıt tabs */}
          <div className="auth-mode-tabs" role="group" aria-label="Giriş veya Kayıt">
            <button
              className={`auth-mode-tab${authMode === 'sign-in' ? ' active' : ''}`}
              type="button"
              aria-pressed={authMode === 'sign-in'}
              disabled={busy}
              onClick={() => { setAuthMode('sign-in'); setMessage(null); }}
            >
              Giriş Yap
            </button>
            <button
              className={`auth-mode-tab${authMode === 'sign-up' ? ' active' : ''}`}
              type="button"
              aria-pressed={authMode === 'sign-up'}
              disabled={busy}
              onClick={() => { setAuthMode('sign-up'); setMessage(null); }}
            >
              Kayıt Ol
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {/* Display name (sign-up only) */}
            {authMode === 'sign-up' && (
              <div className="auth-field">
                <label htmlFor="auth-name">Ad Soyad</label>
                <input
                  id="auth-name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="auth-email">E-posta Adresi</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="ornek@eposta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Parola</label>
                {authMode === 'sign-in' && (
                  <button
                    type="button"
                    className="auth-label-action"
                    onClick={() => void requestPasswordReset()}
                    disabled={busy}
                  >
                    Parolamı unuttum?
                  </button>
                )}
              </div>
              <div className="auth-password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                  minLength={authMode === 'sign-up' ? 8 : undefined}
                  required
                  placeholder={authMode === 'sign-up' ? 'En az 8 karakter' : 'Parolanız'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                >
                  <EyeIcon closed={showPassword} />
                </button>
              </div>
            </div>

            {/* Alert message */}
            {message && (
              <div
                className={`auth-alert auth-alert-${message.type}`}
                role={message.type === 'error' ? 'alert' : 'status'}
              >
                <span className="auth-alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
                <span>{message.text}</span>
              </div>
            )}

            {/* Submit */}
            <button className="auth-submit-btn" disabled={busy} type="submit">
              {busy ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  İşleniyor…
                </>
              ) : authMode === 'sign-in' ? (
                'Giriş Yap →'
              ) : (
                'Hesap Oluştur ve Devam Et →'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="auth-footer-note">
            {professional ? (
              <>
                Tek hesapla hem hizmet alabilir hem usta başvurusu yapabilirsiniz.{' '}
                <Link href={withNext('/giris')}>Müşteri girişi →</Link>
              </>
            ) : (
              <>
                Usta olarak başvuru yapmak ister misiniz?{' '}
                <Link href={withNext('/usta/kayit')}>Usta olarak kayıt ol →</Link>
              </>
            )}
          </div>

          {/* Minimal legal links */}
          <div className="auth-minimal-footer">
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
