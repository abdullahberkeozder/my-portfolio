package com.berkeozder.business.services.impl;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RefreshTokenRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.auth.UserProfileDto;
import com.berkeozder.business.event.UserRegisteredEvent;
import com.berkeozder.business.services.interfaces.IAuthService;
import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IRoleRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.security.jwt.JwtTokenProvider;
import com.berkeozder.security.userdetails.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Log4j2
@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements IAuthService {

    private final IUserRepository iUserRepository;
    private final IRoleRepository iRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public JwtResponseDto register(RegisterRequestDto registerRequestDto) {
        if (iUserRepository.existsByUsername(registerRequestDto.getUsername())) {
            throw new _400_BadRequestException("Bu kullanıcı adı zaten kullanılmaktadır: " + registerRequestDto.getUsername());
        }

        if (iUserRepository.existsByEmail(registerRequestDto.getEmail())) {
            throw new _400_BadRequestException("Bu e-posta adresi zaten kullanılmaktadır: " + registerRequestDto.getEmail());
        }

        RoleEntity defaultRole = iRoleRepository.findByRoleName(RoleType.ROLE_USER)
                .orElseGet(() -> iRoleRepository.save(RoleEntity.builder().roleName(RoleType.ROLE_USER).build()));

        Set<RoleEntity> roles = new HashSet<>();
        roles.add(defaultRole);

        UserEntity user = UserEntity.builder()
                .username(registerRequestDto.getUsername())
                .email(registerRequestDto.getEmail())
                .password(passwordEncoder.encode(registerRequestDto.getPassword()))
                .firstName(registerRequestDto.getFirstName())
                .lastName(registerRequestDto.getLastName())
                .roles(roles)
                .isEnabled(true)
                .isAccountNonLocked(true)
                .isAccountNonExpired(true)
                .isCredentialsNonExpired(true)
                .build();

        UserEntity savedUser = iUserRepository.save(user);

        // Asenkron Event Yayınlama (Adım 6)
        String fullName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
        eventPublisher.publishEvent(new UserRegisteredEvent(
                this,
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                fullName
        ));

        List<String> roleNames = List.of(RoleType.ROLE_USER.name());
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getUsername(), roleNames);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getUsername());

        log.info("Yeni kullanıcı başarıyla kaydedildi: {}", savedUser.getUsername());

        return JwtResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .roles(roleNames)
                .build();
    }

    @Override
    public JwtResponseDto login(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getUsernameOrEmail(),
                        loginRequestDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 2FA / MFA Kontrolü (Adım 20)
        UserEntity user = iUserRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new _404_NotFoundException("Kullanıcı bulunamadı: " + userDetails.getUsername()));

        if (user.is2faEnabled()) {
            log.info("Kullanıcı ({}) için 2FA doğrulaması gerekiyor. Ön kimlik doğrulama belirteci üretiliyor.", user.getUsername());
            String preAuthToken = jwtTokenProvider.generatePreAuthToken(user.getUsername());
            return JwtResponseDto.builder()
                    .is2faRequired(true)
                    .preAuthToken(preAuthToken)
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();
        }

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails.getUsername());

        log.info("Kullanıcı giriş yaptı: {}", userDetails.getUsername());

        return JwtResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    public JwtResponseDto refreshToken(RefreshTokenRequestDto refreshTokenRequestDto) {
        String requestRefreshToken = refreshTokenRequestDto.getRefreshToken();

        if (!jwtTokenProvider.validateToken(requestRefreshToken)) {
            throw new _400_BadRequestException("Geçersiz veya süresi dolmuş refresh token.");
        }

        String username = jwtTokenProvider.getUsernameFromJwt(requestRefreshToken);
        UserEntity user = iUserRepository.findByUsername(username)
                .orElseThrow(() -> new _404_NotFoundException("Kullanıcı bulunamadı: " + username));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getUsername(), roles);

        return JwtResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(requestRefreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new _400_BadRequestException("Oturum açmış bir kullanıcı bulunamadı.");
        }

        String currentUsername = authentication.getName();
        UserEntity user = iUserRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new _404_NotFoundException("Kullanıcı profili bulunamadı: " + currentUsername));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());

        return UserProfileDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .isEnabled(user.isEnabled())
                .build();
    }
}

