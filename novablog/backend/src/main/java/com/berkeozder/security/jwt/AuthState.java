package com.berkeozder.security.jwt;

/**
 * Kimlik Doğrulama Oturum Durumu (Authentication State Machine).
 *
 * <p>
 * Durum Geçişleri:
 * <ul>
 *   <li>ANONYMOUS -&gt; PRE_AUTH_2FA_REQUIRED: Parola doğru ancak hesapta 2FA aktif.</li>
 *   <li>ANONYMOUS -&gt; AUTHENTICATED: Parola doğru ve hesapta 2FA kapalı.</li>
 *   <li>PRE_AUTH_2FA_REQUIRED -&gt; AUTHENTICATED: Doğru TOTP veya kurtarma kodu girildiğinde tam JWT verilir.</li>
 *   <li>AUTHENTICATED -&gt; REFRESHING: Refresh token ile yeni access token talep edildiğinde.</li>
 *   <li>AUTHENTICATED / REFRESHING -&gt; REVOKED: Oturum kapatıldığında veya token geçersiz kılındığında.</li>
 * </ul>
 * </p>
 *
 * @author Berke Özder
 */
public enum AuthState {
    /**
     * Henüz doğrulanmamış anonim istemci.
     */
    ANONYMOUS,

    /**
     * 1. Adım (Parola) başarılı, fakat 2FA gereksinimi nedeniyle
     * yalnızca 5 dakikalık kısıtlı preAuthToken ile bekleyen durum.
     */
    PRE_AUTH_2FA_REQUIRED,

    /**
     * Tam kimlik doğrulaması tamamlanmış, tam yetkili Bearer Access Token'a sahip durum.
     */
    AUTHENTICATED,

    /**
     * Mevcut access token süresi dolmuş, refresh token ile yenileme yapılan geçici durum.
     */
    REFRESHING,

    /**
     * Oturumu sonlandırılmış, süresi dolmuş veya iptal edilmiş durum.
     */
    REVOKED
}

