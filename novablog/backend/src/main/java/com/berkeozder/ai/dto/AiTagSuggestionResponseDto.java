package com.berkeozder.ai.dto;

import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiTagSuggestionResponseDto implements Serializable {

    private List<String> suggestedTags;
    private String suggestedCategoryName;
    private Long suggestedCategoryId;
    private double confidenceScore;
    private String provider;
}

