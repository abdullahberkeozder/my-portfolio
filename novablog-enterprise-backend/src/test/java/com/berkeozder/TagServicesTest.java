package com.berkeozder;

import com.berkeozder.business.dto.tag.TagDto;
import com.berkeozder.business.services.impl.TagServiceImpl;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ITagRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TagServicesTest {

    @Mock
    private ITagRepository iTagRepository;

    @Mock
    private IBlogRepository iBlogRepository;

    @InjectMocks
    private TagServiceImpl tagService;

    @Test
    @DisplayName("Yeni etiket başarıyla oluşturulmalıdır")
    void testCreateTagSuccess() {
        TagDto inputDto = TagDto.builder().name("Spring Boot").build();
        TagEntity savedEntity = TagEntity.builder().tagId(1L).name("spring-boot").build();

        when(iTagRepository.existsByNameIgnoreCase("spring-boot")).thenReturn(false);
        when(iTagRepository.save(any(TagEntity.class))).thenReturn(savedEntity);

        TagDto result = tagService.createTag(inputDto);

        assertThat(result).isNotNull();
        assertThat(result.getTagId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("spring-boot");
        verify(iTagRepository, times(1)).save(any(TagEntity.class));
    }

    @Test
    @DisplayName("Var olan etiket tekrar oluşturulmak istendiğinde _400_BadRequestException fırlatılmalıdır")
    void testCreateTagAlreadyExistsThrows() {
        TagDto inputDto = TagDto.builder().name("docker").build();
        when(iTagRepository.existsByNameIgnoreCase("docker")).thenReturn(true);

        assertThatThrownBy(() -> tagService.createTag(inputDto))
                .isInstanceOf(_400_BadRequestException.class);

        verify(iTagRepository, never()).save(any(TagEntity.class));
    }

    @Test
    @DisplayName("Tüm etiketler listelenmelidir")
    void testGetAllTagsSuccess() {
        List<TagEntity> tags = List.of(
                TagEntity.builder().tagId(1L).name("java").build(),
                TagEntity.builder().tagId(2L).name("redis").build()
        );
        when(iTagRepository.findAll()).thenReturn(tags);

        List<TagDto> result = tagService.getAllTags();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("java");
        assertThat(result.get(1).getName()).isEqualTo("redis");
    }

    @Test
    @DisplayName("İsme göre etiket getirme başarılı olmalıdır")
    void testGetTagByNameSuccess() {
        TagEntity tag = TagEntity.builder().tagId(3L).name("postgresql").build();
        when(iTagRepository.findByNameIgnoreCase("postgresql")).thenReturn(Optional.of(tag));

        TagDto result = tagService.getTagByName("postgresql");

        assertThat(result).isNotNull();
        assertThat(result.getTagId()).isEqualTo(3L);
        assertThat(result.getName()).isEqualTo("postgresql");
    }

    @Test
    @DisplayName("Bulunamayan etiket sorgulandığında _404_NotFoundException fırlatılmalıdır")
    void testGetTagByNameNotFoundThrows() {
        when(iTagRepository.findByNameIgnoreCase("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.getTagByName("unknown"))
                .isInstanceOf(_404_NotFoundException.class);
    }

    @Test
    @DisplayName("Bloğa yeni etiket ilişkilendirme başarılı olmalıdır")
    void testAddTagToBlogSuccess() {
        BlogEntity blog = BlogEntity.builder()
                .blogId(10L)
                .title("Test Blog")
                .tags(new HashSet<>())
                .build();
        TagEntity tag = TagEntity.builder().tagId(1L).name("security").build();

        when(iBlogRepository.findById(10L)).thenReturn(Optional.of(blog));
        when(iTagRepository.findByNameIgnoreCase("security")).thenReturn(Optional.of(tag));
        when(iBlogRepository.save(any(BlogEntity.class))).thenReturn(blog);

        tagService.addTagToBlog(10L, "security");

        assertThat(blog.getTags()).contains(tag);
        verify(iBlogRepository, times(1)).save(blog);
    }

    @Test
    @DisplayName("Bloğa etiket eklerken blog bulunamazsa _404_NotFoundException fırlatılmalıdır")
    void testAddTagToBlogNotFoundThrows() {
        when(iBlogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.addTagToBlog(999L, "java"))
                .isInstanceOf(_404_NotFoundException.class);
    }
}
