package com.berkeozder.business.dto.twofactor;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 2FA doğrulama istek nesnesi (6 haneli TOTP kodu veya kurtarma kodu).
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorVerifyRequestDto {

    @NotBlank(message = "Doğrulama kodu boş olamaz")
    private String code;

    private String preAuthToken;
    private String username;
}

