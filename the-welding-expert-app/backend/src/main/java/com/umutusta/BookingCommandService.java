package com.umutusta;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "booking.writes.enabled", havingValue = "true")
class BookingCommandService {
    record CreateRequest(@JsonProperty("customer_name") String name,
                         @JsonProperty("customer_phone") String phone,
                         @JsonProperty("service_type") String service,
                         @JsonProperty("requested_date") LocalDate date,
                         @JsonProperty("requested_time") LocalTime time,
                         @JsonProperty("customer_email") String email,
                         String message,
                         @JsonProperty("customer_note") String note) {}
    record Created(UUID id, @JsonProperty("public_token") UUID publicToken) {}
    record Confirmed(UUID id, String status) {}
    private final CommandDatabase db;
    private final ObjectMapper mapper;
    BookingCommandService(CommandDatabase db, ObjectMapper mapper) { this.db=db; this.mapper=mapper; }

    Created create(CreateRequest request) {
        return db.transaction.execute(tx -> {
            String json = db.jdbc.queryForObject("""
                select public.create_appointment_request(?, ?, ?, cast(? as date), cast(? as time), ?, ?, ?)::text
                """, String.class, request.name(), request.phone(), request.service(), request.date(), request.time(),
                request.email(), request.message(), request.note());
            try { return mapper.readValue(json,Created.class); }
            catch (JsonProcessingException e) { throw new IllegalStateException("Invalid appointment result",e); }
        });
    }

    Confirmed confirm(UUID userId, UUID id) {
        return db.transaction.execute(tx -> {
            // Use the current database role, not a role copied into a potentially stale JWT.
            var profiles = db.jdbc.queryForList("""
                select role from public.admin_profiles where user_id=? and status='active'
                and role in ('owner','admin','operator')
                """,userId);
            if (profiles.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            var rows = db.jdbc.queryForList("select status, archived_at from public.appointment_requests where id=? for update",id);
            if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            var row=rows.get(0);
            if (row.get("archived_at") != null || !java.util.Set.of("new","contacted","confirmed").contains(row.get("status")))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Appointment cannot be confirmed");
            if (!"confirmed".equals(row.get("status"))) {
                // The existing PostgreSQL trigger owns slot locking and reservation.
                db.jdbc.update("update public.appointment_requests set status='confirmed' where id=?",id);
            }
            return new Confirmed(id,"confirmed");
        });
    }
}
