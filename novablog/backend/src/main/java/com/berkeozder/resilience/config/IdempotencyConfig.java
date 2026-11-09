package com.berkeozder.resilience.config;

import com.berkeozder.resilience.idempotency.IdempotencyStorage;
import com.berkeozder.resilience.idempotency.InMemoryIdempotencyStorage;
import com.berkeozder.resilience.idempotency.RedisIdempotencyStorage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Idempotency altyapı konfigürasyonu.
 * Redis varsa dağıtık depolama, yoksa bellek içi (in-memory) depolama devreye girer.
 *
 * @author Berke Özder
 */
@Log4j2
@Configuration
public class IdempotencyConfig {

    @Bean
    @ConditionalOnBean(RedisConnectionFactory.class)
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = false)
    public IdempotencyStorage redisIdempotencyStorage(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        log.info("IdempotencyStorage: Dağıtık Redis depolaması etkinleştirildi.");
        return new RedisIdempotencyStorage(redisTemplate, objectMapper);
    }

    @Bean
    @Primary
    @ConditionalOnMissingBean(IdempotencyStorage.class)
    public IdempotencyStorage inMemoryIdempotencyStorage() {
        log.info("IdempotencyStorage: In-Memory thread-safe depolaması etkinleştirildi.");
        return new InMemoryIdempotencyStorage();
    }
}
