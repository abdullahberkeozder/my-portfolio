package com.berkeozder.data.repository;

import com.berkeozder.data.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICommentRepository extends JpaRepository<CommentEntity, Long> {

    List<CommentEntity> findByBlog_BlogIdOrderByCreatedDateDesc(Long blogId);

    List<CommentEntity> findByUser_UserIdOrderByCreatedDateDesc(Long userId);

    long countByBlog_BlogId(Long blogId);

    @Query(value = "SELECT * FROM comments WHERE is_deleted = true", nativeQuery = true)
    List<CommentEntity> findDeletedCommentsNative();

    @Query(value = "SELECT * FROM comments WHERE comment_id = :id AND is_deleted = true", nativeQuery = true)
    Optional<CommentEntity> findDeletedCommentByIdNative(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE comments SET is_deleted = false, deleted_at = NULL WHERE comment_id = :id", nativeQuery = true)
    int restoreCommentNative(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comments WHERE blog_id IN (:blogIds)", nativeQuery = true)
    int deleteCommentsByBlogIdsNative(@Param("blogIds") List<Long> blogIds);
}

