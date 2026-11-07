package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorRecoveryCodesDto;
import com.berkeozder.business.dto.twofactor.TwoFactorSetupResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;

/**
 * İki Faktörlü Kimlik Doğrulama (2FA / MFA) İş Mantığı Sözleşmesi.
 *
 * @author Berke Özder
 */
public interface ITwoFactorService {

    /**
     * Kullanıcı için 2FA kurulum nesnesini (Secret, QR Kod, Manual Entry Key) üretir.
     */
    TwoFactorSetupResponseDto setup2fa(String username);

    /**
     * Kullanıcının girdiği 6 haneli kod geçerli ise 2FA'yı kalıcı olarak aktif eder ve kurtarma kodlarını döner.
     */
    TwoFactorRecoveryCodesDto enable2fa(String username, String code);

    /**
     * Geçerli TOTP kodu doğrulanarak 2FA devre dışı bırakılır.
     */
    void disable2fa(String username, String code);

    /**
     * Giriş sırasında 2FA zorunlu kullanıcılar için preAuthToken ve kod (TOTP veya Backup Code) doğrulaması yapar ve tam JWT döner.
     */
    JwtResponseDto verifyLogin2fa(TwoFactorVerifyRequestDto request);

    /**
     * Kullanıcının mevcut 2FA aktiflik durumu ve kalan kurtarma kodu sayısını döner.
     */
    TwoFactorStatusDto get2faStatus(String username);

    /**
     * Yeni acil durum kurtarma kodları üretir.
     */
    TwoFactorRecoveryCodesDto regenerateBackupCodes(String username, String code);
}

