package com.berkeozder;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.services.impl.BlogCategoryServicesImpl;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.exception._404_NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BlogCategoryServicesTest {

    @Mock
    private IBlogCategoryRepository iBlogCategoryRepository;

    @InjectMocks
    private BlogCategoryServicesImpl blogCategoryServices;

    @Test
    @DisplayName("Kategori başarıyla oluşturulmalıdır")
    void testObjectServiceCreate() {
        BlogCategoryDto inputDto = BlogCategoryDto.builder().categoryName("Yazılım").build();
        BlogCategoryEntity savedEntity = BlogCategoryEntity.builder().blogCategoryId(1L).categoryName("Yazılım").build();

        when(iBlogCategoryRepository.existsByCategoryNameIgnoreCase("Yazılım")).thenReturn(false);
        when(iBlogCategoryRepository.save(any(BlogCategoryEntity.class))).thenReturn(savedEntity);

        BlogCategoryDto result = blogCategoryServices.objectServiceCreate(inputDto);

        assertThat(result).isNotNull();
        assertThat(result.getBlogCategoryId()).isEqualTo(1L);
        assertThat(result.getCategoryName()).isEqualTo("Yazılım");
        verify(iBlogCategoryRepository, times(1)).save(any(BlogCategoryEntity.class));
    }

    @Test
    @DisplayName("ID ile kategori arama başarılı olmalıdır")
    void testObjectServiceFindByIdSuccess() {
        BlogCategoryEntity entity = BlogCategoryEntity.builder().blogCategoryId(5L).categoryName("DevOps").build();
        when(iBlogCategoryRepository.findById(5L)).thenReturn(Optional.of(entity));

        BlogCategoryDto result = blogCategoryServices.objectServiceFindById(5L);

        assertThat(result).isNotNull();
        assertThat(result.getBlogCategoryId()).isEqualTo(5L);
        assertThat(result.getCategoryName()).isEqualTo("DevOps");
    }

    @Test
    @DisplayName("Bulunamayan kategori arandığında _404_NotFoundException fırlatılmalıdır")
    void testObjectServiceFindByIdNotFound() {
        when(iBlogCategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blogCategoryServices.objectServiceFindById(99L))
                .isInstanceOf(_404_NotFoundException.class);
    }

    @Test
    @DisplayName("Tüm kategoriler listelenmelidir")
    void testObjectServiceList() {
        List<BlogCategoryEntity> entities = List.of(
                BlogCategoryEntity.builder().blogCategoryId(1L).categoryName("Frontend").build(),
                BlogCategoryEntity.builder().blogCategoryId(2L).categoryName("Backend").build()
        );
        when(iBlogCategoryRepository.findAll()).thenReturn(entities);

        List<BlogCategoryDto> result = blogCategoryServices.objectServiceList();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCategoryName()).isEqualTo("Frontend");
        assertThat(result.get(1).getCategoryName()).isEqualTo("Backend");
    }

    @Test
    @DisplayName("Kategori silme işlemi başarılı olmalıdır")
    void testObjectServiceDelete() {
        BlogCategoryEntity entity = BlogCategoryEntity.builder().blogCategoryId(10L).categoryName("Cloud").build();
        when(iBlogCategoryRepository.findById(10L)).thenReturn(Optional.of(entity));
        doNothing().when(iBlogCategoryRepository).deleteById(10L);

        BlogCategoryDto result = blogCategoryServices.objectServiceDelete(10L);

        assertThat(result.getBlogCategoryId()).isEqualTo(10L);
        verify(iBlogCategoryRepository, times(1)).deleteById(10L);
    }
}

