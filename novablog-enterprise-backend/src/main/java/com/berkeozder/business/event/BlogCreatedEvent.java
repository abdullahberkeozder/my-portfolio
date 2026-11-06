package com.berkeozder.business.event;

import com.berkeozder.business.dto.BlogDto;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Yeni bir blog başarıyla oluşturulduğunda tetiklenen Spring uygulama olayı.
 *
 * @author Berke Özder
 */
@Getter
public class BlogCreatedEvent extends ApplicationEvent {

    private final BlogDto blogDto;

    public BlogCreatedEvent(Object source, BlogDto blogDto) {
        super(source);
        this.blogDto = blogDto;
    }
}

