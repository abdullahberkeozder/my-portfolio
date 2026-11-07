package com.berkeozder;

import com.berkeozder.security.twofactor.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TotpService Unit Tests")
class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }

    @Test
    @DisplayName("1. generateSecret: 32 karakterli Base32 gizli anahtar üretmelidir")
    void shouldGenerateValidBase32Secret() {
        String secret = totpService.generateSecret();

        assertThat(secret).isNotNull();
        assertThat(secret).hasSize(32);
        assertThat(secret).matches("^[A-Z2-7]+$"); // Base32 karakter seti
    }

    @Test
    @DisplayName("2. getOtpAuthUrl: Standart otpauth:// URI şablonunu oluşturmalıdır")
    void shouldCreateOtpAuthUrl() {
        String secret = "JBSWY3DPEHPK3PXP";
        String username = "berkeozder";

        String url = totpService.getOtpAuthUrl(username, secret);

        assertThat(url).startsWith("otpauth://totp/NovaBlog:berkeozder");
        assertThat(url).contains("secret=" + secret);
        assertThat(url).contains("issuer=NovaBlog");
    }

    @Test
    @DisplayName("3. generateQrCodeDataUri: Taranabilir Base64 Data URI QR Kod üretmelidir")
    void shouldGenerateQrCodeDataUri() {
        String otpAuthUrl = "otpauth://totp/NovaBlog:test?secret=JBSWY3DPEHPK3PXP&issuer=NovaBlog";

        String qrDataUri = totpService.generateQrCodeDataUri(otpAuthUrl, 200, 200);

        assertThat(qrDataUri).isNotNull();
        assertThat(qrDataUri).startsWith("data:image/png;base64,");
        assertThat(qrDataUri.length()).isGreaterThan(100);
    }

    @Test
    @DisplayName("4. verifyCode: Mevcut zaman diliminde üretilen 6 haneli kodu doğrulamalıdır")
    void shouldVerifyValidCode() throws Exception {
        String secret = totpService.generateSecret();
        long currentInterval = System.currentTimeMillis() / 1000 / 30;
        String validCode = totpService.generateCodeForTime(secret, currentInterval);

        boolean result = totpService.verifyCode(secret, validCode);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("5. verifyCode: Saat kayması toleransı (+/- 30 saniye) içinde kodu doğrulamalıdır")
    void shouldVerifyCodeWithinClockDriftWindow() throws Exception {
        String secret = totpService.generateSecret();
        long currentInterval = System.currentTimeMillis() / 1000 / 30;

        // Bir önceki 30 saniyelik adım (-1 adım)
        String pastCode = totpService.generateCodeForTime(secret, currentInterval - 1);
        assertThat(totpService.verifyCode(secret, pastCode)).isTrue();

        // Bir sonraki 30 saniyelik adım (+1 adım)
        String futureCode = totpService.generateCodeForTime(secret, currentInterval + 1);
        assertThat(totpService.verifyCode(secret, futureCode)).isTrue();
    }

    @Test
    @DisplayName("6. verifyCode: Hatalı veya süresi geçmiş kodu reddetmelidir")
    void shouldRejectInvalidCode() {
        String secret = totpService.generateSecret();

        boolean result = totpService.verifyCode(secret, "000000");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("7. generateBackupCodes: Belirtilen adette 8 haneli kurtarma kodları üretmelidir")
    void shouldGenerateBackupCodes() {
        List<String> codes = totpService.generateBackupCodes(8);

        assertThat(codes).hasSize(8);
        for (String code : codes) {
            assertThat(code).hasSize(8);
            assertThat(code).matches("^[A-Z2-9]+$");
        }
    }
}

