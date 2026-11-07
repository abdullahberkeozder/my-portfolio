package com.berkeozder.business.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentCreatedEvent extends ApplicationEvent {

    private final Long commentId;
    private final Long blogId;
    private final String blogTitle;
    private final String authorEmail;
    private final String authorUsername;
    private final String commenterUsername;
    private final String commentContent;

    public CommentCreatedEvent(
            Object source,
            Long commentId,
            Long blogId,
            String blogTitle,
            String authorEmail,
            String authorUsername,
            String commenterUsername,
            String commentContent
    ) {
        super(source);
        this.commentId = commentId;
        this.blogId = blogId;
        this.blogTitle = blogTitle;
        this.authorEmail = authorEmail;
        this.authorUsername = authorUsername;
        this.commenterUsername = commenterUsername;
        this.commentContent = commentContent;
    }
}

