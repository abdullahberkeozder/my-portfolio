package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "comments")
@SQLDelete(sql = "UPDATE comments SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE comment_id = ?")
@SQLRestriction("is_deleted = false")
public class CommentEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @Builder.Default
    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = true;

    // AI Content Moderation & Sentiment (Adım 22)
    @Builder.Default
    @Column(name = "is_ai_moderated")
    private Boolean isAiModerated = false;

    @Builder.Default
    @Column(name = "sentiment", length = 20)
    private String sentiment = "NEUTRAL";

    @Builder.Default
    @Column(name = "toxicity_score")
    private Double toxicityScore = 0.0;

    // Soft Delete
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Date deletedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blog_id", nullable = false)
    private BlogEntity blog;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // ==========================================
    // MODERATION STATE MACHINE METHODS (Adım 2)
    // ==========================================

    public CommentModerationStatus getModerationStatus() {
        if (this.isDeleted) {
            return CommentModerationStatus.SOFT_DELETED;
        }
        if (Boolean.TRUE.equals(this.isAiModerated)) {
            return this.isApproved ? CommentModerationStatus.APPROVED : CommentModerationStatus.FLAGGED_TOXIC;
        }
        return this.isApproved ? CommentModerationStatus.APPROVED : CommentModerationStatus.PENDING_MODERATION;
    }

    public void approve() {
        if (this.isDeleted) {
            throw new IllegalStateException("Silinmiş yorum onaylanamaz. CommentId: " + this.commentId);
        }
        this.isApproved = true;
    }

    public void flagToxic(String reason, double toxicityScore, String sentiment) {
        this.isApproved = false;
        this.isAiModerated = true;
        this.toxicityScore = toxicityScore;
        this.sentiment = (sentiment != null && !sentiment.isBlank()) ? sentiment : "NEGATIVE";
    }

    public void softDelete() {
        if (this.isDeleted) {
            throw new IllegalStateException("Yorum zaten silinmiş durumda. CommentId: " + this.commentId);
        }
        this.isDeleted = true;
        this.deletedAt = new Date();
    }

    public void restore() {
        if (!this.isDeleted) {
            throw new IllegalStateException("Yorum zaten aktif durumda. CommentId: " + this.commentId);
        }
        this.isDeleted = false;
        this.deletedAt = null;
    }
}

