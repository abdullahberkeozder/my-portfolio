package com.berkeozder.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * Kurumsal Çok Kriterli Dinamik Blog Filtreleme DTO'su (Adım 14)
 * JPA Criteria API ve Specification ile tip güvenli dinamik sorgulama için kullanılır.
 *
 * @author Berke Özder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Blog dinamik çok kriterli filtreleme istek nesnesi")
public class BlogFilterRequestDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Başlık, alt başlık (header) veya içerikte aranacak kelime", example = "Spring Boot")
    private String search;

    @Schema(description = "Filtrelenecek kategori ID'si", example = "1")
    private Long categoryId;

    @Schema(description = "Filtrelenecek kategori adı (tam veya kısmi eşleşme)", example = "Yazılım Mimarisi")
    private String categoryName;

    @Schema(description = "Etiket listesi (OR mantığı ile filtreler)", example = "[\"spring-boot\", \"security\"]")
    private List<String> tags;

    @Schema(description = "Yazar kullanıcı adı, e-posta veya oluşturan kullanıcı bilgisi", example = "admin")
    private String author;

    @Schema(description = "Oluşturulma başlangıç tarihi (yyyy-MM-dd)", example = "2026-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date startDate;

    @Schema(description = "Oluşturulma bitiş tarihi (yyyy-MM-dd)", example = "2026-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date endDate;

    @Schema(description = "Minimum yorum adedi filtresi", example = "1")
    @Min(value = 0, message = "Minimum yorum sayısı negatif olamaz")
    private Integer minCommentCount;

    @Schema(description = "Görseli olan (true) veya olmayan (false) blogları filtrele", example = "true")
    private Boolean hasImage;

    @Schema(description = "Sayfa numarası (0-tabanlı)", example = "0")
    @Builder.Default
    @Min(value = 0, message = "Sayfa numarası 0 veya daha büyük olmalıdır")
    private int page = 0;

    @Schema(description = "Sayfa başına kayıt adedi", example = "10")
    @Builder.Default
    @Min(value = 1, message = "Sayfa boyutu en az 1 olmalıdır")
    @Max(value = 100, message = "Sayfa boyutu en fazla 100 olabilir")
    private int size = 10;

    @Schema(description = "Sıralama yapılacak alan (createdDate, header, title, blogId)", example = "createdDate")
    @Builder.Default
    private String sortBy = "createdDate";

    @Schema(description = "Sıralama yönü (asc, desc)", example = "desc")
    @Builder.Default
    private String sortDir = "desc";
}

