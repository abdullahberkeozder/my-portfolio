package com.berkeozder.ai.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSummaryResponseDto implements Serializable {

    private String summary;
    private int originalCharacterCount;
    private int summaryCharacterCount;
    private double compressionRatePercent;
    private String provider;
    private String model;
}
