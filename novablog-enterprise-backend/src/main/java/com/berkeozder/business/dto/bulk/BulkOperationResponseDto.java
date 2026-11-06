package com.berkeozder.business.dto.bulk;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Toplu İşlem Sonuç DTO'su (Adım 15)
 *
 * @author Berke Özder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Toplu blog işlemleri sonuç nesnesi")
public class BulkOperationResponseDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Gerçekleştirilen işlem türü", example = "SOFT_DELETE")
    private BulkActionType action;

    @Schema(description = "İşlem yapılması talep edilen kayıt adedi", example = "5")
    private int requestedCount;

    @Schema(description = "Başarıyla etkilenen/güncellenen kayıt adedi", example = "5")
    private int affectedCount;

    @Schema(description = "İşlem uygulanamayan ID'ler (kayıt bulunamadıysa)", example = "[]")
    private List<Long> failedIds;

    @Schema(description = "İşlem sonuç mesajı", example = "5 adet blog başarıyla arşive taşındı (Soft Delete).")
    private String message;
}

