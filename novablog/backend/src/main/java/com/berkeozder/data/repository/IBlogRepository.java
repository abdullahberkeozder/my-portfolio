package com.berkeozder.data.repository;

import com.berkeozder.data.entity.BlogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// CrudRepository
@Repository
public interface IBlogRepository extends JpaRepository<BlogEntity, Long>, JpaSpecificationExecutor<BlogEntity> {

    @Query(value = "SELECT * FROM blogs WHERE is_deleted = true", nativeQuery = true)
    List<BlogEntity> findDeletedBlogsNative();

    @Query(value = "SELECT * FROM blogs WHERE blog_id = :id AND is_deleted = true", nativeQuery = true)
    Optional<BlogEntity> findDeletedBlogByIdNative(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET is_deleted = false, deleted_at = NULL WHERE blog_id = :id", nativeQuery = true)
    int restoreBlogNative(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE blog_id IN (:ids) AND is_deleted = false", nativeQuery = true)
    int bulkSoftDeleteNative(@Param("ids") List<Long> ids);

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET is_deleted = false, deleted_at = NULL WHERE blog_id IN (:ids) AND is_deleted = true", nativeQuery = true)
    int bulkRestoreNative(@Param("ids") List<Long> ids);

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET blog_category_id = :categoryId WHERE blog_id IN (:ids)", nativeQuery = true)
    int bulkChangeCategoryNative(@Param("ids") List<Long> ids, @Param("categoryId") Long categoryId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM blogs WHERE blog_id IN (:ids)", nativeQuery = true)
    int bulkHardDeleteNative(@Param("ids") List<Long> ids);

    @Query(value = "SELECT * FROM blogs WHERE is_deleted = true AND (deleted_at IS NULL OR deleted_at < :cutoffDate)", nativeQuery = true)
    List<BlogEntity> findSoftDeletedBlogsOlderThanNative(@Param("cutoffDate") java.util.Date cutoffDate);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM blog_tags WHERE blog_id IN (:blogIds)", nativeQuery = true)
    int deleteBlogTagsByBlogIdsNative(@Param("blogIds") List<Long> blogIds);

    List<BlogEntity> findByAuthor(com.berkeozder.data.entity.UserEntity author);

    long countByAuthor(com.berkeozder.data.entity.UserEntity author);

    @Query(value = """
        SELECT b.*
        FROM blogs b
        WHERE b.is_deleted = false AND b.native_embedding IS NOT NULL
        ORDER BY b.native_embedding <=> CAST(:queryVector AS vector) ASC
        LIMIT :limit
    """, nativeQuery = true)
    List<BlogEntity> findByPgVectorSimilarityNative(
            @Param("queryVector") String queryVector,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT b.*
        FROM blogs b
        WHERE b.is_deleted = false
          AND b.search_vector @@ plainto_tsquery('simple', :query)
        ORDER BY ts_rank_cd(b.search_vector, plainto_tsquery('simple', :query)) DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<BlogEntity> findByFullTextSearchNative(
            @Param("query") String query,
            @Param("limit") int limit
    );

    @Query(value = """
        WITH vector_matches AS (
            SELECT blog_id,
                   ROW_NUMBER() OVER (ORDER BY native_embedding <=> CAST(:queryVector AS vector) ASC) AS rank_vec,
                   (1 - (native_embedding <=> CAST(:queryVector AS vector))) AS vector_similarity
            FROM blogs
            WHERE is_deleted = false AND native_embedding IS NOT NULL
            LIMIT :candidateLimit
        ),
        text_matches AS (
            SELECT blog_id,
                   ROW_NUMBER() OVER (ORDER BY ts_rank_cd(search_vector, plainto_tsquery('simple', :query)) DESC) AS rank_text,
                   ts_rank_cd(search_vector, plainto_tsquery('simple', :query)) AS text_rank
            FROM blogs
            WHERE is_deleted = false AND search_vector @@ plainto_tsquery('simple', :query)
            LIMIT :candidateLimit
        ),
        fused AS (
            SELECT COALESCE(v.blog_id, t.blog_id) AS blog_id,
                   (COALESCE(1.0 / (60.0 + v.rank_vec), 0.0) * 0.60 + COALESCE(1.0 / (60.0 + t.rank_text), 0.0) * 0.40) AS rrf_score,
                   COALESCE(v.vector_similarity, 0.0) AS vector_similarity,
                   COALESCE(t.text_rank, 0.0) AS text_rank
            FROM vector_matches v
            FULL OUTER JOIN text_matches t ON v.blog_id = t.blog_id
        )
        SELECT b.*
        FROM fused f
        JOIN blogs b ON b.blog_id = f.blog_id
        ORDER BY f.rrf_score DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<BlogEntity> findByRrfHybridSearchNative(
            @Param("query") String query,
            @Param("queryVector") String queryVector,
            @Param("candidateLimit") int candidateLimit,
            @Param("limit") int limit
    );

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET views_count = views_count + :delta WHERE blog_id = :id", nativeQuery = true)
    int incrementViewsCountNative(@Param("id") Long id, @Param("delta") long delta);

    @Modifying
    @Transactional
    @Query(value = "UPDATE blogs SET likes_count = likes_count + :delta WHERE blog_id = :id", nativeQuery = true)
    int incrementLikesCountNative(@Param("id") Long id, @Param("delta") long delta);
}

