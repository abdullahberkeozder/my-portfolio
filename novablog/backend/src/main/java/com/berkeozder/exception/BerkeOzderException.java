package com.berkeozder.exception;

/**
 * @deprecated Renamed to {@link NovaBlogException}. Retained for backward compatibility.
 */
@Deprecated
public class BerkeOzderException extends NovaBlogException {

    public BerkeOzderException(String message) {
        super(message);
    }

    public BerkeOzderException(String message, Throwable cause) {
        super(message, cause);
    }
}
