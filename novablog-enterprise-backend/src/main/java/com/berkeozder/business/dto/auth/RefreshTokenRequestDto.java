package com.berkeozder.business.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenRequestDto {

    @NotBlank(message = "Refresh token boş bırakılamaz")
    private String refreshToken;
}

