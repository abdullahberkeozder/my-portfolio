package com.umutusta;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.sql.SQLException;
import java.util.Set;

@RestControllerAdvice(assignableTypes = BookingCommandController.class)
class BookingCommandErrors {
    record ErrorBody(String code, String message) {}
    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ErrorBody> databaseError(DataAccessException error) {
        for (Throwable cause=error; cause!=null; cause=cause.getCause()) {
            if (!(cause instanceof SQLException sql)) continue;
            if ("P0001".equals(sql.getSQLState())) {
                if (sql.getMessage().contains("appointment_slot_unavailable"))
                    return ResponseEntity.status(409).body(new ErrorBody("appointment_slot_unavailable","Selected slot is no longer available"));
                for (String code : Set.of("invalid_customer_details","invalid_customer_email","appointment_text_too_long",
                        "appointment_date_unavailable","invalid_appointment_time")) {
                    if (sql.getMessage().contains(code)) return ResponseEntity.badRequest().body(new ErrorBody(code,"Invalid appointment details"));
                }
            }
            if (Set.of("40P01","40001","55P03","57014").contains(String.valueOf(sql.getSQLState())))
                return ResponseEntity.status(409).body(new ErrorBody("appointment_retry_required","Please retry the operation"));
        }
        return ResponseEntity.internalServerError().body(new ErrorBody("appointment_failed","Appointment operation failed"));
    }
}
