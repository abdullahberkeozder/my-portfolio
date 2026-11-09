package com.berkeozder.exception;

/**
 * Base runtime exception for NovaBlog domain and application errors.
 */
public class NovaBlogException extends RuntimeException {

    public NovaBlogException(String message) {
        super(message);
    }

    public NovaBlogException(String message, Throwable cause) {
        super(message, cause);
    }
}

