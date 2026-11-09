package com.berkeozder.error;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.webmvc.error.ErrorAttributes;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Global fallback error controller delivering standard {@link ApiResult} structure for framework-level errors.
 */
@RestController
@CrossOrigin
@RequiredArgsConstructor
@Log4j2
public class CustomErrorHandleWebRequest implements ErrorController {

    private final ErrorAttributes errorAttributes;

    @RequestMapping("/error")
    public ApiResult<Object> handleErrorMethod(WebRequest webRequest) {
        Map<String, Object> attributes = errorAttributes.getErrorAttributes(
                webRequest,
                ErrorAttributeOptions.of(
                        ErrorAttributeOptions.Include.MESSAGE,
                        ErrorAttributeOptions.Include.BINDING_ERRORS
                )
        );

        int status = attributes.get("status") == null ? 0 : Integer.parseInt(attributes.get("status").toString());
        String message = (String) attributes.get("message");
        String path = (String) attributes.get("path");

        Map<String, Object> validationErrors = null;
        if (attributes.containsKey("errors")) {
            List<FieldError> fieldErrors = (List<FieldError>) attributes.get("errors");
            validationErrors = new HashMap<>();
            for (FieldError fieldError : fieldErrors) {
                validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
            }
        }

        ApiResult.Status apiStatus = switch (status) {
            case 200 -> ApiResult.Status.SUCCESS;
            case 400 -> ApiResult.Status.UNPROCESSABLE;
            case 401 -> ApiResult.Status.UNAUTHORIZED;
            case 403 -> ApiResult.Status.FORBIDDEN;
            case 404 -> ApiResult.Status.NOT_FOUND;
            case 429 -> ApiResult.Status.TOO_MANY_REQUESTS;
            case 500 -> ApiResult.Status.SERVER_ERROR;
            default -> ApiResult.Status.ERROR;
        };

        return ApiResult.<Object>builder()
                .status(apiStatus)
                .message(message)
                .path(path)
                .errors(validationErrors)
                .build();
    }
}
