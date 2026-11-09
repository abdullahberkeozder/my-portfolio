package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class _404_NotFoundException extends NovaBlogException {

    public _404_NotFoundException(String message) {
        super(message);
    }
}
