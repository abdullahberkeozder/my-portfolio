package com.berkeozder.business.dto.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagDto implements Serializable {

    private Long tagId;

    @NotBlank(message = "Etiket adı boş bırakılamaz")
    @Size(min = 2, max = 50, message = "Etiket adı 2 ile 50 karakter arasında olmalıdır")
    private String name;
}

