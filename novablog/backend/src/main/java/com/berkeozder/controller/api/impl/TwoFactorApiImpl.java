package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorRecoveryCodesDto;
import com.berkeozder.business.dto.twofactor.TwoFactorSetupResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;
import com.berkeozder.business.services.interfaces.ITwoFactorService;
import com.berkeozder.controller.api.interfaces.ITwoFactorApi;
import com.berkeozder.error.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * İki Faktörlü Kimlik Doğrulama (2FA / MFA) REST API Controller.
 *
 * @author Berke Özder
 */
@Log4j2
@RestController
@RequestMapping("/api/v1/auth/2fa")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Two-Factor Authentication (2FA) API", description = "Google Authenticator / TOTP iki faktörlü kimlik doğrulama yönetimi")
public class TwoFactorApiImpl implements ITwoFactorApi {

    private final ITwoFactorService twoFactorService;

    @Override
    @PostMapping("/setup")
    @Operation(summary = "2FA Kurulumu Başlat", description = "Giriş yapmış kullanıcı için Base32 gizli anahtarı ve taranabilir QR Kod görseli üretir.")
    public ResponseEntity<ApiResult<TwoFactorSetupResponseDto>> setup2fa() {
        String username = getCurrentUsername();
        TwoFactorSetupResponseDto response = twoFactorService.setup2fa(username);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @PostMapping("/enable")
    @Operation(summary = "2FA'yı Aktif Et", description = "Kullanıcının authenticator uygulamasından aldığı 6 haneli ilk kodu doğrular ve 2FA'yı kalıcı açar.")
    public ResponseEntity<ApiResult<TwoFactorRecoveryCodesDto>> enable2fa(@Valid @RequestBody TwoFactorVerifyRequestDto request) {
        String username = getCurrentUsername();
        TwoFactorRecoveryCodesDto response = twoFactorService.enable2fa(username, request.getCode());
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @PostMapping("/disable")
    @Operation(summary = "2FA'yı Devre Dışı Bırak", description = "Geçerli 6 haneli kod girilerek kullanıcının 2FA koruması kapatılır.")
    public ResponseEntity<ApiResult<String>> disable2fa(@Valid @RequestBody TwoFactorVerifyRequestDto request) {
        String username = getCurrentUsername();
        twoFactorService.disable2fa(username, request.getCode());
        return ResponseEntity.ok(ApiResult.success("İki faktörlü kimlik doğrulama başarıyla kapatıldı."));
    }

    @Override
    @PostMapping("/verify-login")
    @Operation(summary = "Girişte 2FA Doğrulaması", description = "2FA korumalı hesapların giriş aşamasında preAuthToken ve 6 haneli TOTP (veya kurtarma kodu) ile tam JWT almasını sağlar.")
    public ResponseEntity<ApiResult<JwtResponseDto>> verifyLogin2fa(@Valid @RequestBody TwoFactorVerifyRequestDto request) {
        JwtResponseDto response = twoFactorService.verifyLogin2fa(request);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @GetMapping("/status")
    @Operation(summary = "2FA Durumu", description = "Giriş yapmış kullanıcının 2FA aktiflik durumu ve kalan acil durum kod sayısını döner.")
    public ResponseEntity<ApiResult<TwoFactorStatusDto>> get2faStatus() {
        String username = getCurrentUsername();
        TwoFactorStatusDto status = twoFactorService.get2faStatus(username);
        return ResponseEntity.ok(ApiResult.success(status));
    }

    @Override
    @PostMapping("/regenerate-backup-codes")
    @Operation(summary = "Kurtarma Kodlarını Yenile", description = "Mevcut 2FA kodu doğrulanarak yeni acil durum kurtarma kodları üretilir.")
    public ResponseEntity<ApiResult<TwoFactorRecoveryCodesDto>> regenerateBackupCodes(@Valid @RequestBody TwoFactorVerifyRequestDto request) {
        String username = getCurrentUsername();
        TwoFactorRecoveryCodesDto response = twoFactorService.regenerateBackupCodes(username, request.getCode());
        return ResponseEntity.ok(ApiResult.success(response));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new com.berkeozder.exception._401_UnAuthorizedRequestException("Bu işlem için oturum açmış olmanız gerekmektedir.");
        }
        return authentication.getName();
    }
}

