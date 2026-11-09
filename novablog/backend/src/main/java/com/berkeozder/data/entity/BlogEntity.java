package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * JPA entity representing a Blog post with audit, soft delete, AI metadata, and relational mappings.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2
@Entity
@Table(name = "blogs")
@SQLDelete(sql = "UPDATE blogs SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE blog_id = ?")
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
}
