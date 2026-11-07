package com.berkeozder.business.dto.auth;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponseDto {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long userId;
    private String username;
    private String email;
    private List<String> roles;

    @com.fasterxml.jackson.annotation.JsonProperty("is2faRequired")
    @Builder.Default
    private boolean is2faRequired = false;

    private String preAuthToken;

    public boolean is2faRequired() {
        return is2faRequired;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("2faRequired")
    public boolean get2faRequired() {
        return is2faRequired;
    }
}

