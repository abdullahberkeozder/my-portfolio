package com.umutusta;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.*;
import java.util.*;

@Service @Transactional(readOnly = true)
class BookingReadService {
    private final EntityManager em;
    BookingReadService(EntityManager em) { this.em = em; }
    static final Set<String> STATUSES = Set.of("new", "contacted", "confirmed", "cancelled", "completed");
    record ServiceItem(UUID id, String serviceKey, String title, String description, String priceTagline, String imageUrl) {}
    record SlotItem(UUID id, LocalDate date, LocalTime time, boolean available) {}
    record AppointmentItem(UUID id, String customerName, String serviceType, LocalDate date, LocalTime time, String status) {}
    record AppointmentPage(List<AppointmentItem> items, int page, int size, long total) {}

    @SuppressWarnings("unchecked")
    List<ServiceItem> services() {
        List<Object[]> rows = em.createNativeQuery("select id, service_key, title, description, price_tagline, image_url from service_configs where is_active=true order by sort_order, id").getResultList();
        return rows.stream().map(r -> new ServiceItem((UUID)r[0], (String)r[1], (String)r[2], (String)r[3], (String)r[4], (String)r[5])).toList();
    }
    static void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || to.isBefore(from) || to.isAfter(from.plusDays(90)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date range must be within 90 days");
    }
    @SuppressWarnings("unchecked")
    List<SlotItem> availability(LocalDate from, LocalDate to) {
        validateRange(from, to);
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        if (from.isBefore(today)) from = today;
        if (to.isBefore(from)) return List.of();
        List<Object[]> rows = em.createNativeQuery("""
            select s.id, d.work_date, s.slot_time,
              (s.is_available and d.status <> 'closed' and not exists (
                select 1 from appointment_requests r where r.requested_date=d.work_date
                and r.requested_time=s.slot_time and r.status='confirmed' and r.archived_at is null))
            from appointment_availability_days d join appointment_availability_slots s on s.day_id=d.id
            where d.is_visible=true and d.work_date between :from and :to
            order by d.work_date, s.slot_time, s.id
            """).setParameter("from", from).setParameter("to", to).getResultList();
        return rows.stream().map(r -> new SlotItem((UUID)r[0], ((java.sql.Date)r[1]).toLocalDate(), ((java.sql.Time)r[2]).toLocalTime(), (Boolean)r[3])).toList();
    }
    AppointmentPage appointments(UUID userId, LocalDate from, LocalDate to, String status, int page, int size) {
        Number allowed = (Number)em.createNativeQuery("select count(*) from admin_profiles where user_id=:id and status='active' and role in ('owner','admin','operator')")
            .setParameter("id", userId).getSingleResult();
        if (allowed.longValue() != 1) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        validateRange(from, to);
        if (page < 0 || page > 10000 || size < 1 || size > 100 || (status != null && !STATUSES.contains(status)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        String where = " from AppointmentRow a where a.archivedAt is null and a.requestedDate between :from and :to";
        if (status != null) where += " and a.status=:status";
        var query = em.createQuery("select a" + where + " order by a.requestedDate, a.requestedTime, a.id", AppointmentRow.class);
        var count = em.createQuery("select count(a)" + where, Long.class);
        query.setParameter("from", from).setParameter("to", to);
        count.setParameter("from", from).setParameter("to", to);
        if (status != null) { query.setParameter("status", status); count.setParameter("status", status); }
        var rows = query.setFirstResult(page * size).setMaxResults(size).getResultList();
        return new AppointmentPage(rows.stream().map(a -> new AppointmentItem(a.id,a.customerName,a.serviceType,a.requestedDate,a.requestedTime,a.status)).toList(), page, size, count.getSingleResult());
    }
}
