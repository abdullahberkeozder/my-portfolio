package com.berkeozder.security.twofactor;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * RFC 6238 TOTP (Time-Based One-Time Password) ve ZXing QR Kod Üretim Servisi.
 *
 * Google Authenticator, Microsoft Authenticator ve Authy ile %100 uyumludur.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
public class TotpService {

    public static final String ISSUER = "NovaBlog";
    private static final int TIME_STEP_SECONDS = 30;
    private static final int WINDOW_SIZE = 1; // +/- 30 saniye saat farkı toleransı
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base32 BASE32 = new Base32();

    /**
     * Google Authenticator için 160-bit (20 byte) güvenli rastgele Base32 gizli anahtarı üretir.
     */
    public String generateSecret() {
        byte[] buffer = new byte[20];
        SECURE_RANDOM.nextBytes(buffer);
        return BASE32.encodeToString(buffer).replace("=", "");
    }

    /**
     * Standart otpauth:// URI dizesini oluşturur.
     */
    public String getOtpAuthUrl(String username, String secret) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                ISSUER, username, secret, ISSUER);
    }

    /**
     * Belirtilen otpauth:// URL'i için Data URI formatında (data:image/png;base64,...) QR Kod üretir.
     */
    public String generateQrCodeDataUri(String otpAuthUrl, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(otpAuthUrl, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();

            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("QR Kod oluşturulamadı: {}", e.getMessage(), e);
            throw new IllegalStateException("QR Kod görseli oluşturulamadı: " + e.getMessage(), e);
        }
    }

    /**
     * 6 haneli TOTP kodunu, secret ve zaman penceresi toleransı ile doğrular.
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.trim().length() != 6) {
            return false;
        }

        try {
            String cleanCode = code.trim();
            long currentTimeIndex = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;

            for (int i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
                String expected = generateCodeForTime(secret, currentTimeIndex + i);
                if (cleanCode.equals(expected)) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("TOTP kod doğrulaması sırasında hata: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Verilen zaman dilimi (time index) için 6 haneli TOTP kodunu hesaplar (RFC 6238 / RFC 4226).
     */
    public String generateCodeForTime(String secret, long timeIndex) throws Exception {
        byte[] key = BASE32.decode(secret.toUpperCase());

        ByteBuffer buffer = ByteBuffer.allocate(8);
        buffer.putLong(timeIndex);
        byte[] timeBytes = buffer.array();

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key, "HmacSHA1"));
        byte[] hash = mac.doFinal(timeBytes);

        // Dinamik kısaltma (Dynamic Truncation)
        int offset = hash[hash.length - 1] & 0x0F;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);

        int otp = binary % 1_000_000;
        return String.format("%06d", otp);
    }

    /**
     * Acil durum kurtarma kodları üretir (8 haneli, örn: 8 adet).
     */
    public List<String> generateBackupCodes(int count) {
        List<String> codes = new ArrayList<>(count);
        char[] chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray(); // Karışıklığı önlemek için 0,O,1,I hariç

        for (int i = 0; i < count; i++) {
            StringBuilder sb = new StringBuilder(8);
            for (int j = 0; j < 8; j++) {
                sb.append(chars[SECURE_RANDOM.nextInt(chars.length)]);
            }
            codes.add(sb.toString());
        }
        return codes;
    }
}

