package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class _400_BadRequestException extends NovaBlogException {

    public _400_BadRequestException(String message) {
        super(message);
    }
}
