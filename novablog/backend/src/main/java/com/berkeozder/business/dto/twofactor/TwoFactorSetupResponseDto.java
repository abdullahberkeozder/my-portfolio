package com.berkeozder.business.dto.twofactor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 2FA kurulumu için üretilen gizli anahtar ve QR Kod veri nesnesi.
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupResponseDto {
    private String secret;
    private String qrCodeDataUri;
    private String manualEntryKey;
    private String otpAuthUrl;
}

