package com.berkeozder.business.dto;

import com.berkeozder.audit.AuditingAwareBaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogDto extends AuditingAwareBaseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long blogId;

    @NotEmpty(message = "{blog.header.validation.constraints.NotNull.message}")
    @Size(min = 2, max = 150, message = "{blog.header.least.validation.constraints.NotNull.message}")
    private String header;

    @NotEmpty(message = "{blog.title.validation.constraints.NotNull.message}")
    @Size(min = 2, max = 150, message = "{blog.title.least.validation.constraints.NotNull.message}")
    private String title;

    @NotEmpty(message = "{blog.content.validation.constraints.NotNull.message}")
    @Size(min = 5, max = 50000, message = "{blog.content.least.validation.constraints.NotNull.message}")
    private String content;

    private String image;

    private BlogCategoryDto blogCategoryDto;

    private Long authorId;
    private String authorUsername;

    @Builder.Default
    private Set<String> tags = new HashSet<>();

    private int commentCount;

    private String aiSummary;
    private boolean hasEmbedding;

    @JsonProperty("isDeleted")
    private boolean isDeleted;
    private Date deletedAt;

    private Long version;

    @Builder.Default
    private Long viewsCount = 0L;

    @Builder.Default
    private Long likesCount = 0L;
}
