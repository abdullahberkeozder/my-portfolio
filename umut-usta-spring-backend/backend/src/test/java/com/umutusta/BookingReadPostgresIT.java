package com.umutusta;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.params.provider.ValueSource;
import com.sun.net.httpserver.HttpServer;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;
import org.testcontainers.postgresql.PostgreSQLContainer;
import java.nio.file.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class BookingReadPostgresIT {
    static final PostgreSQLContainer DB = new PostgreSQLContainer("postgres:17.6-alpine");
    static final UUID ADMIN = UUID.fromString("00000000-0000-0000-0000-000000000001");
    @Autowired BookingReadService service;
    @Autowired MockMvc mvc;
    @Autowired BookingCommandService commands;
    @Autowired CommandDatabase commandDb;
    @org.springframework.boot.test.web.server.LocalServerPort int port;
    static final String READER = "booking_reader";
    static final String PASSWORD = UUID.randomUUID().toString();
    static final String ISSUER = "https://example.invalid/auth/v1";
    static RSAKey signingKey;
    static HttpServer jwks;
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
            for (String file : List.of("welding_appointments_schema.sql", "service_configs_migration.sql", "role_based_access_control.sql",
                    "analytics_events_migration.sql", "sprint_6_measurement_release.sql", "migrations/20260910150437_appointment_reservation_transitions.sql")) {
                s.execute(Files.readString(Path.of(System.getProperty("schema.directory"), file)));
            }
            // Fixture-only grants: no ownership, role membership or RLS bypass.
            s.execute("create role booking_reader login nosuperuser nocreatedb nocreaterole noinherit nobypassrls password '" + PASSWORD + "'");
            s.execute("revoke create on schema public from public; grant usage on schema public to booking_reader");
            // PUBLIC EXECUTE could otherwise expose SECURITY DEFINER write RPCs.
            s.execute("revoke execute on all functions in schema public from public");
            for (String table : List.of("service_configs", "appointment_availability_days",
                    "appointment_availability_slots", "appointment_requests", "admin_profiles")) {
                s.execute("grant select on public." + table + " to booking_reader");
                s.execute("create policy booking_reader_select on public." + table
                    + " for select to booking_reader using (true)");
            }
            s.execute("create role booking_writer login nosuperuser nocreatedb nocreaterole noinherit nobypassrls password '" + PASSWORD + "'");
            s.execute("grant usage on schema public to booking_writer");
            s.execute("grant select on public.admin_profiles, public.appointment_requests to booking_writer");
            s.execute("grant update(status, requested_date, requested_time, archived_at) on public.appointment_requests to booking_writer");
            s.execute("grant execute on function public.create_appointment_request(text,text,text,date,time,text,text,text) to booking_writer");
            s.execute("create policy writer_profiles on public.admin_profiles for select to booking_writer using (true)");
            s.execute("create policy writer_requests_read on public.appointment_requests for select to booking_writer using (true)");
            s.execute("create policy writer_requests_confirm on public.appointment_requests for update to booking_writer using (true) with check (true)");
        }
        signingKey = new RSAKeyGenerator(2048).keyID("test-key").generate();
        byte[] publicKeys = new JWKSet(signingKey.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
        jwks = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        jwks.createContext("/keys", exchange -> {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, publicKeys.length);
            try (var body = exchange.getResponseBody()) { body.write(publicKeys); }
            finally { exchange.close(); }
        });
        jwks.start();
        properties.add("spring.datasource.url", DB::getJdbcUrl);
        properties.add("spring.datasource.username", () -> READER);
        properties.add("spring.datasource.password", () -> PASSWORD);
        properties.add("booking.writes.enabled", () -> "true");
        properties.add("booking.writer.url", DB::getJdbcUrl);
        properties.add("booking.writer.username", () -> "booking_writer");
        properties.add("booking.writer.password", () -> PASSWORD);
        properties.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> ISSUER);
        properties.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri", () -> "http://127.0.0.1:" + jwks.getAddress().getPort() + "/keys");
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
    @AfterAll static void stop() {
        if (jwks != null) jwks.stop(0);
        DB.stop();
    }

    String token(String variant, String subject) throws Exception {
        Instant now = Instant.now();
        var claims = new JWTClaimsSet.Builder().subject(subject)
            .issuer(variant.equals("issuer") ? "https://wrong.invalid" : ISSUER)
            .audience(variant.equals("audience") ? "wrong" : "authenticated")
            .issueTime(java.util.Date.from(now.minusSeconds(600)))
            .expirationTime(java.util.Date.from(now.plusSeconds(variant.equals("expired") ? -300 : 300)))
            .build();
        var jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("test-key").build(), claims);
        RSAKey key = variant.equals("signature") ? new RSAKeyGenerator(2048).generate() : signingKey;
        jwt.sign(new RSASSASigner(key));
        return jwt.serialize();
    }

    @ParameterizedTest @ValueSource(strings = {"signature", "expired", "issuer", "audience"})
    void invalidSignedTokensAreRejected(String variant) throws Exception {
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).param("to",today.toString())
            .header("Authorization", "Bearer " + token(variant,ADMIN.toString())))
            .andExpect(status().isUnauthorized());
    }

    @Test void verifiedJwtUsesCurrentDatabaseRoleForAuthorization() throws Exception {
        request(UUID.randomUUID(),today,"new",false);
        String bearer = "Bearer " + token("valid",ADMIN.toString());
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).param("to",today.toString())
            .header("Authorization",bearer)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        sql("update admin_profiles set role='technician' where user_id=?", ADMIN);
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).param("to",today.toString())
            .header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set role='admin',status='suspended' where user_id=?", ADMIN);
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).param("to",today.toString())
            .header("Authorization",bearer)).andExpect(status().isForbidden());
    }

    @ParameterizedTest @ValueSource(strings = {"not-a-uuid", "00000000-0000-0000-0000-000000000099"})
    void invalidOrUnknownSubjectCannotReadAdminData(String subject) throws Exception {
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).param("to",today.toString())
            .header("Authorization","Bearer " + token("valid",subject)))
            .andExpect(status().is(subject.equals("not-a-uuid") ? 401 : 403));
    }

    @Test void readerGrantsRejectWritesEvenOutsideReadOnlyTransactions() throws Exception {
        try (Connection c = DriverManager.getConnection(DB.getJdbcUrl(),READER,PASSWORD);
             Statement s = c.createStatement()) {
            assertFalse(c.isReadOnly());
            try (ResultSet r = s.executeQuery("select current_user, rolsuper, rolbypassrls from pg_roles where rolname=current_user")) {
                assertTrue(r.next()); assertEquals(READER,r.getString(1));
                assertFalse(r.getBoolean(2)); assertFalse(r.getBoolean(3));
            }
            for (String table : List.of("service_configs", "appointment_availability_days",
                    "appointment_availability_slots", "appointment_requests", "admin_profiles")) {
                for (String command : List.of("insert into " + table + " default values",
                        "delete from " + table, "truncate " + table)) {
                    assertEquals("42501",assertThrows(SQLException.class, () -> s.execute(command)).getSQLState(),command);
                }
            }
            assertEquals("42501",assertThrows(SQLException.class,
                () -> s.execute("update appointment_requests set status='confirmed'")).getSQLState());
            assertEquals("42501",assertThrows(SQLException.class,
                () -> s.execute("select public.create_appointment_request('Test','05550000000','Kaynak',current_date+10,'09:00')")).getSQLState());
            assertEquals("42501",assertThrows(SQLException.class,
                () -> s.execute("select * from auth.users")).getSQLState());
        }
    }

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
    @Test void adminFiltersShareCountPredicateAndEscapeSearchWildcards() throws Exception {
        UUID a=UUID.randomUUID(), b=UUID.randomUUID();
        request(a,today,"new",true); request(b,today,"new",true);
        sql("update appointment_requests set lead_quality='outside_area', admin_note='Gate 100%_done', created_at='2026-01-02T10:00:00Z' where id=?",a);
        sql("update appointment_requests set lead_quality='outside_area', admin_note='Gate 100XXdone', created_at='2026-01-03T10:00:00Z' where id=?",b);
        var filtered=service.appointments(ADMIN,null,null,null,0,1,true,"100%_", "outside_area",
            Instant.parse("2026-01-01T00:00:00Z"),Instant.parse("2026-01-04T00:00:00Z"),"newest");
        assertEquals(1,filtered.total()); assertEquals(a,filtered.items().get(0).id());
        var newest=service.appointments(ADMIN,null,null,null,0,1,true,"", "outside_area",null,null,"newest");
        assertEquals(2,newest.total()); assertEquals(b,newest.items().get(0).id());
        assertEquals(a,service.appointments(ADMIN,null,null,null,1,1,true,"", "outside_area",null,null,"newest").items().get(0).id());
        assertEquals(0,service.appointments(ADMIN,null,null,null,0,20,false,"",null,null,null,"newest").total());
        assertEquals(0,service.appointments(ADMIN,null,null,null,0,20,true,"","untagged",null,null,"newest").total());
        assertEquals(1,service.appointments(ADMIN,null,null,null,0,20,true,"",null,null,Instant.parse("2026-01-03T10:00:00Z"),"newest").total());
        mvc.perform(get("/api/v1/admin/appointments").param("archived","true").param("search","100%_")
            .param("leadQuality","outside_area").param("sort","newest").param("page","0").param("size","1")
            .header("Authorization","Bearer " + token("valid",ADMIN.toString())))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
    }

    @Test void invalidAdminFilterValuesAreBadRequests() throws Exception {
        String bearer="Bearer " + token("valid",ADMIN.toString());
        for (String parameter : List.of("leadQuality","sort")) {
            mvc.perform(get("/api/v1/admin/appointments").param(parameter,"invalid").header("Authorization",bearer))
                .andExpect(status().isBadRequest());
        }
        mvc.perform(get("/api/v1/admin/appointments").param("from",today.toString()).header("Authorization",bearer))
            .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/appointments").param("page","-1").header("Authorization",bearer))
            .andExpect(status().isBadRequest());
    }

    @Test @org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(named = "CI_BROWSER", matches = "true")
    void browserReadsFromTemporarySpringAndPostgres() throws Exception {
        sql("insert into service_configs(service_key,title,description) values ('painting','Duvar boya ve badana','CI PostgreSQL fixture')");
        slot(day(today,"available",true),"09:00",true);
        var builder = new ProcessBuilder("npx","playwright","test","--config=playwright.spring.config.js")
            .directory(Path.of(System.getProperty("schema.directory")).getParent().toFile())
            .redirectErrorStream(true).redirectOutput(Path.of("target/browser-staging.log").toFile());
        builder.environment().put("CI_SPRING_ORIGIN","http://127.0.0.1:" + port);
        Process browser = builder.start();
        try {
            assertTrue(browser.waitFor(180, java.util.concurrent.TimeUnit.SECONDS), "Browser staging timed out");
            assertEquals(0,browser.exitValue(),"Browser staging failed; inspect Playwright artifacts");
            try (Connection c=connect(); Statement s=c.createStatement(); ResultSet r=s.executeQuery("select count(*) from appointment_requests where status='new'")) {
                assertTrue(r.next()); assertEquals(2,r.getInt(1),"Both browser viewports must persist a real pending request");
            }
        } finally {
            browser.descendants().forEach(ProcessHandle::destroy);
            browser.destroyForcibly();
            System.out.println(Files.readString(Path.of("target/browser-staging.log")));
        }
    }

    BookingCommandService.CreateRequest pendingRequest() {
        return new BookingCommandService.CreateRequest("CI Customer","05551234567","Kaynak",today,
            LocalTime.of(9,0),null,null,"Synthetic fixture");
    }

    @Test void springCreationDoesNotReserveAndValidationLeavesNoPartialRecord() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var first=commands.create(pendingRequest());
        assertNotNull(first.publicToken());
        commands.create(pendingRequest());
        assertTrue(service.availability(today,today).get(0).available());
        mvc.perform(post("/api/v1/appointments").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("invalid_customer_details"));
        assertEquals(2,service.appointments(ADMIN,today,today,"new",0,20).total());
    }

    @Test void writerCannotEditCustomerDataDeleteOrInsertDirectly() throws Exception {
        try (Connection c=DriverManager.getConnection(DB.getJdbcUrl(),"booking_writer",PASSWORD);
             Statement s=c.createStatement()) {
            for (String sql:List.of("update appointment_requests set customer_name='changed'",
                    "delete from appointment_requests", "insert into appointment_requests default values",
                    "update admin_profiles set role='owner'", "update appointment_availability_slots set is_available=true")) {
                assertEquals("42501",assertThrows(SQLException.class,()->s.execute(sql)).getSQLState(),sql);
            }
        }
    }

    @Test void springTransactionRollsBackCreationAndConfirmation() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        assertThrows(org.springframework.dao.DataAccessException.class, () -> commandDb.transaction.execute(tx -> {
            commands.create(pendingRequest());
            commandDb.jdbc.execute("select 1/0");
            return null;
        }));
        assertEquals(0,service.appointments(ADMIN,today,today,null,0,20).total());
        var request=commands.create(pendingRequest());
        assertThrows(org.springframework.dao.DataAccessException.class, () -> commandDb.transaction.execute(tx -> {
            commands.confirm(ADMIN,request.id());
            commandDb.jdbc.execute("select 1/0");
            return null;
        }));
        assertEquals(1,service.appointments(ADMIN,today,today,"new",0,20).total());
        assertTrue(service.availability(today,today).get(0).available());
    }

    @Test void confirmationRequiresAdminAndRejectsTerminalOrArchivedRequests() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var request=commands.create(pendingRequest());
        String path="/api/v1/admin/appointments/"+request.id()+"/confirm";
        mvc.perform(post(path)).andExpect(status().isUnauthorized());
        String bearer="Bearer "+token("valid",ADMIN.toString());
        sql("update admin_profiles set role='technician' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set role='operator' where user_id=?",ADMIN);
        sql("update appointment_requests set status='cancelled' where id=?",request.id());
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isConflict());
        sql("update appointment_requests set status='new',archived_at=now() where id=?",request.id());
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isConflict());
        mvc.perform(post("/api/v1/admin/appointments/"+UUID.randomUUID()+"/confirm").header("Authorization",bearer))
            .andExpect(status().isNotFound());
        assertTrue(service.availability(today,today).get(0).available());
    }

    @ParameterizedTest @ValueSource(strings = {"new", "contacted", "confirmed"})
    void cancellationReleasesOnlyItsReservationAndIsIdempotent(String initialStatus) throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var first=commands.create(pendingRequest());
        var second=commands.create(pendingRequest());
        sql("update appointment_requests set status=? where id=?",initialStatus,first.id());
        String path="/api/v1/admin/appointments/"+first.id()+"/cancel";
        String bearer="Bearer "+token("valid",ADMIN.toString());
        mvc.perform(post(path).header("Authorization",bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(first.id().toString()))
            .andExpect(jsonPath("$.status").value("cancelled"));
        assertTrue(service.availability(today,today).get(0).available());
        commands.confirm(ADMIN,second.id());
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isOk());
        assertFalse(service.availability(today,today).get(0).available());
        assertEquals(1,service.appointments(ADMIN,today,today,"cancelled",0,20).total());
        assertEquals(1,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
        mvc.perform(post("/api/v1/admin/appointments/"+first.id()+"/confirm").header("Authorization",bearer))
            .andExpect(status().isConflict());
    }

    @Test void cancellingPendingRequestDoesNotReleaseAnotherReservation() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var pending=commands.create(pendingRequest());
        var confirmed=commands.create(pendingRequest());
        commands.confirm(ADMIN,confirmed.id());
        commands.cancel(ADMIN,pending.id());
        assertFalse(service.availability(today,today).get(0).available());
        assertEquals(1,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
    }

    @Test void cancellationRollsBackStatusAndSlotTogether() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var request=commands.create(pendingRequest());
        commands.confirm(ADMIN,request.id());
        assertThrows(org.springframework.dao.DataAccessException.class, () -> commandDb.transaction.execute(tx -> {
            commands.cancel(ADMIN,request.id());
            commandDb.jdbc.execute("select 1/0");
            return null;
        }));
        assertEquals(1,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
        assertEquals(0,service.appointments(ADMIN,today,today,"cancelled",0,20).total());
        assertFalse(service.availability(today,today).get(0).available());
    }

    @Test void cancellationRejectsUnauthorizedArchivedAndCompletedRequests() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var request=commands.create(pendingRequest());
        commands.confirm(ADMIN,request.id());
        String path="/api/v1/admin/appointments/"+request.id()+"/cancel";
        String bearer="Bearer "+token("valid",ADMIN.toString());
        mvc.perform(post(path)).andExpect(status().isUnauthorized());
        sql("update admin_profiles set role='technician' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set role='operator',status='suspended' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set status='active' where user_id=?",ADMIN);
        assertFalse(service.availability(today,today).get(0).available());
        sql("update appointment_requests set status='completed' where id=?",request.id());
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isConflict());
        assertFalse(service.availability(today,today).get(0).available());
        sql("update appointment_requests set status='cancelled',archived_at=now() where id=?",request.id());
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isConflict());
        mvc.perform(post("/api/v1/admin/appointments/"+UUID.randomUUID()+"/cancel").header("Authorization",bearer))
            .andExpect(status().isNotFound());
    }

    UUID archivedConfirmation() throws Exception {
        var request=commands.create(pendingRequest());
        commands.confirm(ADMIN,request.id());
        sql("update appointment_requests set archived_at=now() where id=?",request.id());
        return request.id();
    }

    Timestamp archiveTimestamp(UUID id) throws Exception {
        try (Connection c=connect(); PreparedStatement s=c.prepareStatement("select archived_at from appointment_requests where id=?")) {
            s.setObject(1,id);
            try (ResultSet r=s.executeQuery()) { assertTrue(r.next()); return r.getTimestamp(1); }
        }
    }

    @Test void restoreReservesSlotAndRetryDoesNotReserveAgain() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        UUID id=archivedConfirmation();
        assertNotNull(archiveTimestamp(id));
        assertTrue(service.availability(today,today).get(0).available());
        for(int i=0;i<2;i++) {
            mvc.perform(post("/api/v1/admin/appointments/"+id+"/restore")
                .header("Authorization","Bearer "+token("valid",ADMIN.toString())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.status").value("confirmed"));
            assertNull(archiveTimestamp(id));
            assertFalse(service.availability(today,today).get(0).available());
            assertEquals(1,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
        }
    }

    @ParameterizedTest @ValueSource(strings = {"occupied", "closed", "hidden", "unavailable"})
    void failedRestoreKeepsOriginalArchiveTimestamp(String kind) throws Exception {
        UUID dayId=day(today,"available",true); slot(dayId,"09:00",true);
        UUID id=archivedConfirmation(); Timestamp archived=archiveTimestamp(id);
        if(kind.equals("occupied")) commands.confirm(ADMIN,commands.create(pendingRequest()).id());
        else if(kind.equals("closed")) sql("update appointment_availability_days set status='closed' where id=?",dayId);
        else if(kind.equals("hidden")) sql("update appointment_availability_days set is_visible=false where id=?",dayId);
        else sql("update appointment_availability_slots set is_available=false where day_id=?",dayId);
        mvc.perform(post("/api/v1/admin/appointments/"+id+"/restore")
            .header("Authorization","Bearer "+token("valid",ADMIN.toString())))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("appointment_slot_unavailable"));
        assertEquals(archived,archiveTimestamp(id));
        assertEquals(kind.equals("occupied") ? 1 : 0,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
        try(Connection c=connect(); Statement s=c.createStatement(); ResultSet r=s.executeQuery("select is_available from appointment_availability_slots")) {
            assertTrue(r.next()); assertEquals(kind.equals("closed") || kind.equals("hidden"),r.getBoolean(1));
        }
    }

    @Test void restoreRollsBackArchiveAndReservationTogether() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        UUID id=archivedConfirmation(); Timestamp archived=archiveTimestamp(id);
        assertThrows(org.springframework.dao.DataAccessException.class,()->commandDb.transaction.execute(tx -> {
            commands.restore(ADMIN,id);
            commandDb.jdbc.execute("select 1/0"); return null;
        }));
        assertEquals(archived,archiveTimestamp(id));
        assertTrue(service.availability(today,today).get(0).available());
        assertEquals(0,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
    }

    @Test void restoreRequiresActiveAdminAndConfirmedState() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        UUID id=archivedConfirmation(); Timestamp archived=archiveTimestamp(id);
        String path="/api/v1/admin/appointments/"+id+"/restore";
        String bearer="Bearer "+token("valid",ADMIN.toString());
        mvc.perform(post(path)).andExpect(status().isUnauthorized());
        sql("update admin_profiles set role='technician' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set role='admin',status='suspended' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isForbidden());
        sql("update admin_profiles set status='active' where user_id=?",ADMIN);
        mvc.perform(post("/api/v1/admin/appointments/"+UUID.randomUUID()+"/restore").header("Authorization",bearer))
            .andExpect(status().isNotFound());
        for(String state:List.of("new","contacted","cancelled","completed")) {
            sql("update appointment_requests set status=? where id=?",state,id);
            mvc.perform(post(path).header("Authorization",bearer)).andExpect(status().isConflict());
            assertEquals(archived,archiveTimestamp(id));
        }
        assertTrue(service.availability(today,today).get(0).available());
    }

    String moveJson(LocalDate date) {
        return "{\"requested_date\":\""+date+"\",\"requested_time\":\"11:00\"}";
    }

    void assertReservation(UUID id, LocalDate date, String time, boolean sourceOpen, boolean targetOpen) throws Exception {
        try (Connection c=connect(); Statement s=c.createStatement();
             ResultSet r=s.executeQuery("select requested_date,requested_time,status from appointment_requests where id='"+id+"'")) {
            assertTrue(r.next()); assertEquals(date,r.getDate(1).toLocalDate());
            assertEquals(LocalTime.parse(time),r.getTime(2).toLocalTime()); assertEquals("confirmed",r.getString(3));
        }
        try (Connection c=connect(); Statement s=c.createStatement();
             ResultSet r=s.executeQuery("select slot_time,is_available from appointment_availability_slots order by slot_time")) {
            assertTrue(r.next()); assertEquals(sourceOpen,r.getBoolean(2));
            assertTrue(r.next()); assertEquals(targetOpen,r.getBoolean(2));
        }
    }

    @ParameterizedTest @ValueSource(ints = {0, 1})
    void moveChangesTimeOrDateAndKeepsConfirmation(int days) throws Exception {
        UUID sourceDay=day(today,"available",true);
        slot(sourceDay,"09:00",true);
        LocalDate targetDate=today.plusDays(days);
        slot(days==0 ? sourceDay : day(targetDate,"available",true),"11:00",true);
        var request=commands.create(pendingRequest()); commands.confirm(ADMIN,request.id());
        String path="/api/v1/admin/appointments/"+request.id()+"/move";
        String bearer="Bearer "+token("valid",ADMIN.toString());
        for (int i=0;i<2;i++) {
            mvc.perform(post(path).header("Authorization",bearer).contentType("application/json").content(moveJson(targetDate)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("confirmed"))
                .andExpect(jsonPath("$.requested_date").value(targetDate.toString()));
            assertReservation(request.id(),targetDate,"11:00",true,false);
        }
    }

    @ParameterizedTest @ValueSource(strings = {"occupied", "hidden", "closed", "unavailable"})
    void failedMovePreservesOriginalReservation(String kind) throws Exception {
        slot(day(today,"available",true),"09:00",true);
        UUID targetDay=day(today.plusDays(1),"available",true);
        slot(targetDay,"11:00",true);
        var request=commands.create(pendingRequest()); commands.confirm(ADMIN,request.id());
        if (kind.equals("occupied")) {
            var other=commands.create(new BookingCommandService.CreateRequest("CI Customer","05551234567","Kaynak",
                today.plusDays(1),LocalTime.of(11,0),null,null,null));
            commands.confirm(ADMIN,other.id());
        } else if (kind.equals("hidden")) sql("update appointment_availability_days set is_visible=false where id=?",targetDay);
        else if (kind.equals("closed")) sql("update appointment_availability_days set status='closed' where id=?",targetDay);
        else sql("update appointment_availability_slots set is_available=false where day_id=?",targetDay);
        mvc.perform(post("/api/v1/admin/appointments/"+request.id()+"/move")
                .header("Authorization","Bearer "+token("valid",ADMIN.toString()))
                .contentType("application/json").content(moveJson(today.plusDays(1))))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("appointment_slot_unavailable"));
        assertReservation(request.id(),today,"09:00",false,kind.equals("hidden") || kind.equals("closed"));
    }

    @Test void moveRollsBackBothSlotsAndDate() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        slot(day(today.plusDays(1),"available",true),"11:00",true);
        var request=commands.create(pendingRequest()); commands.confirm(ADMIN,request.id());
        assertThrows(org.springframework.dao.DataAccessException.class, () -> commandDb.transaction.execute(tx -> {
            commands.move(ADMIN,request.id(),new BookingCommandService.MoveRequest(today.plusDays(1),LocalTime.of(11,0)));
            commandDb.jdbc.execute("select 1/0"); return null;
        }));
        assertReservation(request.id(),today,"09:00",false,true);
    }

    @Test void moveValidatesRoleStateAndPayload() throws Exception {
        UUID dayId=day(today,"available",true); slot(dayId,"09:00",true); slot(dayId,"11:00",true);
        var request=commands.create(pendingRequest());
        String path="/api/v1/admin/appointments/"+request.id()+"/move";
        String bearer="Bearer "+token("valid",ADMIN.toString());
        mvc.perform(post(path).contentType("application/json").content(moveJson(today))).andExpect(status().isUnauthorized());
        sql("update admin_profiles set role='technician' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer).contentType("application/json").content(moveJson(today)))
            .andExpect(status().isForbidden());
        sql("update admin_profiles set role='admin' where user_id=?",ADMIN);
        mvc.perform(post(path).header("Authorization",bearer).contentType("application/json").content(moveJson(today)))
            .andExpect(status().isConflict());
        commands.confirm(ADMIN,request.id());
        for (String body:List.of("{}",moveJson(today.minusDays(1)),"{\"requested_date\":\"invalid\"}"))
            mvc.perform(post(path).header("Authorization",bearer).contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/admin/appointments/"+UUID.randomUUID()+"/move")
            .header("Authorization",bearer).contentType("application/json").content(moveJson(today))).andExpect(status().isNotFound());
        assertReservation(request.id(),today,"09:00",false,true);
        sql("update appointment_requests set archived_at=now() where id=?",request.id());
        mvc.perform(post(path).header("Authorization",bearer).contentType("application/json").content(moveJson(today)))
            .andExpect(status().isConflict());
    }

    @Test void adminLifecyclePreservesReservationsAcrossCommands() throws Exception {
        UUID dayId=day(today,"available",true); slot(dayId,"09:00",true); slot(dayId,"11:00",true);
        String bearer="Bearer "+token("valid",ADMIN.toString());
        String created=mvc.perform(post("/api/v1/appointments").contentType("application/json").content(
            "{\"customer_name\":\"CI Lifecycle\",\"customer_phone\":\"05551234567\",\"service_type\":\"Kaynak\",\"requested_date\":\""+today+"\",\"requested_time\":\"09:00\"}"))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID id=UUID.fromString(new com.fasterxml.jackson.databind.ObjectMapper().readTree(created).get("id").asText());
        String path="/api/v1/admin/appointments/"+id;
        assertTrue(service.availability(today,today).stream().allMatch(s -> s.available()));
        mvc.perform(post(path+"/confirm").header("Authorization",bearer)).andExpect(status().isOk());
        mvc.perform(post(path+"/move").header("Authorization",bearer).contentType("application/json").content(moveJson(today)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.requested_date").value(today.toString()));
        assertReservation(id,today,"11:00",true,false);

        // Archiving still uses the existing integration, so seed that boundary explicitly.
        sql("update appointment_requests set archived_at=now() where id=?",id);
        Timestamp original=archiveTimestamp(id);
        var contender=commands.create(new BookingCommandService.CreateRequest("CI Contender","05551234567","Kaynak",
            today,LocalTime.of(11,0),null,null,null));
        String other="/api/v1/admin/appointments/"+contender.id();
        mvc.perform(post(other+"/confirm").header("Authorization",bearer)).andExpect(status().isOk());
        mvc.perform(post(path+"/restore").header("Authorization",bearer))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("appointment_slot_unavailable"));
        assertEquals(original,archiveTimestamp(id));
        mvc.perform(get("/api/v1/admin/appointments").header("Authorization",bearer).param("archived","true"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.items[0].id").value(id.toString()));
        mvc.perform(post(other+"/cancel").header("Authorization",bearer)).andExpect(status().isOk());
        mvc.perform(post(path+"/restore").header("Authorization",bearer)).andExpect(status().isOk());
        assertNull(archiveTimestamp(id));
        assertReservation(id,today,"11:00",true,false);
        mvc.perform(post(path+"/cancel").header("Authorization",bearer)).andExpect(status().isOk());
        assertTrue(service.availability(today,today).stream().allMatch(s -> s.available()));
        mvc.perform(get("/api/v1/admin/appointments").header("Authorization",bearer)
            .param("status","cancelled").param("page","0").param("size","1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2))
            .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test void parallelMoveAndConfirmationReserveTargetOnlyOnce() throws Exception {
        UUID dayId=day(today,"available",true); slot(dayId,"09:00",true); slot(dayId,"11:00",true);
        var moving=commands.create(pendingRequest()); commands.confirm(ADMIN,moving.id());
        var contender=commands.create(new BookingCommandService.CreateRequest("CI Customer","05551234567","Kaynak",
            today,LocalTime.of(11,0),null,null,null));
        var client=java.net.http.HttpClient.newHttpClient();
        String bearer="Bearer "+token("valid",ADMIN.toString());
        try (Connection lock=connect(); Statement s=lock.createStatement()) {
            lock.setAutoCommit(false);
            s.execute("select id from appointment_availability_slots order by slot_time for update");
            var move=java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://127.0.0.1:"+port+"/api/v1/admin/appointments/"+moving.id()+"/move"))
                .timeout(Duration.ofSeconds(25)).header("Authorization",bearer).header("Content-Type","application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(moveJson(today))).build();
            var confirm=java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://127.0.0.1:"+port+"/api/v1/admin/appointments/"+contender.id()+"/confirm"))
                .timeout(Duration.ofSeconds(25)).header("Authorization",bearer).POST(java.net.http.HttpRequest.BodyPublishers.noBody()).build();
            var a=client.sendAsync(move,java.net.http.HttpResponse.BodyHandlers.ofString());
            var b=client.sendAsync(confirm,java.net.http.HttpResponse.BodyHandlers.ofString());
            long deadline=System.nanoTime()+java.util.concurrent.TimeUnit.SECONDS.toNanos(10);
            boolean waiting=false;
            try (Connection observer=connect(); Statement q=observer.createStatement()) {
                while (System.nanoTime()<deadline) {
                    try (ResultSet r=q.executeQuery("select count(*) from pg_stat_activity where usename='booking_writer' and wait_event_type='Lock'")) {
                        r.next(); if(r.getInt(1)>=2) { waiting=true; break; }
                    }
                    Thread.sleep(25);
                }
            }
            assertTrue(waiting,"Both HTTP commands must reach a PostgreSQL lock wait");
            lock.commit();
            var moved=a.get(25,java.util.concurrent.TimeUnit.SECONDS);
            var confirmed=b.get(25,java.util.concurrent.TimeUnit.SECONDS);
            assertEquals(List.of(200,409),java.util.stream.Stream.of(moved,confirmed).map(java.net.http.HttpResponse::statusCode).sorted().toList());
            assertTrue((moved.statusCode()==409 ? moved : confirmed).body().contains("appointment_slot_unavailable"));
            assertReservation(moving.id(),today,moved.statusCode()==200 ? "11:00" : "09:00",moved.statusCode()==200,false);
            try (Connection c=connect(); Statement q=c.createStatement(); ResultSet r=q.executeQuery(
                    "select count(*) from appointment_requests where status='confirmed' and archived_at is null and requested_time='11:00'")) {
                assertTrue(r.next()); assertEquals(1,r.getInt(1));
            }
        }
    }

    @Test void parallelHttpConfirmationsProduceOneSuccessAndOneConflict() throws Exception {
        slot(day(today,"available",true),"09:00",true);
        var a=commands.create(pendingRequest()); var b=commands.create(pendingRequest());
        var client=java.net.http.HttpClient.newHttpClient();
        String bearer="Bearer "+token("valid",ADMIN.toString());
        try (Connection lock=connect(); Statement s=lock.createStatement()) {
            lock.setAutoCommit(false);
            s.execute("select id from appointment_availability_slots for update");
            var futures=new ArrayList<java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<String>>>();
            for (UUID id:List.of(a.id(),b.id())) {
                var request=java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://127.0.0.1:"+port+"/api/v1/admin/appointments/"+id+"/confirm"))
                    .timeout(Duration.ofSeconds(25)).header("Authorization",bearer).POST(java.net.http.HttpRequest.BodyPublishers.noBody()).build();
                futures.add(client.sendAsync(request,java.net.http.HttpResponse.BodyHandlers.ofString()));
            }
            long deadline=System.nanoTime()+java.util.concurrent.TimeUnit.SECONDS.toNanos(10);
            boolean waiting=false;
            try (Connection observer=connect(); Statement query=observer.createStatement()) {
                while(System.nanoTime()<deadline) {
                    try (ResultSet r=query.executeQuery("select count(*) from pg_stat_activity where usename='booking_writer' and wait_event_type='Lock'")) {
                        r.next(); if(r.getInt(1)>=2) { waiting=true; break; }
                    }
                    Thread.sleep(25);
                }
            }
            assertTrue(waiting,"Both Spring HTTP transactions must reach a real lock wait");
            lock.commit();
            var responses=new ArrayList<java.net.http.HttpResponse<String>>();
            for(var f:futures) responses.add(f.get(25,java.util.concurrent.TimeUnit.SECONDS));
            assertEquals(List.of(200,409),responses.stream().map(java.net.http.HttpResponse::statusCode).sorted().toList());
            assertTrue(responses.stream().filter(r->r.statusCode()==409).findFirst().orElseThrow().body().contains("appointment_slot_unavailable"));
        }
        assertEquals(1,service.appointments(ADMIN,today,today,"confirmed",0,20).total());
        assertEquals(1,service.appointments(ADMIN,today,today,"new",0,20).total());
        assertFalse(service.availability(today,today).get(0).available());
        UUID winner=service.appointments(ADMIN,today,today,"confirmed",0,20).items().get(0).id();
        assertEquals("confirmed",commands.confirm(ADMIN,winner).status());
        mvc.perform(post("/api/v1/appointments").contentType("application/json").content(
            "{\"customer_name\":\"CI Customer\",\"customer_phone\":\"05551234567\",\"service_type\":\"Kaynak\",\"requested_date\":\""+today+"\",\"requested_time\":\"09:00\"}"))
            .andExpect(status().isConflict());
        assertEquals(2,service.appointments(ADMIN,today,today,null,0,20).total());
    }
}
