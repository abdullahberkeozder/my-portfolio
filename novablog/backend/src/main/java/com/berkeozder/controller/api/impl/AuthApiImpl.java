package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RefreshTokenRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.auth.UserProfileDto;
import com.berkeozder.business.services.interfaces.IAuthService;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Authentication API", description = "Kullanıcı Kayıt, Giriş ve JWT Yönetimi Uç Noktaları")
public class AuthApiImpl {

    private final IAuthService authService;

    @Operation(summary = "Yeni kullanıcı kaydı (Register)")
    @PostMapping("/register")
    public ResponseEntity<ApiResult<JwtResponseDto>> register(@Valid @RequestBody RegisterRequestDto registerRequestDto) {
        JwtResponseDto response = authService.register(registerRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(response));
    }

    @Operation(summary = "Kullanıcı girişi ve JWT üretimi (Login)")
    @PostMapping("/login")
    public ResponseEntity<ApiResult<JwtResponseDto>> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        JwtResponseDto response = authService.login(loginRequestDto);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Operation(summary = "Yenileme belirteci ile yeni Access Token alma (Refresh Token)")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResult<JwtResponseDto>> refreshToken(@Valid @RequestBody RefreshTokenRequestDto refreshTokenRequestDto) {
        JwtResponseDto response = authService.refreshToken(refreshTokenRequestDto);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Operation(summary = "Giriş yapmış kullanıcının profil bilgilerini getirme")
    @GetMapping("/me")
    public ResponseEntity<ApiResult<UserProfileDto>> getCurrentUser() {
        UserProfileDto profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResult.success(profile));
    }
}

