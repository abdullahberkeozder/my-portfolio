package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.tag.TagDto;

import java.util.List;

public interface ITagService {

    TagDto createTag(TagDto tagDto);

    List<TagDto> getAllTags();

    TagDto getTagByName(String name);

    void addTagToBlog(Long blogId, String tagName);

    void removeTagFromBlog(Long blogId, String tagName);

    List<BlogDto> getBlogsByTagName(String tagName);
}

