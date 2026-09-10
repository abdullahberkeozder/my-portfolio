package com.umutusta;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import org.hibernate.annotations.Immutable;

@Entity @Table(name = "appointment_requests") @Immutable
class AppointmentRow {
    @Id UUID id;
    String customerName;
    String serviceType;
    LocalDate requestedDate;
    LocalTime requestedTime;
    String status;
    Instant createdAt;
    Instant archivedAt;
    protected AppointmentRow() {}
}
