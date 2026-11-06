package com.berkeozder.controller.api.interfaces;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorRecoveryCodesDto;
import com.berkeozder.business.dto.twofactor.TwoFactorSetupResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;
import com.berkeozder.error.ApiResult;
import org.springframework.http.ResponseEntity;

/**
 * İki Faktörlü Kimlik Doğrulama (2FA / MFA) REST API Sözleşmesi.
 *
 * @author Berke Özder
 */
public interface ITwoFactorApi {

    ResponseEntity<ApiResult<TwoFactorSetupResponseDto>> setup2fa();

    ResponseEntity<ApiResult<TwoFactorRecoveryCodesDto>> enable2fa(TwoFactorVerifyRequestDto request);

    ResponseEntity<ApiResult<String>> disable2fa(TwoFactorVerifyRequestDto request);

    ResponseEntity<ApiResult<JwtResponseDto>> verifyLogin2fa(TwoFactorVerifyRequestDto request);

    ResponseEntity<ApiResult<TwoFactorStatusDto>> get2faStatus();

    ResponseEntity<ApiResult<TwoFactorRecoveryCodesDto>> regenerateBackupCodes(TwoFactorVerifyRequestDto request);
}

