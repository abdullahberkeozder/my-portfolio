package com.berkeozder.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Date;
import java.util.Map;

// ------------------ LOMBOK ------------------
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder

// Spring Framework'ün varsayılan Error yapısı yerine yazdığımız standart response yapısıdır.
// Eğer null değer varsa JSON'a dahil etme:
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResult<T> {

    // Status enum'ı
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

    private Status status;              // Enum tipinde durum
    private String message;             // Kullanıcıya veya frontend'e gösterilecek mesaj
    private String error;               // Opsiyonel hata kodu veya kısa açıklama
    private String path;                // Endpoint path
    private Map<String, Object> errors; // Validation hataları
    private T data;                     // Generic data
    @Builder.Default
    private Date createdDate = new Date(System.currentTimeMillis()); // Oluşturulma zamanı

    // ------------------ Static Factory Methods ------------------
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

} // end class ApiResult
