package com.umutusta;

import org.junit.jupiter.api.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import java.nio.file.*;
import java.sql.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@Timeout(40)
class AppointmentContractTest {
    static final PostgreSQLContainer DB = new PostgreSQLContainer("postgres:17.6-alpine");

    static Connection connect() throws SQLException {
        Connection c = DriverManager.getConnection(DB.getJdbcUrl(), DB.getUsername(), DB.getPassword());
        execute(c, "set statement_timeout = '15s'");
        return c;
    }
    static void execute(Connection c, String sql) throws SQLException {
        try (Statement s = c.createStatement()) { s.execute(sql); }
    }
    static String scalar(Connection c, String sql) throws SQLException {
        try (Statement s = c.createStatement(); ResultSet r = s.executeQuery(sql)) {
            assertTrue(r.next()); return r.getString(1);
        }
    }
    @BeforeAll static void schema() throws Exception {
        DB.start();
        try (Connection c = connect()) {
            // Minimal Supabase catalog shim, not an Auth/RLS test environment.
            execute(c, """
                create role anon; create role authenticated;
                create schema auth;
                create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
                create function auth.uid() returns uuid language sql as 'select null::uuid';
                """);
            execute(c, Files.readString(Path.of(System.getProperty("schema.path"))));
        }
    }
    @AfterAll static void stop() { DB.stop(); }
    @BeforeEach void fixture() throws Exception {
        try (Connection c = connect()) {
            execute(c, "truncate public.appointment_requests, public.appointment_availability_days cascade");
            execute(c, "insert into appointment_availability_days(work_date) values(current_date + 10)");
            execute(c, "insert into appointment_availability_slots(day_id, slot_time) select id, '09:00' from appointment_availability_days");
        }
    }
    static String request(Connection c) throws SQLException {
        return scalar(c, "select public.create_appointment_request('Contract Test','05550000000','Kaynak',current_date+10,'09:00') ->> 'id'");
    }
    static void confirm(Connection c, String id) throws SQLException {
        try (PreparedStatement s = c.prepareStatement("update appointment_requests set status='confirmed' where id=?::uuid")) {
            s.setString(1, id); assertEquals(1, s.executeUpdate());
        }
    }
    @Test void requestsDoNotReserveSlot() throws Exception {
        try (Connection c = connect()) {
            request(c); request(c);
            assertEquals("2", scalar(c, "select count(*) from appointment_requests where status='new'"));
            assertEquals("t", scalar(c, "select is_available from appointment_availability_slots"));
        }
    }
    @Test void confirmationAndSlotRollbackTogether() throws Exception {
        try (Connection c = connect()) {
            String id = request(c);
            c.setAutoCommit(false);
            confirm(c, id);
            assertEquals("f", scalar(c, "select is_available from appointment_availability_slots"));
            assertThrows(SQLException.class, () -> execute(c, "select 1/0"));
            c.rollback(); c.setAutoCommit(true);
            assertEquals("new", scalar(c, "select status from appointment_requests"));
            assertEquals("t", scalar(c, "select is_available from appointment_availability_slots"));
        }
    }
    @Test void concurrentConfirmationWaitsThenRejectsSecondRequest() throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try (Connection first = connect(); Connection second = connect(); Connection observer = connect()) {
            String a = request(first), b = request(first);
            int pid = Integer.parseInt(scalar(second, "select pg_backend_pid()"));
            first.setAutoCommit(false); second.setAutoCommit(false);
            confirm(first, a);
            Future<String> loser = executor.submit(() -> {
                try { confirm(second, b); second.commit(); return "unexpected-success"; }
                catch (SQLException e) { second.rollback(); return e.getSQLState() + ":" + e.getMessage(); }
            });
            // Observe an actual database lock wait, not a timing-based race assumption.
            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
            boolean blocked = false;
            while (System.nanoTime() < deadline) {
                blocked = "t".equals(scalar(observer, "select cardinality(pg_blocking_pids(" + pid + ")) > 0"));
                if (blocked) break;
                Thread.sleep(25);
            }
            assertTrue(blocked, "Second confirmation must wait for the slot lock");
            first.commit();
            String error = loser.get(15, TimeUnit.SECONDS);
            assertTrue(error.contains("P0001") && error.contains("appointment_slot_unavailable"), error);
            assertEquals("1", scalar(observer, "select count(*) from appointment_requests where status='confirmed'"));
            assertEquals("1", scalar(observer, "select count(*) from appointment_requests where status='new'"));
            assertEquals("f", scalar(observer, "select is_available from appointment_availability_slots"));
        } finally { executor.shutdownNow(); }
    }
    @Test void cancellationReleasesSlotForAnotherRequest() throws Exception {
        try (Connection c = connect()) {
            String a = request(c), b = request(c);
            confirm(c, a);
            execute(c, "update appointment_requests set status='cancelled' where status='confirmed'");
            assertEquals("t", scalar(c, "select is_available from appointment_availability_slots"));
            confirm(c, b);
            assertEquals("1", scalar(c, "select count(*) from appointment_requests where status='confirmed'"));
        }
    }
    @Test void unavailableSlotDoesNotLeaveRequest() throws Exception {
        try (Connection c = connect()) {
            execute(c, "update appointment_availability_slots set is_available=false");
            SQLException error = assertThrows(SQLException.class, () -> request(c));
            assertEquals("P0001", error.getSQLState());
            assertEquals("0", scalar(c, "select count(*) from appointment_requests"));
        }
    }
}
