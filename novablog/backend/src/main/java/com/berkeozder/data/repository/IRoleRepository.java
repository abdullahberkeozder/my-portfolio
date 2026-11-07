package com.berkeozder.data.repository;

import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IRoleRepository extends JpaRepository<RoleEntity, Long> {

    Optional<RoleEntity> findByRoleName(RoleType roleName);

    boolean existsByRoleName(RoleType roleName);
}

