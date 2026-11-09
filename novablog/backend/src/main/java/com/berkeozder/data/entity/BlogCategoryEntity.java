package com.berkeozder.data.entity;

import com.berkeozder.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;

import java.util.List;

/**
 * JPA entity representing a Blog Category.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2
@Entity
@Table(name = "blog_categories")
public class BlogCategoryEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_category_id")
    private Long blogCategoryId;

    @Column(unique = true, nullable = false, length = 250)
    private String categoryName;

    @OneToMany(mappedBy = "blogCategoryEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<BlogEntity> blogEntityList;
}
