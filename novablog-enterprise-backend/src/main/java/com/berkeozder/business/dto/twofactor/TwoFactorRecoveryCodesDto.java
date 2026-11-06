package com.berkeozder.business.dto.twofactor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 2FA acil durum kurtarma kodları (Recovery Codes).
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorRecoveryCodesDto {
    private List<String> recoveryCodes;
    private String message;
}

