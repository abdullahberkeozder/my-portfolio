package com.berkeozder.business.services.impl;

import com.berkeozder.bean.ModelMapperBean;
import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.mapper.BlogCategoryMapper;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.business.services.interfaces.IBlogCategoryServices;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

/**
 * Service implementation for Blog Category operations with Redis caching.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class BlogCategoryServicesImpl implements IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> {

    private final IBlogCategoryRepository iBlogCategoryRepository;
    private final ModelMapperBean modelMapperBean;
    private final BlogCategoryMapper blogCategoryMapper = new BlogCategoryMapper();

    @Override
    public BlogCategoryDto entityToDto(BlogCategoryEntity blogCategoryEntity) {
        return blogCategoryMapper.toDto(blogCategoryEntity);
    }

    @Override
    public BlogCategoryEntity dtoToEntity(BlogCategoryDto blogCategoryDto) {
        return blogCategoryMapper.toEntity(blogCategoryDto);
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public List<BlogCategoryDto> speedData(Integer data) {
        if (data == null) {
            throw new IllegalArgumentException("Data count cannot be null");
        }
        List<BlogCategoryDto> listData = new ArrayList<>();
        for (int i = 1; i <= data; i++) {
            BlogCategoryEntity blogCategoryEntity = new BlogCategoryEntity();
            blogCategoryEntity.setCategoryName("category-" + UUID.randomUUID());
            iBlogCategoryRepository.save(blogCategoryEntity);
            listData.add(blogCategoryMapper.toDto(blogCategoryEntity));
        }
        return listData;
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public List<BlogCategoryDto> deleteData() {
        iBlogCategoryRepository.deleteAll();
        return objectServiceList();
    }

    private <T> void validate(T dto, Function<T, String> nameExtractor, String currentName) {
        if (dto == null) {
            throw new IllegalArgumentException("DTO payload cannot be null");
        }

        String categoryName = nameExtractor.apply(dto);
        if (categoryName == null || categoryName.isBlank()) {
            throw new IllegalArgumentException("Category name cannot be null or blank");
        }

        boolean sameAsCurrentName = currentName != null && currentName.equalsIgnoreCase(categoryName);
        if (!sameAsCurrentName && iBlogCategoryRepository.existsByCategoryNameIgnoreCase(categoryName)) {
            throw new IllegalArgumentException("Category name already exists: " + categoryName);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public BlogCategoryDto objectServiceCreate(BlogCategoryDto blogCategoryDto) {
        validate(blogCategoryDto, BlogCategoryDto::getCategoryName, null);
        return entityToDto(iBlogCategoryRepository.save(dtoToEntity(blogCategoryDto)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<BlogCategoryDto> objectServiceList() {
        return iBlogCategoryRepository.findAll().stream().map(this::entityToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "#id")
    public BlogCategoryDto objectServiceFindById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        BlogCategoryEntity entity = iBlogCategoryRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException("Category not found with ID: " + id));
        return entityToDto(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public BlogCategoryDto objectServiceUpdate(Long id, BlogCategoryDto blogCategoryDto) {
        if (blogCategoryDto == null || blogCategoryDto.getCategoryName() == null || blogCategoryDto.getCategoryName().isBlank()) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (iBlogCategoryRepository.existsByCategoryNameIgnoreCase(blogCategoryDto.getCategoryName())) {
            throw new IllegalArgumentException("Category name already exists: " + blogCategoryDto.getCategoryName());
        }

        BlogCategoryEntity entity = dtoToEntity(objectServiceFindById(id));
        entity.setCategoryName(blogCategoryDto.getCategoryName());
        return entityToDto(iBlogCategoryRepository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public BlogCategoryDto objectServiceDelete(Long id) {
        BlogCategoryEntity entity = dtoToEntity(objectServiceFindById(id));
        iBlogCategoryRepository.deleteById(id);
        return entityToDto(entity);
    }
}
