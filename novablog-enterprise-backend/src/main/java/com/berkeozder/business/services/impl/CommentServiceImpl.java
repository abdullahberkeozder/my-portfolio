package com.berkeozder.business.services.impl;

import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.dto.comment.CommentResponseDto;
import com.berkeozder.business.event.CommentCreatedEvent;
import com.berkeozder.business.services.interfaces.ICommentService;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.CommentEntity;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ICommentRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._403_ForbiddenException;
import com.berkeozder.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@RequiredArgsConstructor
@Service
public class CommentServiceImpl implements ICommentService {

    private final ICommentRepository iCommentRepository;
    private final IBlogRepository iBlogRepository;
    private final IUserRepository iUserRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public CommentResponseDto addComment(Long blogId, CommentCreateRequestDto dto) {
        BlogEntity blog = iBlogRepository.findById(blogId)
                .orElseThrow(() -> new _404_NotFoundException("Yorum eklenecek blog bulunamadı. ID: " + blogId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new _400_BadRequestException("Yorum yapabilmek için lütfen giriş yapınız.");
        }

        String username = authentication.getName();
        UserEntity user = iUserRepository.findByUsername(username)
                .orElseThrow(() -> new _404_NotFoundException("Kullanıcı profili bulunamadı: " + username));

        CommentEntity comment = CommentEntity.builder()
                .content(dto.getContent())
                .blog(blog)
                .user(user)
                .isApproved(true)
                .build();

        CommentEntity saved = iCommentRepository.save(comment);
        log.info("Blog (ID: {}) için kullanıcı ({}) tarafından yorum eklendi: ID {}", blogId, username, saved.getCommentId());

        // Asenkron Event Yayınlama (Adım 6)
        if (eventPublisher != null) {
            String authorEmail = (blog.getAuthor() != null) ? blog.getAuthor().getEmail() : null;
            String authorUsername = (blog.getAuthor() != null) ? blog.getAuthor().getUsername() : null;
            String blogTitle = (blog.getTitle() != null && !blog.getTitle().isBlank()) ? blog.getTitle() : blog.getHeader();

            eventPublisher.publishEvent(new CommentCreatedEvent(
                    this,
                    saved.getCommentId(),
                    blog.getBlogId(),
                    blogTitle,
                    authorEmail,
                    authorUsername,
                    username,
                    saved.getContent()
            ));
        }

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByBlogId(Long blogId) {
        if (!iBlogRepository.existsById(blogId)) {
            throw new _404_NotFoundException("Blog bulunamadı. ID: " + blogId);
        }

        return iCommentRepository.findByBlog_BlogIdOrderByCreatedDateDesc(blogId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        CommentEntity comment = iCommentRepository.findById(commentId)
                .orElseThrow(() -> new _404_NotFoundException("Silinecek yorum bulunamadı. ID: " + commentId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication != null ? authentication.getName() : "";
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        boolean isOwner = comment.getUser() != null && comment.getUser().getUsername().equals(currentUsername);

        if (!isOwner && !isAdmin) {
            throw new _403_ForbiddenException("Bu yorumu silme yetkiniz bulunmamaktadır.");
        }

        iCommentRepository.delete(comment);
        log.info("Yorum silindi (Soft Delete). ID: {}, Silen Kullanıcı: {}", commentId, currentUsername);
    }

    @Override
    @Transactional
    public void restoreComment(Long commentId) {
        int updatedRows = iCommentRepository.restoreCommentNative(commentId);
        if (updatedRows == 0) {
            throw new _404_NotFoundException("Geri yüklenecek silinmiş yorum bulunamadı. ID: " + commentId);
        }
        log.info("Yorum geri yüklendi (Restore). ID: {}", commentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> findDeletedComments() {
        return iCommentRepository.findDeletedCommentsNative()
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    private CommentResponseDto mapToResponseDto(CommentEntity entity) {
        String fullName = "";
        if (entity.getUser() != null) {
            String first = entity.getUser().getFirstName() != null ? entity.getUser().getFirstName() : "";
            String last = entity.getUser().getLastName() != null ? entity.getUser().getLastName() : "";
            fullName = (first + " " + last).trim();
            if (fullName.isEmpty()) {
                fullName = entity.getUser().getUsername();
            }
        }

        return CommentResponseDto.builder()
                .commentId(entity.getCommentId())
                .blogId(entity.getBlog() != null ? entity.getBlog().getBlogId() : null)
                .content(entity.getContent())
                .userId(entity.getUser() != null ? entity.getUser().getUserId() : null)
                .username(entity.getUser() != null ? entity.getUser().getUsername() : null)
                .userFullName(fullName)
                .isApproved(entity.isApproved())
                .createdDate(entity.getCreatedDate())
                .isDeleted(entity.isDeleted())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}

