package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.dto.comment.CommentResponseDto;
import com.berkeozder.business.services.interfaces.ICommentService;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/blog/api/v1.0.0/comments")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Comment API", description = "Blog Yorumlama ve Yönetimi Uç Noktaları")
public class CommentApiImpl {

    private final ICommentService commentService;

    @Operation(summary = "Belirli bir blog yazısına yorum ekle (Oturum gerektirir)")
    @PostMapping("/{blogId}")
    public ResponseEntity<ApiResult<CommentResponseDto>> addComment(
            @PathVariable Long blogId,
            @Valid @RequestBody CommentCreateRequestDto dto) {
        CommentResponseDto response = commentService.addComment(blogId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(response));
    }

    @Operation(summary = "Belirli bir blog yazısının tüm onaylı yorumlarını getir")
    @GetMapping("/{blogId}")
    public ResponseEntity<ApiResult<List<CommentResponseDto>>> getCommentsByBlogId(
            @PathVariable Long blogId) {
        List<CommentResponseDto> comments = commentService.getCommentsByBlogId(blogId);
        return ResponseEntity.ok(ApiResult.success(comments));
    }

    @Operation(summary = "Yorumu sil (Sadece yorum sahibi veya ADMIN silebilir)")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResult<String>> deleteComment(
            @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(ApiResult.success("Yorum başarıyla silindi. ID: " + commentId));
    }

    @Operation(summary = "Silinmiş yorumu geri yükle (Restore - Sadece ADMIN/SUPER_ADMIN)")
    @PostMapping("/{commentId}/restore")
    public ResponseEntity<ApiResult<String>> restoreComment(
            @PathVariable Long commentId) {
        commentService.restoreComment(commentId);
        return ResponseEntity.ok(ApiResult.success("Yorum başarıyla geri yüklendi. ID: " + commentId));
    }

    @Operation(summary = "Silinmiş tüm yorumları listele (Arşiv - Sadece ADMIN/SUPER_ADMIN)")
    @GetMapping("/deleted")
    public ResponseEntity<ApiResult<List<CommentResponseDto>>> findDeletedComments() {
        return ResponseEntity.ok(ApiResult.success(commentService.findDeletedComments()));
    }
}

