package com.berkeozder.business.dto.comment;

import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDto implements Serializable {

    private Long commentId;
    private Long blogId;
    private String content;
    private Long userId;
    private String username;
    private String userFullName;
    private boolean isApproved;
    private Date createdDate;

    // AI Moderation (Adım 22)
    private Boolean isAiModerated;
    private String sentiment;
    private Double toxicityScore;

    // Soft Delete Bilgisi
    @com.fasterxml.jackson.annotation.JsonProperty("isDeleted")
    private boolean isDeleted;
    private Date deletedAt;
}

