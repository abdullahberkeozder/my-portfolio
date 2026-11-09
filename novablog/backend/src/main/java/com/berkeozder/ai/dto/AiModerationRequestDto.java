package com.berkeozder.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiModerationRequestDto implements Serializable {

    @NotBlank(message = "Denetlenecek metin boş olamaz.")
    @Size(max = 2000, message = "Metin en fazla 2000 karakter olabilir.")
    private String text;
}

