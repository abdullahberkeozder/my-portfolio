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
    record ServiceItem(UUID id, String serviceKey, String title, String description, String priceTagline, String imageUrl, String[] points) {}
    record SlotItem(UUID id, LocalDate date, LocalTime time, boolean available, UUID dayId, String dayStatus, String dayNote, String note) {}
    record AppointmentItem(UUID id, String customerName, String serviceType, LocalDate date, LocalTime time, String status) {}
    record AppointmentPage(List<AppointmentItem> items, int page, int size, long total) {}

    @SuppressWarnings("unchecked")
    List<ServiceItem> services() {
        List<Object[]> rows = em.createNativeQuery("select id, service_key, title, description, price_tagline, image_url, points from service_configs where is_active=true order by sort_order, id").getResultList();
        return rows.stream().map(r -> new ServiceItem((UUID)r[0], (String)r[1], (String)r[2], (String)r[3], (String)r[4], (String)r[5], (String[])r[6])).toList();
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
                and r.requested_time=s.slot_time and r.status='confirmed' and r.archived_at is null)),
              d.id, d.status, d.note, s.note
            from appointment_availability_days d join appointment_availability_slots s on s.day_id=d.id
            where d.is_visible=true and d.work_date between :from and :to
            order by d.work_date, s.slot_time, s.id
            """).setParameter("from", from).setParameter("to", to).getResultList();
        return rows.stream().map(r -> new SlotItem((UUID)r[0], ((java.sql.Date)r[1]).toLocalDate(), ((java.sql.Time)r[2]).toLocalTime(), (Boolean)r[3], (UUID)r[4], (String)r[5], (String)r[6], (String)r[7])).toList();
    }
    AppointmentPage appointments(UUID userId, LocalDate from, LocalDate to, String status, int page, int size) {
        return appointments(userId, from, to, status, page, size, false, "", null, null, null, "appointment");
    }
    AppointmentPage appointments(UUID userId, LocalDate from, LocalDate to, String status, int page, int size,
            boolean archived, String search, String leadQuality, Instant createdAfter, Instant createdBefore, String sort) {
        Number allowed = (Number)em.createNativeQuery("select count(*) from admin_profiles where user_id=:id and status='active' and role in ('owner','admin','operator')")
            .setParameter("id", userId).getSingleResult();
        if (allowed.longValue() != 1) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (from != null || to != null) validateRange(from, to);
        if (search == null) search = "";
        search = search.trim();
        if (search.length() > 200 || !Set.of("appointment", "newest").contains(sort)
                || (leadQuality != null && !Set.of("qualified", "unqualified", "outside_area", "spam", "untagged").contains(leadQuality))
                || (createdAfter != null && createdBefore != null && !createdAfter.isBefore(createdBefore)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if (page < 0 || page > 10000 || size < 1 || size > 100 || (status != null && !STATUSES.contains(status)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        String where = " from AppointmentRow a where a.archivedAt is " + (archived ? "not null" : "null");
        Map<String,Object> params = new LinkedHashMap<>();
        if (from != null) { where += " and a.requestedDate between :from and :to"; params.put("from",from); params.put("to",to); }
        if (createdAfter != null) { where += " and a.createdAt >= :createdAfter"; params.put("createdAfter",createdAfter); }
        if (createdBefore != null) { where += " and a.createdAt < :createdBefore"; params.put("createdBefore",createdBefore); }
        if ("untagged".equals(leadQuality)) where += " and a.leadQuality is null";
        else if (leadQuality != null) { where += " and a.leadQuality=:quality"; params.put("quality",leadQuality); }
        if (!search.isEmpty()) {
            var conditions = List.of("customerName", "customerPhone", "customerEmail", "customerNote", "notes",
                "adminNote", "customerActionNote", "cancellationReason", "customerFeedback", "leadQuality", "serviceType")
                .stream().map(field -> "lower(coalesce(a." + field + ", '')) like :search escape '!'").toList();
            where += " and (" + String.join(" or ",conditions) + ")";
            params.put("search", "%" + search.toLowerCase(Locale.ROOT).replace("!","!!").replace("%","!%").replace("_","!_") + "%");
        }
        if (status != null) where += " and a.status=:status";
        var query = em.createQuery("select a" + where + (sort.equals("newest") ? " order by a.createdAt desc, a.id" : " order by a.requestedDate, a.requestedTime, a.id"), AppointmentRow.class);
        var count = em.createQuery("select count(a)" + where, Long.class);
        params.forEach((key,value) -> { query.setParameter(key,value); count.setParameter(key,value); });
        if (status != null) { query.setParameter("status", status); count.setParameter("status", status); }
        var rows = query.setFirstResult(page * size).setMaxResults(size).getResultList();
        return new AppointmentPage(rows.stream().map(a -> new AppointmentItem(a.id,a.customerName,a.serviceType,a.requestedDate,a.requestedTime,a.status)).toList(), page, size, count.getSingleResult());
    }
}
