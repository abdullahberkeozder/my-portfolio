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
    record Cancelled(UUID id, String status) {}
    record Restored(UUID id, String status) {}
    record MoveRequest(@JsonProperty("requested_date") LocalDate date,
                       @JsonProperty("requested_time") LocalTime time) {}
    record Moved(UUID id, String status, @JsonProperty("requested_date") LocalDate date,
                 @JsonProperty("requested_time") LocalTime time) {}
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

    Restored restore(UUID userId, UUID id) {
        return db.transaction.execute(tx -> {
            var profiles = db.jdbc.queryForList("""
                select role from public.admin_profiles where user_id=? and status='active'
                and role in ('owner','admin','operator')
                """,userId);
            if (profiles.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            var rows = db.jdbc.queryForList("select status, archived_at from public.appointment_requests where id=? for update",id);
            if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            var row=rows.get(0);
            if (!"confirmed".equals(row.get("status")))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Only confirmed appointments can be restored");
            if (row.get("archived_at") != null) {
                // The existing trigger revalidates and locks the slot before restoring the reservation.
                db.jdbc.update("update public.appointment_requests set archived_at=null where id=?",id);
            }
            return new Restored(id,"confirmed");
        });
    }

    Moved move(UUID userId, UUID id, MoveRequest target) {
        return db.transaction.execute(tx -> {
            var profiles = db.jdbc.queryForList("""
                select role from public.admin_profiles where user_id=? and status='active'
                and role in ('owner','admin','operator')
                """,userId);
            if (profiles.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            if (target == null || target.date() == null || target.time() == null
                    || target.date().isBefore(LocalDate.now(java.time.ZoneId.of("Europe/Istanbul"))))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A current or future target date and time are required");
            var rows = db.jdbc.queryForList("select status, archived_at from public.appointment_requests where id=? for update",id);
            if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            var row=rows.get(0);
            if (row.get("archived_at") != null || !"confirmed".equals(row.get("status")))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Only active confirmed appointments can be moved");
            // The existing trigger locks both slots in stable order and moves the reservation atomically.
            db.jdbc.update("update public.appointment_requests set requested_date=?, requested_time=? where id=?",
                target.date(),target.time(),id);
            return new Moved(id,"confirmed",target.date(),target.time());
        });
    }

    Cancelled cancel(UUID userId, UUID id) {
        return db.transaction.execute(tx -> {
            var profiles = db.jdbc.queryForList("""
                select role from public.admin_profiles where user_id=? and status='active'
                and role in ('owner','admin','operator')
                """,userId);
            if (profiles.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            var rows = db.jdbc.queryForList("select status, archived_at from public.appointment_requests where id=? for update",id);
            if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            var row=rows.get(0);
            if (row.get("archived_at") != null || !java.util.Set.of("new","contacted","confirmed","cancelled").contains(row.get("status")))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Appointment cannot be cancelled");
            if (!"cancelled".equals(row.get("status"))) {
                // The existing trigger releases the reservation in this transaction.
                db.jdbc.update("update public.appointment_requests set status='cancelled' where id=?",id);
            }
            return new Cancelled(id,"cancelled");
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
