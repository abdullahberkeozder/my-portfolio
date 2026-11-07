package com.berkeozder.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiTagSuggestionRequestDto implements Serializable {

    @NotBlank(message = "Blog başlığı boş olamaz.")
    private String title;

    @NotBlank(message = "Blog içeriği boş olamaz.")
    private String content;

    private Long categoryId;
}
