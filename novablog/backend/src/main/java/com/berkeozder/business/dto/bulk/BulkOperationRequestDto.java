package com.berkeozder.business.dto.bulk;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Toplu İşlem İstek DTO'su (Adım 15)
 *
 * @author Berke Özder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Toplu blog işlemleri istek nesnesi")
public class BulkOperationRequestDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "İşlem yapılacak blog ID listesi", example = "[1, 2, 3]")
    @NotEmpty(message = "En az bir blog ID'si belirtilmelidir.")
    @Size(max = 100, message = "Tek seferde en fazla 100 kayıt üzerinde toplu işlem yapılabilir.")
    private List<Long> blogIds;

    @Schema(description = "Gerçekleştirilecek toplu işlem türü", example = "SOFT_DELETE")
    @NotNull(message = "İşlem türü (action) belirtilmelidir.")
    private BulkActionType action;

    @Schema(description = "Hedef kategori ID'si (CHANGE_CATEGORY işlemi için zorunludur)", example = "2")
    private Long targetCategoryId;

    @Schema(description = "Eklenecek etiket listesi (ADD_TAG işlemi için zorunludur)", example = "[\"spring-boot\", \"microservices\"]")
    private List<String> tags;
}

