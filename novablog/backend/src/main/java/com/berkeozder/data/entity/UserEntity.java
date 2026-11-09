package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import com.berkeozder.security.oauth2.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class UserEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", unique = true, nullable = false, length = 100)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 50)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 150)
    private String providerId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Builder.Default
    @Column(name = "is_2fa_enabled", nullable = false)
    private boolean is2faEnabled = false;

    @Column(name = "two_factor_secret", length = 100)
    private String twoFactorSecret;

    @Column(name = "backup_codes", length = 1000)
    private String backupCodes;

    @Builder.Default
    @Column(name = "is_account_non_expired", nullable = false)
    private boolean isAccountNonExpired = true;

    @Builder.Default
    @Column(name = "is_account_non_locked", nullable = false)
    private boolean isAccountNonLocked = true;

    @Builder.Default
    @Column(name = "is_credentials_non_expired", nullable = false)
    private boolean isCredentialsNonExpired = true;

    @Builder.Default
    @Column(name = "is_enabled", nullable = false)
    private boolean isEnabled = true;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles = new HashSet<>();

    // -------------------------------------------------------------------------
    // 2FA / TOTP Yaşam Döngüsü & Durum Makinesi Metotları (Adım 3)
    // -------------------------------------------------------------------------

    /**
     * Kullanıcının anlık 2FA durumunu döner.
     */
    public TwoFactorEnrollmentStatus getTwoFactorEnrollmentStatus() {
        if (this.is2faEnabled) {
            return TwoFactorEnrollmentStatus.ENABLED;
        }
        if (this.twoFactorSecret != null && !this.twoFactorSecret.isBlank()) {
            return TwoFactorEnrollmentStatus.PENDING_VERIFICATION;
        }
        return TwoFactorEnrollmentStatus.DISABLED;
    }

    /**
     * 2FA kurulum sürecini başlatır (DISABLED -> PENDING_VERIFICATION).
     *
     * @param secret Üretilen Base32 TOTP gizli anahtarı
     */
    public void initiateTwoFactorEnrollment(String secret) {
        if (this.is2faEnabled) {
            throw new IllegalStateException("2FA bu hesap için zaten etkinleştirilmiş durumdadır.");
        }
        this.twoFactorSecret = secret;
        this.is2faEnabled = false;
    }

    /**
     * 2FA kurulumunu ilk geçerli kodla onaylayıp aktifleştirir (PENDING_VERIFICATION -> ENABLED).
     *
     * @param backupCodes Üretilen acil durum kurtarma kodları
     */
    public void confirmTwoFactorEnrollment(List<String> backupCodes) {
        if (this.twoFactorSecret == null || this.twoFactorSecret.isBlank()) {
            throw new IllegalStateException("Bekleyen bir 2FA kurulum kaydı bulunamadı. Lütfen önce kurulumu başlatınız.");
        }
        this.is2faEnabled = true;
        if (backupCodes != null && !backupCodes.isEmpty()) {
            this.backupCodes = String.join(",", backupCodes);
        }
    }

    /**
     * 2FA'yı tamamen devre dışı bırakır ve anahtarları sıfırlar (ENABLED / PENDING_VERIFICATION -> DISABLED).
     */
    public void disableTwoFactor() {
        if (!this.is2faEnabled && (this.twoFactorSecret == null || this.twoFactorSecret.isBlank())) {
            throw new IllegalStateException("2FA bu hesap için zaten etkin değildir.");
        }
        this.is2faEnabled = false;
        this.twoFactorSecret = null;
        this.backupCodes = null;
    }

    /**
     * Tek kullanımlık kurtarma kodunu tüketir (Single-use consumption).
     *
     * @param code Kullanıcının girdiği kod
     * @return Kod eşleşti ve tüketildiyse true, aksi halde false
     */
    public boolean consumeBackupCode(String code) {
        if (!this.is2faEnabled || this.backupCodes == null || this.backupCodes.isBlank() || code == null) {
            return false;
        }
        String cleanCode = code.trim().toUpperCase();
        List<String> codes = new ArrayList<>(Arrays.asList(this.backupCodes.split(",")));
        if (codes.remove(cleanCode)) {
            this.backupCodes = codes.isEmpty() ? null : String.join(",", codes);
            return true;
        }
        return false;
    }

    /**
     * Kalan geçerli acil durum kurtarma kodu sayısını döner.
     */
    public int getRemainingBackupCodesCount() {
        if (this.backupCodes == null || this.backupCodes.isBlank()) {
            return 0;
        }
        return this.backupCodes.split(",").length;
    }
}

