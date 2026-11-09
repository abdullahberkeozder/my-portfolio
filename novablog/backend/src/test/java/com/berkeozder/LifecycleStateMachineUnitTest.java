package com.berkeozder;

import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.BlogLifecycleStatus;
import com.berkeozder.data.entity.CommentEntity;
import com.berkeozder.data.entity.CommentModerationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Domain State Machines Unit Tests (Blog Lifecycle & Comment Moderation)")
public class LifecycleStateMachineUnitTest {

    @Test
    @DisplayName("BlogEntity: ACTIVE -> SOFT_DELETED -> ACTIVE geçişleri doğrulanmalıdır")
    void testBlogLifecycleTransitions() {
        BlogEntity blog = BlogEntity.builder()
                .blogId(101L)
                .header("Lifecycle-Test")
                .title("Lifecycle Title")
                .content("Content body")
                .isDeleted(false)
                .build();

        // 1. Initial State
        assertThat(blog.getLifecycleStatus()).isEqualTo(BlogLifecycleStatus.ACTIVE);

        // 2. Transition to SOFT_DELETED
        blog.softDelete();
        assertThat(blog.isDeleted()).isTrue();
        assertThat(blog.getDeletedAt()).isNotNull();
        assertThat(blog.getLifecycleStatus()).isEqualTo(BlogLifecycleStatus.SOFT_DELETED);

        // 3. Double softDelete must throw IllegalStateException
        assertThatThrownBy(blog::softDelete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("zaten silinmiş");

        // 4. Transition to RESTORED (ACTIVE)
        blog.restore();
        assertThat(blog.isDeleted()).isFalse();
        assertThat(blog.getDeletedAt()).isNull();
        assertThat(blog.getLifecycleStatus()).isEqualTo(BlogLifecycleStatus.ACTIVE);

        // 5. Double restore must throw IllegalStateException
        assertThatThrownBy(blog::restore)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("zaten aktif");
    }

    @Test
    @DisplayName("BlogEntity: 30 günü aşan silinmiş kayıtlar PURGE_ELIGIBLE durumuna geçmelidir")
    void testBlogPurgeEligibleStatus() {
        // 35 gün önce silinmiş blog
        Date thirtyFiveDaysAgo = new Date(System.currentTimeMillis() - (35L * 24 * 60 * 60 * 1000L));
        BlogEntity expiredBlog = BlogEntity.builder()
                .blogId(102L)
                .header("Expired-Blog")
                .isDeleted(true)
                .deletedAt(thirtyFiveDaysAgo)
                .build();

        assertThat(expiredBlog.getLifecycleStatus(30L)).isEqualTo(BlogLifecycleStatus.PURGE_ELIGIBLE);

        // 5 gün önce silinmiş blog
        Date fiveDaysAgo = new Date(System.currentTimeMillis() - (5L * 24 * 60 * 60 * 1000L));
        BlogEntity recentBlog = BlogEntity.builder()
                .blogId(103L)
                .header("Recent-Blog")
                .isDeleted(true)
                .deletedAt(fiveDaysAgo)
                .build();

        assertThat(recentBlog.getLifecycleStatus(30L)).isEqualTo(BlogLifecycleStatus.SOFT_DELETED);
    }

    @Test
    @DisplayName("CommentEntity: PENDING -> APPROVED / FLAGGED_TOXIC / SOFT_DELETED durumları doğrulanmalıdır")
    void testCommentModerationTransitions() {
        CommentEntity comment = CommentEntity.builder()
                .commentId(201L)
                .content("Harika bir makale!")
                .isApproved(true)
                .isAiModerated(false)
                .isDeleted(false)
                .build();

        // 1. Initial State
        assertThat(comment.getModerationStatus()).isEqualTo(CommentModerationStatus.APPROVED);

        // 2. Unmoderated & unapproved state -> PENDING_MODERATION
        CommentEntity pendingComment = CommentEntity.builder()
                .commentId(202L)
                .content("İnceleme bekliyor")
                .isApproved(false)
                .isAiModerated(false)
                .build();
        assertThat(pendingComment.getModerationStatus()).isEqualTo(CommentModerationStatus.PENDING_MODERATION);

        // 3. Flag as toxic
        pendingComment.flagToxic("Aşırı agresif içerik", 0.92, "NEGATIVE");
        assertThat(pendingComment.isApproved()).isFalse();
        assertThat(pendingComment.getIsAiModerated()).isTrue();
        assertThat(pendingComment.getToxicityScore()).isEqualTo(0.92);
        assertThat(pendingComment.getModerationStatus()).isEqualTo(CommentModerationStatus.FLAGGED_TOXIC);

        // 4. Moderator overrides & approves
        pendingComment.approve();
        assertThat(pendingComment.isApproved()).isTrue();
        assertThat(pendingComment.getModerationStatus()).isEqualTo(CommentModerationStatus.APPROVED);

        // 5. Soft Delete comment
        pendingComment.softDelete();
        assertThat(pendingComment.isDeleted()).isTrue();
        assertThat(pendingComment.getDeletedAt()).isNotNull();
        assertThat(pendingComment.getModerationStatus()).isEqualTo(CommentModerationStatus.SOFT_DELETED);

        // 6. Double delete throws IllegalStateException
        assertThatThrownBy(pendingComment::softDelete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("zaten silinmiş");

        // 7. Restore comment
        pendingComment.restore();
        assertThat(pendingComment.isDeleted()).isFalse();
        assertThat(pendingComment.getModerationStatus()).isEqualTo(CommentModerationStatus.APPROVED);
    }
}

