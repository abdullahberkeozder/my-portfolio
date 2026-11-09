package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class _500_IntervalServerException extends NovaBlogException {

    public _500_IntervalServerException(String message) {
        super(message);
    }
}
