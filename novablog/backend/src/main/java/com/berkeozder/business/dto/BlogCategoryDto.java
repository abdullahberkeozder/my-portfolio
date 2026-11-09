package com.berkeozder.business.dto;

import com.berkeozder.audit.AuditingAwareBaseDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;

import java.io.Serial;
import java.io.Serializable;

/**
 * Data Transfer Object representing a Blog Category.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2
public class BlogCategoryDto extends AuditingAwareBaseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long blogCategoryId;

    @NotEmpty(message = "{blog.category.validation.constraints.NotNull.message}")
    @Size(min = 5, max = 25, message = "{blog.category.least.validation.constraints.NotNull.message}")
    private String categoryName;
}
