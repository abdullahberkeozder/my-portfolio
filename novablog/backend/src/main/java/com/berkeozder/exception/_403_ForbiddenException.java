package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class _403_ForbiddenException extends NovaBlogException {

    public _403_ForbiddenException(String message) {
        super(message);
    }
}
