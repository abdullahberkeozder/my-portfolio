package com.berkeozder.ai.dto;

import lombok.*;

import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogSemanticSearchResultDto implements Serializable {

    private Long blogId;
    private String header;
    private String title;
    private String contentExcerpt;
    private String image;
    private String categoryName;
    private Set<String> tags;
    private String aiSummary;

    // Arama Skorları
    private double similarityScore; // Kosinüs benzerliği: 0.0 - 1.0
    private double keywordScore; // Kelime eşleşme skoru
    private double combinedScore; // Hibrit (Füzyon) skor
    private String searchType; // "SEMANTIC" veya "HYBRID"
}

