package com.berkeozder.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Date;
import java.util.Map;

/**
 * Standard unified API response wrapper for success and error payloads.
 *
 * @param <T> data payload type
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResult<T> {

    public enum Status {
        SUCCESS,
        ERROR,
        NOT_FOUND,
        UNAUTHORIZED,
        FORBIDDEN,
        UNPROCESSABLE,
        SERVER_ERROR,
        TOO_MANY_REQUESTS
    }

    private Status status;
    private String message;
    private String error;
    private String path;
    private Map<String, Object> errors;
    private T data;

    @Builder.Default
    private Date createdDate = new Date(System.currentTimeMillis());

    public static <T> ApiResult<T> success(T data) {
        return ApiResult.<T>builder()
                .status(Status.SUCCESS)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> ApiResult<T> error(String error, String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.ERROR)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> notFound(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.NOT_FOUND)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> unauthorized(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.UNAUTHORIZED)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> forbidden(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.FORBIDDEN)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> unprocessable(String message, String path, Map<String, Object> errors) {
        return ApiResult.<T>builder()
                .status(Status.UNPROCESSABLE)
                .message(message)
                .path(path)
                .errors(errors)
                .build();
    }

    public static <T> ApiResult<T> serverError(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.SERVER_ERROR)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> nullPointer(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.NOT_FOUND)
                .message(message)
                .path(path)
                .build();
    }

    public static <T> ApiResult<T> tooManyRequests(String message, String path) {
        return ApiResult.<T>builder()
                .status(Status.TOO_MANY_REQUESTS)
                .error("TOO_MANY_REQUESTS")
                .message(message)
                .path(path)
                .build();
    }
}
