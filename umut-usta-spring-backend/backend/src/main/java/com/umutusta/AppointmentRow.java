package com.umutusta;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;
import org.hibernate.annotations.Immutable;

@Entity @Table(name = "appointment_requests") @Immutable
class AppointmentRow {
    @Id UUID id;
    String customerName;
    String customerPhone;
    String customerEmail;
    String customerNote;
    String notes;
    String adminNote;
    String customerActionNote;
    String cancellationReason;
    String customerFeedback;
    String leadQuality;
    String serviceType;
    LocalDate requestedDate;
    LocalTime requestedTime;
    String status;
    Instant createdAt;
    Instant archivedAt;
    protected AppointmentRow() {}
}
