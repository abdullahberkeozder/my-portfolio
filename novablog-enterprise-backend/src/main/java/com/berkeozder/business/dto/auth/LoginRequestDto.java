package com.berkeozder.business.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {

    @NotBlank(message = "Kullanıcı adı veya e-posta boş bırakılamaz")
    private String usernameOrEmail;

    @NotBlank(message = "Şifre boş bırakılamaz")
    private String password;
}

