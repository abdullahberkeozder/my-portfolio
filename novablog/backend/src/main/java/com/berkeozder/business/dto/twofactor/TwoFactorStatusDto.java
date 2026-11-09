package com.berkeozder.business.dto.twofactor;

import com.berkeozder.data.entity.TwoFactorEnrollmentStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kullanıcının mevcut 2FA durum bilgisi.
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorStatusDto {

    @JsonProperty("is2faEnabled")
    private boolean is2faEnabled;

    private TwoFactorEnrollmentStatus enrollmentStatus;

    private int remainingBackupCodes;

    public boolean is2faEnabled() {
        return is2faEnabled;
    }

    @JsonProperty("2faEnabled")
    public boolean get2faEnabled() {
        return is2faEnabled;
    }
}

