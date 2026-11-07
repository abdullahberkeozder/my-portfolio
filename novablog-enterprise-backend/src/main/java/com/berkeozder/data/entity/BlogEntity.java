package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// LOMBOK
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

// Table
@Entity
@Table(name = "blogs")
@SQLDelete(sql = "UPDATE blogs SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE blog_id = ?")
@SQLRestriction("is_deleted = false")
public class BlogEntity extends AuditingAwareBaseEntity {

    // ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private Long blogId;

    // Header
    @Column(nullable = false, unique = true)
    private String header;

    // Title
    private String title;

    // Content
    @Column(columnDefinition = "TEXT")
    private String content;

    // Image
    private String image;

    // AI Summary & Vector Embedding (Adım 22 - Spring AI & Semantic Search)
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "embedding", columnDefinition = "TEXT")
    private String embedding;

    // Soft Delete
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private java.util.Date deletedAt;

    /// //////////////////////////////////////////////
    // Relation with Category (1-N)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "blog_category_id", nullable = false)
    private BlogCategoryEntity blogCategoryEntity;

    // Relation with Author/User (N-1)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_user_id")
    private UserEntity author;

    // Relation with Comments (1-N)
    @Builder.Default
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CommentEntity> comments = new ArrayList<>();

    // Relation with Tags (N-M)
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
} // end BlogEntity
