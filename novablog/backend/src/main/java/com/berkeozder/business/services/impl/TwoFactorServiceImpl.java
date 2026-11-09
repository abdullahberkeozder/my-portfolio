package com.berkeozder.business.services.impl;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorRecoveryCodesDto;
import com.berkeozder.business.dto.twofactor.TwoFactorSetupResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;
import com.berkeozder.business.services.interfaces.ITwoFactorService;
import com.berkeozder.data.entity.TwoFactorEnrollmentStatus;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._401_UnAuthorizedRequestException;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.security.jwt.AuthState;
import com.berkeozder.security.jwt.JwtTokenProvider;
import com.berkeozder.security.twofactor.TotpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * İki Faktörlü Kimlik Doğrulama (2FA / MFA) Servis Gerçekleştirmesi.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class TwoFactorServiceImpl implements ITwoFactorService {

    private final IUserRepository userRepository;
    private final TotpService totpService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public TwoFactorSetupResponseDto setup2fa(String username) {
        UserEntity user = findUserByUsername(username);

        String secret = totpService.generateSecret();
        String otpAuthUrl = totpService.getOtpAuthUrl(user.getUsername(), secret);
        String qrCodeDataUri = totpService.generateQrCodeDataUri(otpAuthUrl, 250, 250);

        // Durum geçişi: DISABLED -> PENDING_VERIFICATION (Henüz doğrulanmadı)
        user.initiateTwoFactorEnrollment(secret);
        userRepository.save(user);

        log.info("2FA kurulum anahtarı üretildi: {}", user.getUsername());

        return TwoFactorSetupResponseDto.builder()
                .secret(secret)
                .qrCodeDataUri(qrCodeDataUri)
                .manualEntryKey(secret)
                .otpAuthUrl(otpAuthUrl)
                .build();
    }

    @Override
    @Transactional
    public TwoFactorRecoveryCodesDto enable2fa(String username, String code) {
        UserEntity user = findUserByUsername(username);

        if (user.getTwoFactorSecret() == null || user.getTwoFactorSecret().isBlank()) {
            throw new _400_BadRequestException("Lütfen önce 2FA kurulumunu başlatınız (/setup).");
        }

        boolean isValid = totpService.verifyCode(user.getTwoFactorSecret(), code);
        if (!isValid) {
            throw new _400_BadRequestException("Geçersiz 2FA doğrulama kodu.");
        }

        List<String> backupCodes = totpService.generateBackupCodes(8);
        // Durum geçişi: PENDING_VERIFICATION -> ENABLED
        user.confirmTwoFactorEnrollment(backupCodes);
        userRepository.save(user);

        log.info("2FA başarıyla etkinleştirildi: {}", user.getUsername());

        return TwoFactorRecoveryCodesDto.builder()
                .recoveryCodes(backupCodes)
                .message("İki faktörlü kimlik doğrulama başarıyla etkinleştirildi. Lütfen acil durum kurtarma kodlarınızı güvenli bir yerde saklayınız.")
                .build();
    }

    @Override
    @Transactional
    public void disable2fa(String username, String code) {
        UserEntity user = findUserByUsername(username);

        if (user.getTwoFactorEnrollmentStatus() != TwoFactorEnrollmentStatus.ENABLED) {
            throw new _400_BadRequestException("2FA bu hesap için zaten etkin değildir.");
        }

        boolean isValid = totpService.verifyCode(user.getTwoFactorSecret(), code);
        if (!isValid) {
            throw new _400_BadRequestException("2FA devre dışı bırakılamadı: Girilen doğrulama kodu hatalı.");
        }

        // Durum geçişi: ENABLED -> DISABLED
        user.disableTwoFactor();
        userRepository.save(user);

        log.info("2FA devre dışı bırakıldı: {}", user.getUsername());
    }

    @Override
    @Transactional
    public JwtResponseDto verifyLogin2fa(TwoFactorVerifyRequestDto request) {
        if (request.getPreAuthToken() == null || request.getPreAuthToken().isBlank()) {
            throw new _400_BadRequestException("Ön kimlik doğrulama belirteci (preAuthToken) zorunludur.");
        }

        if (!jwtTokenProvider.validateToken(request.getPreAuthToken())) {
            throw new _401_UnAuthorizedRequestException("Geçersiz veya süresi dolmuş ön kimlik doğrulama oturumu.");
        }

        String username = jwtTokenProvider.getUsernameFromJwt(request.getPreAuthToken());
        UserEntity user = findUserByUsername(username);

        if (!user.is2faEnabled()) {
            throw new _400_BadRequestException("Bu hesap için 2FA doğrulaması aktif değildir.");
        }

        String cleanCode = request.getCode().trim();
        boolean isTotpValid = totpService.verifyCode(user.getTwoFactorSecret(), cleanCode);
        boolean isBackupCodeValid = false;

        if (!isTotpValid) {
            isBackupCodeValid = user.consumeBackupCode(cleanCode);
            if (isBackupCodeValid) {
                userRepository.save(user);
                log.info("Kullanıcı kurtarma koduyla giriş yaptı: {}. Kalan kurtarma kodu: {}", username, user.getRemainingBackupCodesCount());
            }
        }

        if (!isTotpValid && !isBackupCodeValid) {
            throw new _400_BadRequestException("Geçersiz 2FA kodu veya kurtarma kodu.");
        }

        // Başarılı doğrulama: Tam yetkili JWT üret (AuthState: PRE_AUTH_2FA_REQUIRED -> AUTHENTICATED)
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());

        String accessToken = jwtTokenProvider.generateAccessToken(username, roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(username);

        log.info("2FA doğrulaması tamamlandı, tam JWT üretildi: {}", username);

        return JwtResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .authState(AuthState.AUTHENTICATED)
                .is2faRequired(false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TwoFactorStatusDto get2faStatus(String username) {
        UserEntity user = findUserByUsername(username);

        return TwoFactorStatusDto.builder()
                .is2faEnabled(user.is2faEnabled())
                .enrollmentStatus(user.getTwoFactorEnrollmentStatus())
                .remainingBackupCodes(user.getRemainingBackupCodesCount())
                .build();
    }

    @Override
    @Transactional
    public TwoFactorRecoveryCodesDto regenerateBackupCodes(String username, String code) {
        UserEntity user = findUserByUsername(username);

        if (user.getTwoFactorEnrollmentStatus() != TwoFactorEnrollmentStatus.ENABLED) {
            throw new _400_BadRequestException("Kurtarma kodları üretilemedi: 2FA etkin değil.");
        }

        boolean isValid = totpService.verifyCode(user.getTwoFactorSecret(), code);
        if (!isValid) {
            throw new _400_BadRequestException("Kurtarma kodları yenilenemedi: Doğrulama kodu hatalı.");
        }

        List<String> newBackupCodes = totpService.generateBackupCodes(8);
        user.confirmTwoFactorEnrollment(newBackupCodes);
        userRepository.save(user);

        log.info("Yeni kurtarma kodları üretildi: {}", user.getUsername());

        return TwoFactorRecoveryCodesDto.builder()
                .recoveryCodes(newBackupCodes)
                .message("Yeni acil durum kurtarma kodları başarıyla üretildi. Eski kodlar geçersiz kılınmıştır.")
                .build();
    }

    private UserEntity findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new _404_NotFoundException("Kullanıcı bulunamadı: " + username));
    }
}

