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
public class AiSummaryRequestDto implements Serializable {

    @NotBlank(message = "Özetlenecek metin boş olamaz.")
    @Size(min = 20, max = 20000, message = "Metin uzunluğu 20 ile 20.000 karakter arasında olmalıdır.")
    private String text;

    private String title;
}

