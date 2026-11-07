package com.berkeozder;

import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.dto.comment.CommentResponseDto;
import com.berkeozder.business.services.impl.CommentServiceImpl;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.CommentEntity;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ICommentRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._403_ForbiddenException;
import com.berkeozder.exception._404_NotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServicesTest {

    @Mock
    private ICommentRepository iCommentRepository;

    @Mock
    private IBlogRepository iBlogRepository;

    @Mock
    private IUserRepository iUserRepository;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CommentServiceImpl commentService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Giriş yapmış kullanıcı blog yazısına başarıyla yorum ekleyebilmelidir")
    void testAddCommentSuccess() {
        // Oturum açan kullanıcıyı ayarla
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("berke", null, List.of(new SimpleGrantedAuthority("ROLE_USER")))
        );

        BlogEntity blog = BlogEntity.builder().blogId(1L).title("Spring Boot").build();
        UserEntity user = UserEntity.builder().userId(10L).username("berke").firstName("Berke").lastName("Özder").build();
        CommentEntity savedComment = CommentEntity.builder()
                .commentId(100L)
                .content("Harika bir yazı!")
                .blog(blog)
                .user(user)
                .isApproved(true)
                .build();

        when(iBlogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(iUserRepository.findByUsername("berke")).thenReturn(Optional.of(user));
        when(iCommentRepository.save(any(CommentEntity.class))).thenReturn(savedComment);

        CommentCreateRequestDto requestDto = CommentCreateRequestDto.builder().content("Harika bir yazı!").build();
        CommentResponseDto response = commentService.addComment(1L, requestDto);

        assertThat(response).isNotNull();
        assertThat(response.getCommentId()).isEqualTo(100L);
        assertThat(response.getContent()).isEqualTo("Harika bir yazı!");
        assertThat(response.getUsername()).isEqualTo("berke");
        assertThat(response.getUserFullName()).isEqualTo("Berke Özder");
        verify(iCommentRepository, times(1)).save(any(CommentEntity.class));
    }

    @Test
    @DisplayName("Giriş yapmamış kullanıcı yorum eklemeye çalışırsa _400_BadRequestException fırlatılmalıdır")
    void testAddCommentUnauthenticatedThrows() {
        SecurityContextHolder.clearContext();
        BlogEntity blog = BlogEntity.builder().blogId(1L).build();
        when(iBlogRepository.findById(1L)).thenReturn(Optional.of(blog));

        CommentCreateRequestDto requestDto = CommentCreateRequestDto.builder().content("Anonim yorum").build();

        assertThatThrownBy(() -> commentService.addComment(1L, requestDto))
                .isInstanceOf(_400_BadRequestException.class);

        verify(iCommentRepository, never()).save(any(CommentEntity.class));
    }

    @Test
    @DisplayName("Var olmayan bloğa yorum yapılmak istendiğinde _404_NotFoundException fırlatılmalıdır")
    void testAddCommentBlogNotFoundThrows() {
        when(iBlogRepository.findById(999L)).thenReturn(Optional.empty());

        CommentCreateRequestDto requestDto = CommentCreateRequestDto.builder().content("Deneme").build();

        assertThatThrownBy(() -> commentService.addComment(999L, requestDto))
                .isInstanceOf(_404_NotFoundException.class);
    }

    @Test
    @DisplayName("Belirli bir bloğa ait yorumlar başarıyla listelenmelidir")
    void testGetCommentsByBlogIdSuccess() {
        when(iBlogRepository.existsById(1L)).thenReturn(true);

        UserEntity user = UserEntity.builder().username("testuser").firstName("Test").lastName("User").build();
        CommentEntity comment1 = CommentEntity.builder().commentId(1L).content("Yorum 1").user(user).build();
        CommentEntity comment2 = CommentEntity.builder().commentId(2L).content("Yorum 2").user(user).build();

        when(iCommentRepository.findByBlog_BlogIdOrderByCreatedDateDesc(1L)).thenReturn(List.of(comment1, comment2));

        List<CommentResponseDto> list = commentService.getCommentsByBlogId(1L);

        assertThat(list).hasSize(2);
        assertThat(list.get(0).getContent()).isEqualTo("Yorum 1");
        assertThat(list.get(1).getContent()).isEqualTo("Yorum 2");
    }

    @Test
    @DisplayName("Yorum sahibi kendi yorumunu başarıyla silebilmelidir")
    void testDeleteCommentOwnerSuccess() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("berke", null, List.of(new SimpleGrantedAuthority("ROLE_USER")))
        );

        UserEntity user = UserEntity.builder().userId(1L).username("berke").build();
        CommentEntity comment = CommentEntity.builder().commentId(50L).user(user).build();

        when(iCommentRepository.findById(50L)).thenReturn(Optional.of(comment));
        doNothing().when(iCommentRepository).delete(comment);

        commentService.deleteComment(50L);

        verify(iCommentRepository, times(1)).delete(comment);
    }

    @Test
    @DisplayName("Admin yetkisine sahip kullanıcı başkasının yorumunu silebilmelidir")
    void testDeleteCommentAdminSuccess() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );

        UserEntity anotherUser = UserEntity.builder().userId(2L).username("otheruser").build();
        CommentEntity comment = CommentEntity.builder().commentId(51L).user(anotherUser).build();

        when(iCommentRepository.findById(51L)).thenReturn(Optional.of(comment));
        doNothing().when(iCommentRepository).delete(comment);

        commentService.deleteComment(51L);

        verify(iCommentRepository, times(1)).delete(comment);
    }

    @Test
    @DisplayName("Yetkisiz bir kullanıcı başkasının yorumunu silmeye çalıştığında _403_ForbiddenException fırlatılmalıdır")
    void testDeleteCommentUnauthorizedThrows() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("hacker", null, List.of(new SimpleGrantedAuthority("ROLE_USER")))
        );

        UserEntity authorUser = UserEntity.builder().userId(1L).username("berke").build();
        CommentEntity comment = CommentEntity.builder().commentId(52L).user(authorUser).build();

        when(iCommentRepository.findById(52L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(52L))
                .isInstanceOf(_403_ForbiddenException.class);

        verify(iCommentRepository, never()).delete(any(CommentEntity.class));
    }
}
