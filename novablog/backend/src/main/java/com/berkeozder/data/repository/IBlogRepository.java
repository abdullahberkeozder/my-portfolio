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
}

