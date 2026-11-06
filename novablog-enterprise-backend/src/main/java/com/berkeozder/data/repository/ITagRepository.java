package com.berkeozder.data.repository;

import com.berkeozder.data.entity.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ITagRepository extends JpaRepository<TagEntity, Long> {

    Optional<TagEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<TagEntity> findByNameContainingIgnoreCase(String keyword);
}

