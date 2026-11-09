package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
public class _401_UnAuthorizedRequestException extends NovaBlogException {

    public _401_UnAuthorizedRequestException(String message) {
        super(message);
    }
}
