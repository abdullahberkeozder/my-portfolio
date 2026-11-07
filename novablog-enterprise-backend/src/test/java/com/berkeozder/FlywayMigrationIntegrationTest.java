package com.berkeozder;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class FlywayMigrationIntegrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Flyway migrasyonlarının eksiksiz ve başarılı uygulandığı doğrulanmalıdır")
    void testFlywayMigrationsAppliedSuccessfully() {
        MigrationInfo[] appliedMigrations = flyway.info().applied();
        assertThat(appliedMigrations).isNotEmpty();

        // En az V1, V2 ve V3 migrasyonları bulunmalıdır
        assertThat(appliedMigrations.length).isGreaterThanOrEqualTo(3);

        for (MigrationInfo info : appliedMigrations) {
            assertThat(info.getState()).isEqualTo(MigrationState.SUCCESS);
        }

        assertThat(appliedMigrations[0].getVersion().getVersion()).isEqualTo("1");
        assertThat(appliedMigrations[0].getDescription()).contains("init schema");

        assertThat(appliedMigrations[1].getVersion().getVersion()).isEqualTo("2");
        assertThat(appliedMigrations[1].getDescription()).contains("seed roles and categories");

        assertThat(appliedMigrations[2].getVersion().getVersion()).isEqualTo("3");
        assertThat(appliedMigrations[2].getDescription()).contains("add performance indexes");
    }

    @Test
    @DisplayName("V2 ile eklenen başlangıç rolleri ve kategorileri veritabanında mevcut olmalıdır")
    void testSeedDataPresentInDatabase() {
        // Rol sayısı en az 3 olmalıdır (ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN)
        Integer roleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles", Integer.class);
        assertThat(roleCount).isNotNull().isGreaterThanOrEqualTo(3);

        // Kategori sayısı en az 3 olmalıdır
        Integer categoryCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM blog_categories", Integer.class);
        assertThat(categoryCount).isNotNull().isGreaterThanOrEqualTo(3);

        // Etiket sayısı en az 4 olmalıdır
        Integer tagCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tags", Integer.class);
        assertThat(tagCount).isNotNull().isGreaterThanOrEqualTo(4);
    }
}

