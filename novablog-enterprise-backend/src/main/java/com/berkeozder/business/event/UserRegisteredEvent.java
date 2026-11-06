package com.berkeozder.business.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserRegisteredEvent extends ApplicationEvent {

    private final Long userId;
    private final String username;
    private final String email;
    private final String fullName;

    public UserRegisteredEvent(Object source, Long userId, String username, String email, String fullName) {
        super(source);
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
    }
}

