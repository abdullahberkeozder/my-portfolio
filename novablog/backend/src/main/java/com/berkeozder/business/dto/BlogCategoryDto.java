package com.berkeozder.business.dto;

import com.berkeozder.audit.AuditingAwareBaseDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogCategoryDto extends AuditingAwareBaseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long blogCategoryId;

    @NotEmpty(message = "{blog.category.validation.constraints.NotNull.message}")
    @Size(min = 2, max = 50, message = "{blog.category.least.validation.constraints.NotNull.message}")
    private String categoryName;
}
