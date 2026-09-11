package com.umutusta;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/** Separate pool keeps the read API's database privileges unchanged. */
@Component
@ConditionalOnProperty(name = "booking.writes.enabled", havingValue = "true")
class CommandDatabase implements AutoCloseable {
    private final HikariDataSource pool;
    final JdbcTemplate jdbc;
    final TransactionTemplate transaction;

    CommandDatabase(@Value("${booking.writer.url}") String url,
                    @Value("${booking.writer.username}") String username,
                    @Value("${booking.writer.password}") String password) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(4);
        config.setConnectionTimeout(10000);
        config.setConnectionInitSql("set timezone = 'Europe/Istanbul'");
        pool = new HikariDataSource(config);
        jdbc = new JdbcTemplate(pool);
        jdbc.setQueryTimeout(15);
        transaction = new TransactionTemplate(new DataSourceTransactionManager(pool));
        transaction.setTimeout(20);
    }

    @Override public void close() { pool.close(); }
}
