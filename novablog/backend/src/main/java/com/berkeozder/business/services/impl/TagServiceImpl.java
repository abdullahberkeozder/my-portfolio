package com.berkeozder.business.services.impl;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.tag.TagDto;
import com.berkeozder.business.services.interfaces.ITagService;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;
import com.berkeozder.data.mapper.BlogMapper;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ITagRepository;
import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Log4j2
@RequiredArgsConstructor
@Service
public class TagServiceImpl implements ITagService {

    private final ITagRepository iTagRepository;
    private final IBlogRepository iBlogRepository;
    private final BlogMapper blogMapper = new BlogMapper();

    @Override
    @Transactional
    @CacheEvict(value = "tags", allEntries = true)
    public TagDto createTag(TagDto tagDto) {
        String cleanName = cleanTagName(tagDto.getName());
        if (iTagRepository.existsByNameIgnoreCase(cleanName)) {
            throw new _400_BadRequestException("Bu etiket zaten tanımlanmış: " + cleanName);
        }

        TagEntity tag = TagEntity.builder()
                .name(cleanName)
                .build();

        TagEntity saved = iTagRepository.save(tag);
        log.info("Yeni etiket oluşturuldu: {}", cleanName);

        return TagDto.builder()
                .tagId(saved.getTagId())
                .name(saved.getName())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tags", key = "'all'")
    public List<TagDto> getAllTags() {
        return iTagRepository.findAll().stream()
                .map(t -> TagDto.builder().tagId(t.getTagId()).name(t.getName()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tags", key = "#name")
    public TagDto getTagByName(String name) {
        String cleanName = cleanTagName(name);
        TagEntity tag = iTagRepository.findByNameIgnoreCase(cleanName)
                .orElseThrow(() -> new _404_NotFoundException("Etiket bulunamadı: " + cleanName));

        return TagDto.builder()
                .tagId(tag.getTagId())
                .name(tag.getName())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "tags", allEntries = true)
    public void addTagToBlog(Long blogId, String tagName) {
        BlogEntity blog = iBlogRepository.findById(blogId)
                .orElseThrow(() -> new _404_NotFoundException("Blog bulunamadı. ID: " + blogId));

        String cleanName = cleanTagName(tagName);
        TagEntity tag = iTagRepository.findByNameIgnoreCase(cleanName)
                .orElseGet(() -> iTagRepository.save(TagEntity.builder().name(cleanName).build()));

        blog.addTag(tag);
        iBlogRepository.save(blog);
        log.info("Blog (ID: {}) için etiket (#{}) eklendi.", blogId, cleanName);
    }

    @Override
    @Transactional
    @CacheEvict(value = "tags", allEntries = true)
    public void removeTagFromBlog(Long blogId, String tagName) {
        BlogEntity blog = iBlogRepository.findById(blogId)
                .orElseThrow(() -> new _404_NotFoundException("Blog bulunamadı. ID: " + blogId));

        String cleanName = cleanTagName(tagName);
        TagEntity tag = iTagRepository.findByNameIgnoreCase(cleanName)
                .orElseThrow(() -> new _404_NotFoundException("Etiket bulunamadı: " + cleanName));

        blog.removeTag(tag);
        iBlogRepository.save(blog);
        log.info("Blog (ID: {}) üzerinden etiket (#{}) kaldırıldı.", blogId, cleanName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> getBlogsByTagName(String tagName) {
        String cleanName = cleanTagName(tagName);
        TagEntity tag = iTagRepository.findByNameIgnoreCase(cleanName)
                .orElseThrow(() -> new _404_NotFoundException("Etiket bulunamadı: " + cleanName));

        return tag.getBlogs().stream()
                .map(blogMapper::toDto)
                .collect(Collectors.toList());
    }

    private String cleanTagName(String name) {
        if (name == null || name.isBlank()) {
            throw new _400_BadRequestException("Etiket adı boş olamaz.");
        }
        return name.trim().toLowerCase(Locale.ENGLISH).replace(" ", "-");
    }
}

