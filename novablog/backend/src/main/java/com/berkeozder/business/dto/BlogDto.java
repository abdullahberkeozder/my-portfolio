package com.berkeozder.business.dto;

import com.berkeozder.audit.AuditingAwareBaseDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;

import java.io.Serial;
import java.io.Serializable;

// LOMBOK
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

// BlogCategoryDto(1) - BlogDto(N)
public class BlogDto extends AuditingAwareBaseDto implements Serializable {

    // Serial
    @Serial
    private static final long serialVersionUID = 1L;

    // ID
    private Long blogId;

    // Header
    @NotEmpty(message = "{blog.header.validation.constraints.NotNull.message}")
    @Size(min = 5, max = 25, message = "{blog.header.least.validation.constraints.NotNull.message}")
    private String header;

    // Title
    @NotEmpty(message = "{blog.title.validation.constraints.NotNull.message}")
    @Size(min = 5, max = 25, message = "{blog.title.least.validation.constraints.NotNull.message}")
    private String title;

    // Content
    @NotEmpty(message = "{blog.content.validation.constraints.NotNull.message}")
    @Size(min = 5, max = 25, message = "{blog.content.least.validation.constraints.NotNull.message}")
    private String content;

    // Image
    private String image;

    /// //////////////////////////////////////////////
    // Relation
    private BlogCategoryDto blogCategoryDto;

    // Yazar Bilgisi
    private Long authorId;
    private String authorUsername;

    // Etiketler
    @Builder.Default
    private java.util.Set<String> tags = new java.util.HashSet<>();

    // Yorum Sayısı
    private int commentCount;

    // AI Summary & Vector Search (Adım 22)
    private String aiSummary;
    private boolean hasEmbedding;

    // Soft Delete Bilgisi
    @com.fasterxml.jackson.annotation.JsonProperty("isDeleted")
    private boolean isDeleted;
    private java.util.Date deletedAt;

    // Concurrency & Engagement Metrics (Adım 24)
    private Long version;
    @Builder.Default
    private Long viewsCount = 0L;
    @Builder.Default
    private Long likesCount = 0L;

} // end BlogDto
