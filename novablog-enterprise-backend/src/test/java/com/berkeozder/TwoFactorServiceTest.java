package com.berkeozder;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorRecoveryCodesDto;
import com.berkeozder.business.dto.twofactor.TwoFactorSetupResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;
import com.berkeozder.business.services.impl.TwoFactorServiceImpl;
import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.security.jwt.JwtTokenProvider;
import com.berkeozder.security.twofactor.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TwoFactorServiceImpl Unit Tests")
class TwoFactorServiceTest {

    @Mock
    private IUserRepository userRepository;

    @Mock
    private TotpService totpService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private TwoFactorServiceImpl twoFactorService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        RoleEntity role = RoleEntity.builder().roleId(1L).roleName(RoleType.ROLE_USER).build();
        testUser = UserEntity.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .roles(Set.of(role))
                .is2faEnabled(false)
                .build();
    }

    @Test
    @DisplayName("1. setup2fa: Secret ve QR Kod üretip kullanıcıya geçici atamalıdır")
    void shouldSetup2fa() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.generateSecret()).thenReturn("JBSWY3DPEHPK3PXP");
        when(totpService.getOtpAuthUrl(anyString(), anyString())).thenReturn("otpauth://totp/test");
        when(totpService.generateQrCodeDataUri(anyString(), anyInt(), anyInt())).thenReturn("data:image/png;base64,test-qr");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        TwoFactorSetupResponseDto response = twoFactorService.setup2fa("testuser");

        assertThat(response.getSecret()).isEqualTo("JBSWY3DPEHPK3PXP");
        assertThat(response.getQrCodeDataUri()).isEqualTo("data:image/png;base64,test-qr");
        assertThat(testUser.getTwoFactorSecret()).isEqualTo("JBSWY3DPEHPK3PXP");
        assertThat(testUser.is2faEnabled()).isFalse(); // Doğrulanana kadar pasif kalır
    }

    @Test
    @DisplayName("2. enable2fa: Geçerli kodla 2FA'yı aktif edip kurtarma kodları dönmelidir")
    void shouldEnable2faWithValidCode() {
        testUser.setTwoFactorSecret("JBSWY3DPEHPK3PXP");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("JBSWY3DPEHPK3PXP", "123456")).thenReturn(true);
        when(totpService.generateBackupCodes(8)).thenReturn(List.of("CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8"));
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        TwoFactorRecoveryCodesDto response = twoFactorService.enable2fa("testuser", "123456");

        assertThat(response.getRecoveryCodes()).hasSize(8);
        assertThat(testUser.is2faEnabled()).isTrue();
        assertThat(testUser.getBackupCodes()).contains("CODE1,CODE2");
    }

    @Test
    @DisplayName("3. enable2fa: Hatalı kod girildiğinde hata fırlatmalıdır")
    void shouldThrowExceptionWhenEnablingWithInvalidCode() {
        testUser.setTwoFactorSecret("JBSWY3DPEHPK3PXP");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("JBSWY3DPEHPK3PXP", "000000")).thenReturn(false);

        assertThatThrownBy(() -> twoFactorService.enable2fa("testuser", "000000"))
                .isInstanceOf(_400_BadRequestException.class)
                .hasMessageContaining("Geçersiz 2FA doğrulama kodu");
    }

    @Test
    @DisplayName("4. disable2fa: Geçerli kodla 2FA'yı kapatıp secret ve kodları temizlemelidir")
    void shouldDisable2faWithValidCode() {
        testUser.set2faEnabled(true);
        testUser.setTwoFactorSecret("JBSWY3DPEHPK3PXP");
        testUser.setBackupCodes("CODE1,CODE2");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("JBSWY3DPEHPK3PXP", "123456")).thenReturn(true);
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        twoFactorService.disable2fa("testuser", "123456");

        assertThat(testUser.is2faEnabled()).isFalse();
        assertThat(testUser.getTwoFactorSecret()).isNull();
        assertThat(testUser.getBackupCodes()).isNull();
    }

    @Test
    @DisplayName("5. verifyLogin2fa: Geçerli TOTP kodu ile tam JWT token üretmelidir")
    void shouldVerifyLoginWithValidTotpCode() {
        testUser.set2faEnabled(true);
        testUser.setTwoFactorSecret("JBSWY3DPEHPK3PXP");

        TwoFactorVerifyRequestDto request = TwoFactorVerifyRequestDto.builder()
                .preAuthToken("valid.pre.auth.token")
                .code("123456")
                .build();

        when(jwtTokenProvider.validateToken("valid.pre.auth.token")).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromJwt("valid.pre.auth.token")).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("JBSWY3DPEHPK3PXP", "123456")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(eq("testuser"), anyList())).thenReturn("full.access.token");
        when(jwtTokenProvider.generateRefreshToken("testuser")).thenReturn("full.refresh.token");

        JwtResponseDto response = twoFactorService.verifyLogin2fa(request);

        assertThat(response.getAccessToken()).isEqualTo("full.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("full.refresh.token");
        assertThat(response.is2faRequired()).isFalse();
    }

    @Test
    @DisplayName("6. verifyLogin2fa: Kurtarma kodu kullanıldığında giriş başarılı olmalı ve kod tüketilmeli")
    void shouldVerifyLoginWithBackupCodeAndConsumeIt() {
        testUser.set2faEnabled(true);
        testUser.setTwoFactorSecret("JBSWY3DPEHPK3PXP");
        testUser.setBackupCodes("RECOVER1,RECOVER2,RECOVER3");

        TwoFactorVerifyRequestDto request = TwoFactorVerifyRequestDto.builder()
                .preAuthToken("valid.pre.auth.token")
                .code("RECOVER2") // Tek kullanımlık kurtarma kodu
                .build();

        when(jwtTokenProvider.validateToken("valid.pre.auth.token")).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromJwt("valid.pre.auth.token")).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("JBSWY3DPEHPK3PXP", "RECOVER2")).thenReturn(false); // TOTP değil
        when(jwtTokenProvider.generateAccessToken(eq("testuser"), anyList())).thenReturn("full.access.token");
        when(jwtTokenProvider.generateRefreshToken("testuser")).thenReturn("full.refresh.token");

        JwtResponseDto response = twoFactorService.verifyLogin2fa(request);

        assertThat(response.getAccessToken()).isEqualTo("full.access.token");
        // RECOVER2 tüketilmeli, RECOVER1 ve RECOVER3 kalmalı
        assertThat(testUser.getBackupCodes()).isEqualTo("RECOVER1,RECOVER3");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("7. get2faStatus: Aktiflik ve kalan kurtarma kodu sayısını dönmelidir")
    void shouldReturn2faStatus() {
        testUser.set2faEnabled(true);
        testUser.setBackupCodes("CODE1,CODE2,CODE3");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        TwoFactorStatusDto status = twoFactorService.get2faStatus("testuser");

        assertThat(status.is2faEnabled()).isTrue();
        assertThat(status.getRemainingBackupCodes()).isEqualTo(3);
    }
}

