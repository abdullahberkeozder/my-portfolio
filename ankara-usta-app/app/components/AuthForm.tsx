'use client';

import { FormEvent, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { landingPathForRoles, safeNextPath } from '../lib/authRedirect';
import TaskrabbitBrandLogo from './TaskrabbitBrandLogo';
import styles from './authForm.module.css';

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

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
  isModal = false,
  onClose,
}: {
  audience?: 'customer' | 'tradesperson';
  initialMode?: 'sign-in' | 'sign-up';
  nextPath?: string | null;
  isModal?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [postalCode, setPostalCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const professional = audience === 'tradesperson';
  const withNext = (path: string) =>
    nextPath ? `${path}?next=${encodeURIComponent(nextPath)}` : path;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const [registrationPending, setRegistrationPending] = useState(false);
  const registrationNotice =
    'Bu adresle yeni kayıt yapılabiliyorsa doğrulama e-postasını kontrol edin; gelen kutusu ve spam klasörüne bakın. Zaten hesabınız varsa giriş yapın veya parolanızı yenileyin.';

  // Password criteria check for Taskrabbit live validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const diversityCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const hasDiversity = diversityCount >= 3;

  function requestedPath() {
    return safeNextPath(nextPath);
  }

  async function authenticate(mode: 'sign-in' | 'sign-up') {
    if (inFlight.current) return;
    const submittedEmail = email.trim();
    if (!submittedEmail) {
      setEmailError('E-posta adresi gereklidir');
      emailInput.current?.focus();
      return;
    }

    inFlight.current = true;
    setBusy(true);
    setMessage(null);
    setEmailError(null);
    setRegistrationPending(false);

    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === 'sign-in'
          ? await supabase.auth.signInWithPassword({ email: submittedEmail, password })
          : await supabase.auth.signUp({
              email: submittedEmail,
              password,
              options: {
                data: {
                  display_name: displayName.trim(),
                  registration_intent: audience,
                  phone: phone ? `${countryCode} ${phone.trim()}` : undefined,
                  postal_code: postalCode.trim() || undefined,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                  requestedPath() ??
                    (professional ? '/usta-basvurusu' : '/taleplerim')
                )}`,
              },
            });

      if (result.error) {
        if (mode === 'sign-up' && ['user_already_exists', 'email_exists'].includes(result.error.code ?? '')) {
          setRegistrationPending(true);
          setPassword('');
          return setMessage({ type: 'success', text: registrationNotice });
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
        professional && !roles.includes('tradesperson')
          ? requested ?? '/usta-basvurusu'
          : landingPathForRoles(roles, requested);

      if (onClose) onClose();
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
        : 'Hoş Geldiniz'
      : professional
      ? 'Usta Hesabı Oluştur'
      : 'Hesap Oluşturun';

  const pageSubtitle =
    authMode === 'sign-in'
      ? professional
        ? 'İş fırsatlarınızı ve başvurunuzu takip edin.'
        : 'Taleplerinizi ve tekliflerinizi tek ekrandan yönetin.'
      : professional
      ? 'Hesabınızı oluşturun; ardından hizmetlerinizi ve belgelerinizi ekleyin.'
      : 'Dakikalar içinde hesabınızı açın, güvenilir ustalarla buluşun.';

  return (
    <main className={`${isModal ? styles.modalScreen : styles.screen} auth-surface`}>
      <div className={styles.container}>
        {onClose && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Kapat"
          >
            ✕
          </button>
        )}

        <div className={styles.brandHeader}>
          <TaskrabbitBrandLogo size={34} />
        </div>

        <header className={styles.header}>
          <h1>{pageTitle}</h1>
          <p>{pageSubtitle}</p>
          {nextPath && (
            <p className={styles.returnNote}>
              {authMode === 'sign-up'
                ? 'Doğrulama tamamlandığında işleminize döneceksiniz.'
                : 'Giriş tamamlandığında işleminize döneceksiniz.'}
            </p>
          )}
        </header>

        <form className={styles.form} onSubmit={submit}>
          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="auth-email" className={styles.requiredLabel}>
              E-posta Adresi
            </label>
            <input
              id="auth-email"
              ref={emailInput}
              disabled={busy || !ready}
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'auth-email-error' : undefined}
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setMessage(null);
                setRegistrationPending(false);
              }}
            />
            {emailError && <span id="auth-email-error" className={styles.fieldError} role="alert">{emailError}</span>}
          </div>

          {/* Sign-up specific fields */}
          {authMode === 'sign-up' && (
            <>
              {/* Display name */}
              <div className={styles.field}>
                <label htmlFor="auth-name" className={styles.requiredLabel}>
                  Ad Soyad
                </label>
                <input
                  id="auth-name"
                  disabled={busy || !ready}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adınız ve Soyadınız"
                />
              </div>

              {/* Phone number with country selector */}
              <div className={styles.field}>
                <label htmlFor="auth-phone" className={styles.requiredLabel}>
                  Telefon Numarası
                </label>
                <div className={styles.phoneRow}>
                  <select
                    className={styles.countryCode}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Ülke kodu"
                  >
                    <option value="+90">🇹🇷 +90</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input
                    id="auth-phone"
                    type="tel"
                    disabled={busy || !ready}
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    autoComplete="tel-national"
                  />
                </div>
                <p className={styles.fieldPrivacyHint}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Numaranız yalnızca teklifi kabul ettiğiniz ustayla paylaşılır; açık havuza dağıtılmaz.</span>
                </p>
              </div>

              {/* Postal code / district */}
              <div className={styles.field}>
                <label htmlFor="auth-postal">
                  İlçe / Posta Kodu
                </label>
                <input
                  id="auth-postal"
                  type="text"
                  disabled={busy || !ready}
                  className={styles.input}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Örn: Çankaya veya 06420"
                />
              </div>
            </>
          )}

          {/* Password */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="auth-password" className={styles.requiredLabel}>
                Parola
              </label>
              {authMode === 'sign-in' && (
                <button
                  type="button"
                  className={styles.passwordHelpLink}
                  onClick={() => void requestPasswordReset()}
                  disabled={busy}
                >
                  Şifrenizi mi unuttunuz?
                </button>
              )}
            </div>
            <div className={styles.passwordWrap}>
              <input
                id="auth-password"
                disabled={busy || !ready}
                type={showPassword ? 'text' : 'password'}
                autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={authMode === 'sign-up' ? 8 : undefined}
                required
                className={styles.input}
                placeholder={authMode === 'sign-up' ? 'Şifre oluşturun' : 'Şifrenizi girin'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                disabled={busy}
              >
                <EyeIcon closed={showPassword} />
              </button>
            </div>

            {/* Taskrabbit live criteria checklist for sign-up */}
            {authMode === 'sign-up' && (
              <ul className={styles.checklist} aria-label="Parola kuralları">
                <li className={`${styles.checkItem} ${hasMinLength ? styles.checkItemFulfilled : ''}`}>
                  <span className={`${styles.checkIcon} ${hasMinLength ? styles.checkIconFulfilled : ''}`} aria-hidden="true">
                    {hasMinLength ? '✓' : '○'}
                  </span>
                  En az 8 karakter
                </li>
                <li className={`${styles.checkItem} ${hasDiversity ? styles.checkItemFulfilled : ''}`}>
                  <span className={`${styles.checkIcon} ${hasDiversity ? styles.checkIconFulfilled : ''}`} aria-hidden="true">
                    {hasDiversity ? '✓' : '○'}
                  </span>
                  En az 3 kural: büyük harf, küçük harf, rakam veya sembol
                </li>
              </ul>
            )}
          </div>

          {/* Terms checkbox for sign-up */}
          {authMode === 'sign-up' && (
            <label className={styles.termsLabel}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span>
                <Link href="/kullanim-kosullari" target="_blank">Kullanım Koşulları</Link>&apos;nı kabul ediyorum ve{' '}
                <Link href="/gizlilik" target="_blank">Gizlilik Politikası</Link>&apos;nı okudum.
              </span>
            </label>
          )}

          {/* Alert feedback message */}
          {message && (
            <div
              className={`${styles.alert} ${message.type === 'error' ? styles.alertError : styles.alertSuccess}`}
              role={message.type === 'error' ? 'alert' : 'status'}
            >
              <span>{message.text}</span>
            </div>
          )}

          {/* Recovery actions if account already exists */}
          {registrationPending && (
            <div className={styles.recoveryActions} role="group" aria-label="Hesabınıza erişin">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setAuthMode('sign-in');
                  setRegistrationPending(false);
                  setMessage(null);
                }}
              >
                Mevcut hesabımla giriş yap
              </button>
              <button type="button" disabled={busy} onClick={() => void requestPasswordReset()}>
                Parolamı yenile
              </button>
            </div>
          )}

          {/* Primary Taskrabbit Solid Pill Submit Button */}
          <button
            className={styles.submitBtn}
            disabled={!ready || busy || registrationPending}
            type="submit"
          >
            {busy ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                İşleniyor…
              </>
            ) : authMode === 'sign-in' ? (
              'Giriş Yap →'
            ) : (
              'Hesap Oluştur ve Devam Et →'
            )}
          </button>
        </form>

        {/* Divider OR / VEYA */}
        {!registrationPending && (
          <>
            <div className={styles.divider}>VEYA</div>
            <button
              type="button"
              className={styles.outlineBtn}
              onClick={() => {
                setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in');
                setMessage(null);
                setEmailError(null);
              }}
            >
              {authMode === 'sign-in' ? 'Hesap oluşturun' : 'Zaten hesabınız var mı? Giriş yapın'}
            </button>
          </>
        )}

        {/* Audience switch: Customer vs Tradesperson */}
        <div className={styles.audienceSwitch}>
          {professional ? (
            <>
              <span>Hizmet mi almak istiyorsunuz?</span>
              <a href={withNext(authMode === 'sign-up' ? '/kayit' : '/giris')}>
                Hizmet almak istiyorum
              </a>
            </>
          ) : (
            <>
              <span>Usta olarak mı devam edeceksiniz?</span>
              <a href={withNext(authMode === 'sign-up' ? '/usta/kayit' : '/usta/giris')}>
                Ustayım
              </a>
            </>
          )}
        </div>

        {/* Legal links */}
        <div className={styles.legal}>
          <Link href="/gizlilik">Gizlilik</Link>
          <span aria-hidden="true">·</span>
          <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
        </div>
      </div>

      {/* Floating Taskrabbit Help Pill at bottom-left */}
      {!isModal && (
        <a href="/yardim" className={styles.helpFloat} title="Yardım ve Destek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Yardım
        </a>
      )}
    </main>
  );
}
