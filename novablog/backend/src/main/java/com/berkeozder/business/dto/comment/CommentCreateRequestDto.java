package com.berkeozder.business.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateRequestDto implements Serializable {

    @NotBlank(message = "Yorum içeriği boş bırakılamaz")
    @Size(min = 3, max = 1000, message = "Yorum 3 ile 1000 karakter arasında olmalıdır")
    private String content;
}

