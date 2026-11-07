package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RefreshTokenRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.auth.UserProfileDto;

public interface IAuthService {

    JwtResponseDto register(RegisterRequestDto registerRequestDto);

    JwtResponseDto login(LoginRequestDto loginRequestDto);

    JwtResponseDto refreshToken(RefreshTokenRequestDto refreshTokenRequestDto);

    UserProfileDto getCurrentUserProfile();
}

