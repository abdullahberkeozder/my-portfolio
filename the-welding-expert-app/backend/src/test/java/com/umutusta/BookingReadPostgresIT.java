package com.umutusta;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;
import org.testcontainers.postgresql.PostgreSQLContainer;
import java.nio.file.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BookingReadPostgresIT {
    static final PostgreSQLContainer DB = new PostgreSQLContainer("postgres:17.6-alpine");
    static final UUID ADMIN = UUID.fromString("00000000-0000-0000-0000-000000000001");
    @Autowired BookingReadService service;
    LocalDate today;

    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) throws Exception {
        DB.start();
        try (Connection c = connect(); Statement s = c.createStatement()) {
            s.execute("""
                create role anon; create role authenticated;
                create schema auth;
                create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
                create function auth.uid() returns uuid language sql as 'select null::uuid';
                """);
            for (String file : List.of("welding_appointments_schema.sql", "service_configs_migration.sql", "role_based_access_control.sql")) {
                s.execute(Files.readString(Path.of(System.getProperty("schema.directory"), file)));
            }
        }
        properties.add("spring.datasource.url", DB::getJdbcUrl);
        properties.add("spring.datasource.username", DB::getUsername);
        properties.add("spring.datasource.password", DB::getPassword);
        properties.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> "https://example.invalid/auth/v1");
        properties.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri", () -> "https://example.invalid/keys");
    }
    static Connection connect() throws SQLException {
        return DriverManager.getConnection(DB.getJdbcUrl(), DB.getUsername(), DB.getPassword());
    }
    static void sql(String query, Object... values) throws SQLException {
        try (Connection c = connect(); PreparedStatement s = c.prepareStatement(query)) {
            for (int i=0; i<values.length; i++) s.setObject(i+1, values[i]);
            s.execute();
        }
    }
    @BeforeEach void fixtures() throws Exception {
        today = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        sql("truncate appointment_requests, appointment_availability_days, service_configs, auth.users cascade");
        sql("insert into auth.users(id,email) values (?, 'reader@example.invalid')", ADMIN);
        sql("update admin_profiles set status='active', role='admin' where user_id=?", ADMIN);
    }
    @AfterAll static void stop() { DB.stop(); }

    UUID day(LocalDate date, String status, boolean visible) throws SQLException {
        UUID id = UUID.randomUUID();
        sql("insert into appointment_availability_days(id,work_date,status,is_visible) values (?,?,?,?)", id,date,status,visible);
        return id;
    }
    UUID slot(UUID day, String time, boolean available) throws SQLException {
        UUID id = UUID.randomUUID();
        sql("insert into appointment_availability_slots(id,day_id,slot_time,is_available) values (?,?,?,?)", id,day,LocalTime.parse(time),available);
        return id;
    }
    void request(UUID id, LocalDate date, String status, boolean archived) throws SQLException {
        sql("""
            insert into appointment_requests(id, customer_name, customer_phone, service_type,
              requested_date, requested_time, status, archived_at, created_at)
            values (?, 'Test Customer', '05550000000', 'Kaynak', ?, '09:00', ?, ?, '2020-01-01T00:00:00Z')
            """, id,date,status,archived ? OffsetDateTime.now() : null);
    }
    @Test void servicesFilterInactiveAndMapNullableFieldsInStableOrder() throws Exception {
        UUID a = UUID.fromString("00000000-0000-0000-0000-000000000010");
        UUID b = UUID.fromString("00000000-0000-0000-0000-000000000020");
        sql("insert into service_configs(id,service_key,title,sort_order) values (?,'b','B',2),(?,'a','A',2)", b,a);
        sql("insert into service_configs(service_key,title,is_active,sort_order) values ('hidden','Hidden',false,0)");
        var items = service.services();
        assertEquals(List.of(a,b), items.stream().map(BookingReadService.ServiceItem::id).toList());
        assertEquals("a", items.get(0).serviceKey());
        assertNull(items.get(0).description());
    }
    @Test void availabilityMapsPostgresTypesAndExcludesPastHiddenAndOutOfRangeDays() throws Exception {
        slot(day(today.minusDays(1),"available",true),"09:00",true);
        UUID visible = day(today,"available",true);
        UUID late = slot(visible,"11:00",false);
        UUID early = slot(visible,"09:00",true);
        slot(day(today.plusDays(1),"available",false),"09:00",true);
        UUID closed = slot(day(today.plusDays(2),"closed",true),"09:00",true);
        slot(day(today.plusDays(3),"available",true),"09:00",true);
        var items = service.availability(today.minusDays(1),today.plusDays(2));
        assertEquals(List.of(early,late,closed),items.stream().map(BookingReadService.SlotItem::id).toList());
        assertEquals(today,items.get(0).date());
        assertEquals(LocalTime.of(9,0),items.get(0).time());
        assertTrue(items.get(0).available());
        assertFalse(items.get(1).available());
        assertFalse(items.get(2).available());
        assertTrue(service.availability(today.minusDays(2),today.minusDays(1)).isEmpty());
    }
    @Test void confirmedRequestOverridesManuallyReopenedSlotAndArchiveReleasesIt() throws Exception {
        UUID slot = slot(day(today,"available",true),"09:00",true);
        UUID request = UUID.randomUUID();
        request(request,today,"new",false);
        sql("update appointment_requests set status='confirmed' where id=?",request);
        sql("update appointment_availability_slots set is_available=true where id=?",slot);
        assertFalse(service.availability(today,today).get(0).available());
        sql("update appointment_requests set archived_at=now() where id=?",request);
        assertTrue(service.availability(today,today).get(0).available());
    }
    @Test void appointmentDateStatusArchiveFiltersAndPaginationUseSamePredicate() throws Exception {
        UUID a = UUID.fromString("00000000-0000-0000-0000-000000000010");
        UUID b = UUID.fromString("00000000-0000-0000-0000-000000000020");
        request(b,today,"new",false); request(a,today,"new",false);
        request(UUID.randomUUID(),today,"cancelled",false);
        request(UUID.randomUUID(),today,"new",true);
        request(UUID.randomUUID(),today.plusDays(1),"new",false);
        var first = service.appointments(ADMIN,today,today,"new",0,1);
        var second = service.appointments(ADMIN,today,today,"new",1,1);
        assertEquals(2,first.total()); assertEquals(2,second.total());
        assertEquals(a,first.items().get(0).id()); assertEquals(b,second.items().get(0).id());
        assertEquals("Test Customer",first.items().get(0).customerName());
        assertEquals(3,service.appointments(ADMIN,today,today,null,0,20).total());
        assertTrue(service.appointments(ADMIN,today,today,"new",2,1).items().isEmpty());
    }
    @ParameterizedTest @CsvSource({"owner,active,true","admin,active,true","operator,active,true","technician,active,false","admin,suspended,false","owner,pending,false","operator,rejected,false"})
    void currentDatabaseRoleControlsAdminReads(String role,String status,boolean allowed) throws Exception {
        sql("update admin_profiles set role=?,status=? where user_id=?",role,status,ADMIN);
        if (allowed) assertDoesNotThrow(() -> service.appointments(ADMIN,today,today,null,0,20));
        else assertEquals(403,assertThrows(ResponseStatusException.class,
            () -> service.appointments(ADMIN,today,today,null,0,20)).getStatusCode().value());
    }
    @Test void missingProfileAndInvalidFiltersAreRejected() {
        assertEquals(403,assertThrows(ResponseStatusException.class,
            () -> service.appointments(UUID.randomUUID(),today,today,null,0,20)).getStatusCode().value());
        assertEquals(400,assertThrows(ResponseStatusException.class,
            () -> service.appointments(ADMIN,today,today,"invalid",0,20)).getStatusCode().value());
        assertEquals(400,assertThrows(ResponseStatusException.class,
            () -> service.appointments(ADMIN,today,today,null,0,101)).getStatusCode().value());
        assertEquals(400,assertThrows(ResponseStatusException.class,
            () -> service.availability(today,today.plusDays(91))).getStatusCode().value());
    }
}
