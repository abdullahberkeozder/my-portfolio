package com.berkeozder.ai.dto;

import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiModerationResponseDto implements Serializable {

    private boolean flagged;
    private double toxicityScore; // 0.0 - 1.0
    private String sentiment; // "POSITIVE", "NEUTRAL", "NEGATIVE"
    private double sentimentScore; // -1.0 to 1.0
    private List<String> flaggedCategories;
    private String reason;
    private String provider;
}

