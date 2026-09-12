package com.umutusta;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@ConditionalOnProperty(name = "booking.writes.enabled", havingValue = "true")
class BookingCommandController {
    private final BookingCommandService service;
    BookingCommandController(BookingCommandService service) { this.service=service; }

    @PostMapping("/appointments") @ResponseStatus(HttpStatus.CREATED)
    BookingCommandService.Created create(@RequestBody BookingCommandService.CreateRequest request) {
        return service.create(request);
    }

    @PostMapping("/admin/appointments/{id}/confirm")
    BookingCommandService.Confirmed confirm(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID user;
        try { user=UUID.fromString(jwt.getSubject()); }
        catch (IllegalArgumentException | NullPointerException e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); }
        return service.confirm(user,id);
    }

    @PostMapping("/admin/appointments/{id}/cancel")
    BookingCommandService.Cancelled cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID user;
        try { user=UUID.fromString(jwt.getSubject()); }
        catch (IllegalArgumentException | NullPointerException e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); }
        return service.cancel(user,id);
    }
}
