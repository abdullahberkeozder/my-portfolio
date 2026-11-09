package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.TOO_MANY_REQUESTS)
public class _429_TooManyRequestsException extends NovaBlogException {

    public _429_TooManyRequestsException(String message) {
        super(message);
    }
}
