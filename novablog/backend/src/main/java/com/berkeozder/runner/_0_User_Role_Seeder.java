package com.berkeozder.runner;

import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IRoleRepository;
import com.berkeozder.data.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Log4j2
@RequiredArgsConstructor
@Configuration
@Order(0)
public class _0_User_Role_Seeder {

    private final IRoleRepository iRoleRepository;
    private final IUserRepository iUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.admin.username:admin}")
    private String adminUsername;

    @Value("${app.security.admin.password:root}")
    private String adminPassword;

    @Value("${app.security.super-admin.username:superadmin}")
    private String superAdminUsername;

    @Value("${app.security.super-admin.password:root}")
    private String superAdminPassword;

    @Bean
    public CommandLineRunner initRolesAndUsersRunner() {
        return args -> {
            log.info("Başlangıç Rolleri ve Kullanıcıları Kontrol Ediliyor...");

            // 1. Rolleri oluştur (yoksa)
            RoleEntity roleUser = getOrCreateRole(RoleType.ROLE_USER);
            RoleEntity roleAdmin = getOrCreateRole(RoleType.ROLE_ADMIN);
            RoleEntity roleSuperAdmin = getOrCreateRole(RoleType.ROLE_SUPER_ADMIN);

            // 2. Admin kullanıcısını oluştur (yoksa)
            if (!iUserRepository.existsByUsername(adminUsername)) {
                Set<RoleEntity> adminRoles = new HashSet<>();
                adminRoles.add(roleAdmin);

                UserEntity admin = UserEntity.builder()
                        .username(adminUsername)
                        .email("admin@berkeozder.com")
                        .password(passwordEncoder.encode(adminPassword))
                        .firstName("Berke")
                        .lastName("Admin")
                        .roles(adminRoles)
                        .isEnabled(true)
                        .isAccountNonLocked(true)
                        .isAccountNonExpired(true)
                        .isCredentialsNonExpired(true)
                        .build();

                iUserRepository.save(admin);
                log.info("Varsayılan ADMIN kullanıcısı oluşturuldu: {}", adminUsername);
            }

            // 3. SuperAdmin kullanıcısını oluştur (yoksa)
            if (!iUserRepository.existsByUsername(superAdminUsername)) {
                Set<RoleEntity> superAdminRoles = new HashSet<>();
                superAdminRoles.add(roleAdmin);
                superAdminRoles.add(roleSuperAdmin);

                UserEntity superAdmin = UserEntity.builder()
                        .username(superAdminUsername)
                        .email("superadmin@berkeozder.com")
                        .password(passwordEncoder.encode(superAdminPassword))
                        .firstName("Berke")
                        .lastName("SuperAdmin")
                        .roles(superAdminRoles)
                        .isEnabled(true)
                        .isAccountNonLocked(true)
                        .isAccountNonExpired(true)
                        .isCredentialsNonExpired(true)
                        .build();

                iUserRepository.save(superAdmin);
                log.info("Varsayılan SUPER_ADMIN kullanıcısı oluşturuldu: {}", superAdminUsername);
            }
        };
    }

    private RoleEntity getOrCreateRole(RoleType roleType) {
        return iRoleRepository.findByRoleName(roleType)
                .orElseGet(() -> {
                    RoleEntity role = RoleEntity.builder().roleName(roleType).build();
                    RoleEntity saved = iRoleRepository.save(role);
                    log.info("Yeni Rol tanımlandı: {}", roleType);
                    return saved;
                });
    }
}

