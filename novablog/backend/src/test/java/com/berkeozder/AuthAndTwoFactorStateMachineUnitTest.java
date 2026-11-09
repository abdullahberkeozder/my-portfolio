package com.berkeozder;

import com.berkeozder.business.dto.auth.JwtResponseDto;
import com.berkeozder.business.dto.twofactor.TwoFactorStatusDto;
import com.berkeozder.data.entity.TwoFactorEnrollmentStatus;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.security.jwt.AuthState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Faz 2: 2FA & Auth State Machine Unit Tests")
class AuthAndTwoFactorStateMachineUnitTest {

    @Test
    @DisplayName("1. TwoFactorEnrollmentStatus: DISABLED -> PENDING_VERIFICATION -> ENABLED -> DISABLED Geçişleri")
    void testTwoFactorEnrollmentStateTransitions() {
        UserEntity user = UserEntity.builder()
                .userId(1L)
                .username("berke")
                .email("berke@example.com")
                .is2faEnabled(false)
                .build();

        // 1. Başlangıç durumu
        assertThat(user.getTwoFactorEnrollmentStatus()).isEqualTo(TwoFactorEnrollmentStatus.DISABLED);
        assertThat(user.getRemainingBackupCodesCount()).isZero();

        // 2. Setup başlatma: DISABLED -> PENDING_VERIFICATION
        user.initiateTwoFactorEnrollment("JBSWY3DPEHPK3PXP");
        assertThat(user.getTwoFactorEnrollmentStatus()).isEqualTo(TwoFactorEnrollmentStatus.PENDING_VERIFICATION);
        assertThat(user.is2faEnabled()).isFalse();
        assertThat(user.getTwoFactorSecret()).isEqualTo("JBSWY3DPEHPK3PXP");

        // 3. İlk kod onayı: PENDING_VERIFICATION -> ENABLED
        List<String> recoveryCodes = List.of("REC001", "REC002", "REC003");
        user.confirmTwoFactorEnrollment(recoveryCodes);
        assertThat(user.getTwoFactorEnrollmentStatus()).isEqualTo(TwoFactorEnrollmentStatus.ENABLED);
        assertThat(user.is2faEnabled()).isTrue();
        assertThat(user.getRemainingBackupCodesCount()).isEqualTo(3);

        // 4. Tek kullanımlık kurtarma kodu tüketimi (Single-use consumption)
        boolean consumed1 = user.consumeBackupCode("rec001"); // Case-insensitive
        assertThat(consumed1).isTrue();
        assertThat(user.getRemainingBackupCodesCount()).isEqualTo(2);

        boolean invalidConsumed = user.consumeBackupCode("INVALID_CODE");
        assertThat(invalidConsumed).isFalse();
        assertThat(user.getRemainingBackupCodesCount()).isEqualTo(2);

        user.consumeBackupCode("REC002");
        user.consumeBackupCode("REC003");
        assertThat(user.getRemainingBackupCodesCount()).isZero();
        assertThat(user.getBackupCodes()).isNull();

        // 5. Devre dışı bırakma: ENABLED -> DISABLED
        user.disableTwoFactor();
        assertThat(user.getTwoFactorEnrollmentStatus()).isEqualTo(TwoFactorEnrollmentStatus.DISABLED);
        assertThat(user.is2faEnabled()).isFalse();
        assertThat(user.getTwoFactorSecret()).isNull();
        assertThat(user.getBackupCodes()).isNull();
    }

    @Test
    @DisplayName("2. 2FA Invariant Koruyucuları: Geçersiz geçişlerde IllegalStateException fırlatılmalıdır")
    void testTwoFactorInvariants() {
        UserEntity user = UserEntity.builder()
                .is2faEnabled(false)
                .build();

        // Kurulum başlatılmadan confirm çağrılamaz
        assertThatThrownBy(() -> user.confirmTwoFactorEnrollment(List.of("CODE1")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Bekleyen bir 2FA kurulum kaydı bulunamadı");

        // Zaten devre dışı olan hesap tekrar disable edilemez
        assertThatThrownBy(user::disableTwoFactor)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("zaten etkin değildir");

        // Zaten ENABLED olan hesapta doğrudan initiate çağrılamaz (önce disable edilmelidir)
        user.initiateTwoFactorEnrollment("SECRET1");
        user.confirmTwoFactorEnrollment(List.of("CODE1"));
        assertThatThrownBy(() -> user.initiateTwoFactorEnrollment("SECRET2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("zaten etkinleştirilmiş durumdadır");
    }

    @Test
    @DisplayName("3. AuthState & TwoFactorStatus DTO Entegrasyonu")
    void testAuthStateAndStatusDto() {
        // Pre-auth DTO durumu
        JwtResponseDto preAuthDto = JwtResponseDto.builder()
                .is2faRequired(true)
                .preAuthToken("pre.auth.token.sample")
                .authState(AuthState.PRE_AUTH_2FA_REQUIRED)
                .build();

        assertThat(preAuthDto.getAuthState()).isEqualTo(AuthState.PRE_AUTH_2FA_REQUIRED);
        assertThat(preAuthDto.is2faRequired()).isTrue();

        // Authenticated DTO durumu
        JwtResponseDto fullAuthDto = JwtResponseDto.builder()
                .accessToken("access.token")
                .refreshToken("refresh.token")
                .authState(AuthState.AUTHENTICATED)
                .build();

        assertThat(fullAuthDto.getAuthState()).isEqualTo(AuthState.AUTHENTICATED);
        assertThat(fullAuthDto.is2faRequired()).isFalse();

        // TwoFactorStatusDto durumu
        TwoFactorStatusDto statusDto = TwoFactorStatusDto.builder()
                .is2faEnabled(true)
                .enrollmentStatus(TwoFactorEnrollmentStatus.ENABLED)
                .remainingBackupCodes(5)
                .build();

        assertThat(statusDto.getEnrollmentStatus()).isEqualTo(TwoFactorEnrollmentStatus.ENABLED);
        assertThat(statusDto.is2faEnabled()).isTrue();
        assertThat(statusDto.getRemainingBackupCodes()).isEqualTo(5);
    }
}

