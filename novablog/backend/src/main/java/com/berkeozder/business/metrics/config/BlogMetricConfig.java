package com.berkeozder.business.metrics.config;

import com.berkeozder.business.metrics.IBlogMetricBufferService;
import com.berkeozder.business.metrics.impl.InMemoryBlogMetricBufferServiceImpl;
import com.berkeozder.business.metrics.impl.RedisBlogMetricBufferServiceImpl;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Blog Metrik Tamponlama Konfigürasyonu.
 * Redis varsa dağıtık tampon, yoksa bellek içi (in-memory) tampon devreye girer.
 *
 * @author Berke Özder
 */
@Log4j2
@Configuration
@EnableScheduling
public class BlogMetricConfig {

    @Bean
    @ConditionalOnBean(RedisConnectionFactory.class)
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = false)
    public IBlogMetricBufferService redisBlogMetricBufferService(StringRedisTemplate redisTemplate) {
        log.info("BlogMetricBufferService: Dağıtık Redis tamponlama etkinleştirildi.");
        return new RedisBlogMetricBufferServiceImpl(redisTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnMissingBean(IBlogMetricBufferService.class)
    public IBlogMetricBufferService inMemoryBlogMetricBufferService() {
        log.info("BlogMetricBufferService: In-Memory thread-safe (LongAdder) tamponlama etkinleştirildi.");
        return new InMemoryBlogMetricBufferServiceImpl();
    }
}

