package com.berkeozder.business.dto.batch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorAnalyticsReportDto implements Serializable {

    private Long authorId;
    private String username;
    private String fullName;
    private int blogCount;
    private long totalWordCount;
    private double avgWordCount;
    private long commentCount;
    private double engagementScore;
}

