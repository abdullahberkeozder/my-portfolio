'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { landingPathForRoles, safeNextPath } from '../lib/authRedirect';

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
  const inFlight = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const [registrationPending, setRegistrationPending] = useState(false);
  const registrationNotice = 'Bu adresle yeni kayıt yapılabiliyorsa doğrulama e-postasını kontrol edin; gelen kutusu ve spam klasörüne bakın. Zaten hesabınız varsa giriş yapın veya parolanızı yenileyin.';

  function requestedPath() {
    return safeNextPath(nextPath);
  }

  async function authenticate(mode: 'sign-in' | 'sign-up') {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage(null);
    setRegistrationPending(false);
    const submittedEmail = email.trim();
    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === 'sign-in'
          ? await supabase.auth.signInWithPassword({ email: submittedEmail, password })
          : await supabase.auth.signUp({
              email: submittedEmail,
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
        // Auth remains the authority for duplicate accounts. Do not expose an email lookup API.
        if (mode === 'sign-up' && ['user_already_exists', 'email_exists'].includes(result.error.code ?? '')) {
          setRegistrationPending(true);
          setPassword('');
          return setMessage({type: 'success', text: registrationNotice});
        }
        return setMessage({
          type: 'error',
          text:
            mode === 'sign-in'
              ? 'Giriş yapılamadı. E-posta, parola ve e-posta doğrulamanızı kontrol edin.'
              : 'Kayıt tamamlanamadı. Bilgilerinizi kontrol edin veya mevcut hesabınızla giriş yapın.',
        });
      }

      if (mode === 'sign-up' && !result.data.session) {
        setRegistrationPending(true);
        setPassword('');
        return setMessage({
          type: 'success',
          text: registrationNotice,
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
      const roles = (rolesResult ?? []).map((item: { role: string }) => item.role);
      const requested = requestedPath();
      const targetPath =
        mode === 'sign-up' && professional && !roles.includes('tradesperson')
          ? requested ?? '/usta-basvurusu'
          : landingPathForRoles(roles, requested);

      router.push(targetPath);
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    if (inFlight.current) return;
    if (!email.trim() || !emailInput.current?.reportValidity()) {
      return setMessage({
        type: 'error',
        text: 'Parola sıfırlama için lütfen önce e-posta adresinizi girin.',
      });
    }
    inFlight.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/parola-yenile`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) {
        setMessage({
          type: 'error',
          text: 'Sıfırlama bağlantısı gönderilemedi. Lütfen adresi kontrol edip tekrar deneyin.',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Bu adres için parola yenileme yapılabiliyorsa e-posta gönderilir. Gelen kutunuzu ve spam klasörünü kontrol edin.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.' });
    } finally {
      inFlight.current = false;
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
      {/* Card */}
      <div className="auth-form-container">
        <div className="auth-card">
          <span className="auth-eyebrow">ORKESTRA HESAP MERKEZİ</span>
          <h1>{pageTitle}</h1>
          <p className="auth-subtitle">{pageSubtitle}</p>
          <nav className="auth-audience-links" aria-label="Hesap kullanım amacı">
            <Link href={withNext(authMode === 'sign-up' ? '/kayit' : '/giris')} aria-current={!professional ? 'page' : undefined}>Hizmet almak istiyorum</Link>
            <Link href={withNext(authMode === 'sign-up' ? '/usta/kayit' : '/usta/giris')} aria-current={professional ? 'page' : undefined}>Ustayım</Link>
          </nav>

          {/* Giriş / Kayıt tabs */}
          <div className="auth-mode-tabs" role="group" aria-label="Giriş veya Kayıt">
            <button
              className={`auth-mode-tab${authMode === 'sign-in' ? ' active' : ''}`}
              type="button"
              aria-pressed={authMode === 'sign-in'}
              disabled={busy}
              onClick={() => { setAuthMode('sign-in'); setMessage(null); setRegistrationPending(false); }}
            >
              Giriş Yap
            </button>
            <button
              className={`auth-mode-tab${authMode === 'sign-up' ? ' active' : ''}`}
              type="button"
              aria-pressed={authMode === 'sign-up'}
              disabled={busy}
              onClick={() => { setAuthMode('sign-up'); setMessage(null); setRegistrationPending(false); }}
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
                  disabled={busy}
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
                ref={emailInput}
                disabled={busy}
                type="email"
                autoComplete="email"
                required
                placeholder="ornek@eposta.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setMessage(null); setRegistrationPending(false); }}
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
                  disabled={busy}
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
            {registrationPending && <div className="auth-mode-tabs" role="group" aria-label="Hesabınıza erişin">
              <button className="auth-mode-tab" type="button" disabled={busy} onClick={() => {setAuthMode('sign-in'); setRegistrationPending(false); setMessage(null);}}>Mevcut hesabımla giriş yap</button>
              <button className="auth-mode-tab" type="button" disabled={busy} onClick={() => void requestPasswordReset()}>Parolamı yenile</button>
            </div>}
            <button className="auth-submit-btn" disabled={busy || registrationPending} type="submit">
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
