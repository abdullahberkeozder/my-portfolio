package com.umutusta;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.Instant;
import java.util.*;

@RestController @RequestMapping("/api/v1")
class BookingReadController {
    private final BookingReadService service;
    BookingReadController(BookingReadService service) { this.service = service; }
    @GetMapping("/services") List<BookingReadService.ServiceItem> services() { return service.services(); }
    @GetMapping("/availability") List<BookingReadService.SlotItem> availability(@RequestParam LocalDate from, @RequestParam LocalDate to) {
        return service.availability(from, to);
    }
    @GetMapping("/admin/appointments") BookingReadService.AppointmentPage appointments(
        @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String status, @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "false") boolean archived,
        @RequestParam(defaultValue = "") String search,
        @RequestParam(required = false) String leadQuality,
        @RequestParam(required = false) Instant createdAfter,
        @RequestParam(required = false) Instant createdBefore,
        @RequestParam(defaultValue = "appointment") String sort) {
        UUID userId;
        try { userId = UUID.fromString(jwt.getSubject()); }
        catch (IllegalArgumentException | NullPointerException e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); }
        return service.appointments(userId, from, to, status, page, size, archived, search, leadQuality, createdAfter, createdBefore, sort);
    }
}
