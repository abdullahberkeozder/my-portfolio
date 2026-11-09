package com.berkeozder.data.mapper;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;

import java.util.Collections;
import java.util.stream.Collectors;

/**
 * Mapper converting between BlogEntity and BlogDto.
 */
public class BlogMapper implements IGenericMapper<BlogDto, BlogEntity> {

    private final BlogCategoryMapper blogCategoryMapper;

    public BlogMapper() {
        this.blogCategoryMapper = new BlogCategoryMapper();
    }

    @Override
    public BlogDto toDto(BlogEntity blogEntity) {
        if (blogEntity == null) return null;

        return BlogDto.builder()
                .blogId(blogEntity.getBlogId())
                .header(blogEntity.getHeader())
                .title(blogEntity.getTitle())
                .content(blogEntity.getContent())
                .image(blogEntity.getImage())
                .blogCategoryDto(blogCategoryMapper.toDto(blogEntity.getBlogCategoryEntity()))
                .authorId(blogEntity.getAuthor() != null ? blogEntity.getAuthor().getUserId() : null)
                .authorUsername(blogEntity.getAuthor() != null ? blogEntity.getAuthor().getUsername() : null)
                .tags(blogEntity.getTags() != null
                        ? blogEntity.getTags().stream().map(TagEntity::getName).collect(Collectors.toSet())
                        : Collections.emptySet())
                .commentCount(blogEntity.getComments() != null ? blogEntity.getComments().size() : 0)
                .aiSummary(blogEntity.getAiSummary())
                .hasEmbedding(blogEntity.getEmbedding() != null && !blogEntity.getEmbedding().isBlank())
                .isDeleted(blogEntity.isDeleted())
                .deletedAt(blogEntity.getDeletedAt())
                .build();
    }

    @Override
    public BlogEntity toEntity(BlogDto blogDto) {
        if (blogDto == null) return null;
        return BlogEntity.builder()
                .blogId(blogDto.getBlogId())
                .header(blogDto.getHeader())
                .title(blogDto.getTitle())
                .content(blogDto.getContent())
                .image(blogDto.getImage())
                .aiSummary(blogDto.getAiSummary())
                .blogCategoryEntity(blogCategoryMapper.toEntity(blogDto.getBlogCategoryDto()))
                .isDeleted(blogDto.isDeleted())
                .deletedAt(blogDto.getDeletedAt())
                .build();
    }
}
