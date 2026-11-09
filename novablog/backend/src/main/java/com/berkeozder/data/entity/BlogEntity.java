package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "blogs")
@SQLDelete(sql = "UPDATE blogs SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE blog_id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class BlogEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private Long blogId;

    @Column(nullable = false, unique = true)
    private String header;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String image;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "embedding", columnDefinition = "TEXT")
    private String embedding;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private Long viewsCount = 0L;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private Long likesCount = 0L;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Date deletedAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "blog_category_id", nullable = false)
    private BlogCategoryEntity blogCategoryEntity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_user_id")
    private UserEntity author;

    @Builder.Default
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CommentEntity> comments = new ArrayList<>();

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "blog_tags",
            joinColumns = @JoinColumn(name = "blog_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<TagEntity> tags = new HashSet<>();

    public void addComment(CommentEntity comment) {
        comments.add(comment);
        comment.setBlog(this);
    }

    public void removeComment(CommentEntity comment) {
        comments.remove(comment);
        comment.setBlog(null);
    }

    public void addTag(TagEntity tag) {
        tags.add(tag);
        tag.getBlogs().add(this);
    }

    public void removeTag(TagEntity tag) {
        tags.remove(tag);
        tag.getBlogs().remove(this);
    }

    // ==========================================
    // LIFECYCLE STATE MACHINE METHODS (Adım 1)
    // ==========================================

    public void softDelete() {
        if (this.isDeleted) {
            throw new IllegalStateException("Blog zaten silinmiş durumda. BlogId: " + this.blogId);
        }
        this.isDeleted = true;
        this.deletedAt = new Date();
    }

    public void restore() {
        if (!this.isDeleted) {
            throw new IllegalStateException("Blog zaten aktif durumda. BlogId: " + this.blogId);
        }
        this.isDeleted = false;
        this.deletedAt = null;
    }

    public BlogLifecycleStatus getLifecycleStatus() {
        return getLifecycleStatus(30L);
    }

    public BlogLifecycleStatus getLifecycleStatus(long retentionDays) {
        if (!this.isDeleted) {
            return BlogLifecycleStatus.ACTIVE;
        }
        if (this.deletedAt == null) {
            return BlogLifecycleStatus.SOFT_DELETED;
        }
        long ageMs = System.currentTimeMillis() - this.deletedAt.getTime();
        long retentionMs = retentionDays * 24L * 60 * 60 * 1000L;
        return (ageMs >= retentionMs) ? BlogLifecycleStatus.PURGE_ELIGIBLE : BlogLifecycleStatus.SOFT_DELETED;
    }
}
