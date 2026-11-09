package com.berkeozder.data.entity;

/**
 * Kullanıcı İki Faktörlü Kimlik Doğrulama (2FA / TOTP) Yaşam Döngüsü Durumu.
 *
 * <p>
 * Durum Geçişleri:
 * <ul>
 *   <li>DISABLED -&gt; PENDING_VERIFICATION: Kullanıcı kurulum başlattığında (/setup) geçici secret atanır.</li>
 *   <li>PENDING_VERIFICATION -&gt; ENABLED: Kullanıcı geçerli ilk TOTP kodunu girip onayladığında (/enable).</li>
 *   <li>PENDING_VERIFICATION -&gt; DISABLED: Kurulum tamamlanmadan iptal edildiğinde.</li>
 *   <li>ENABLED -&gt; DISABLED: Kullanıcı geçerli kod ile 2FA'yı kapattığında (/disable).</li>
 * </ul>
 * </p>
 *
 * @author Berke Özder
 */
public enum TwoFactorEnrollmentStatus {
    /**
     * 2FA devre dışıdır. Giriş için yalnızca parola gereklidir.
     */
    DISABLED,

    /**
     * 2FA kurulumu başlatılmış, Base32 secret üretilmiş ancak henüz
     * kullanıcı tarafından ilk TOTP koduyla doğrulanmamıştır.
     */
    PENDING_VERIFICATION,

    /**
     * 2FA aktif ve doğrulanmıştır. Giriş işlemlerinde parola sonrasında
     * TOTP (veya acil durum kurtarma kodu) zorunludur.
     */
    ENABLED
}

