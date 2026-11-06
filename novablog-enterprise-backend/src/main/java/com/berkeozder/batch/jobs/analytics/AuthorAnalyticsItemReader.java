package com.berkeozder.batch.jobs.analytics;

import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IUserRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.infrastructure.item.ItemReader;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.List;

@Log4j2
@Component
@StepScope
public class AuthorAnalyticsItemReader implements ItemReader<UserEntity> {

    private final IUserRepository userRepository;
    private Iterator<UserEntity> userIterator;
    private boolean initialized = false;

    public AuthorAnalyticsItemReader(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserEntity read() {
        if (!initialized) {
            List<UserEntity> users = userRepository.findAll();
            log.info("AuthorAnalyticsItemReader başlatıldı. Analiz edilecek toplam kullanıcı sayısı: {}", users.size());
            this.userIterator = users.iterator();
            this.initialized = true;
        }

        if (userIterator != null && userIterator.hasNext()) {
            return userIterator.next();
        }
        return null;
    }
}

