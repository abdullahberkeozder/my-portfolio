package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.dto.comment.CommentResponseDto;

import java.util.List;

public interface ICommentService {

    CommentResponseDto addComment(Long blogId, CommentCreateRequestDto dto);

    List<CommentResponseDto> getCommentsByBlogId(Long blogId);

    void deleteComment(Long commentId);

    void restoreComment(Long commentId);

    List<CommentResponseDto> findDeletedComments();

    CommentResponseDto approveComment(Long commentId);

    CommentResponseDto flagComment(Long commentId, String reason);
}

