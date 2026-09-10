package com.umutusta;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
            execute(c, Files.readString(Path.of(System.getProperty("schema.path")).getParent()
                .resolve("migrations/20260910150437_appointment_reservation_transitions.sql")));
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
    @ParameterizedTest @ValueSource(strings = {"confirm", "restore", "move"})
    void concurrentReservationWaitsThenRejectsSecondRequest(String operation) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try (Connection first = connect(); Connection second = connect(); Connection observer = connect()) {
            String a = request(first), b = request(first);
            if (operation.equals("restore")) {
                confirm(first,b); change(first,b,"archived_at=now()");
            } else if (operation.equals("move")) {
                secondSlot(first); change(first,b,"requested_time='11:00'"); confirm(first,b);
            }
            int pid = Integer.parseInt(scalar(second, "select pg_backend_pid()"));
            first.setAutoCommit(false); second.setAutoCommit(false);
            confirm(first, a);
            Future<String> loser = executor.submit(() -> {
                try {
                    if (operation.equals("restore")) change(second,b,"archived_at=null");
                    else if (operation.equals("move")) change(second,b,"requested_time='09:00'");
                    else confirm(second,b);
                    second.commit(); return "unexpected-success";
                }
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
            assertEquals("1", scalar(observer, "select count(*) from appointment_requests where status='confirmed' and archived_at is null and requested_time='09:00'"));
            if (operation.equals("restore")) assertEquals("1",scalar(observer,"select count(*) from appointment_requests where archived_at is not null"));
            else if (operation.equals("move")) assertEquals("1",scalar(observer,"select count(*) from appointment_requests where status='confirmed' and requested_time='11:00'"));
            else assertEquals("1", scalar(observer, "select count(*) from appointment_requests where status='new'"));
            assertEquals("f", scalar(observer, "select is_available from appointment_availability_slots where slot_time='09:00'"));
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

    static void change(Connection c, String id, String assignments) throws SQLException {
        try (PreparedStatement s = c.prepareStatement("update appointment_requests set " + assignments + " where id=?::uuid")) {
            s.setString(1, id); assertEquals(1, s.executeUpdate());
        }
    }
    static void secondSlot(Connection c) throws SQLException {
        execute(c, "insert into appointment_availability_slots(day_id,slot_time) select id,'11:00' from appointment_availability_days");
    }
    @Test void restoreReservesFreeSlotAndRejectsOccupiedSlotAtomically() throws Exception {
        try (Connection c = connect()) {
            String a = request(c), b = request(c);
            confirm(c,a);
            change(c,a,"archived_at=now()");
            change(c,a,"archived_at=null");
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots"));
            change(c,a,"archived_at=now()");
            confirm(c,b);
            SQLException error = assertThrows(SQLException.class, () -> change(c,a,"archived_at=null"));
            assertTrue(error.getMessage().contains("appointment_slot_unavailable"));
            assertEquals("1",scalar(c,"select count(*) from appointment_requests where archived_at is not null"));
            assertEquals("1",scalar(c,"select count(*) from appointment_requests where status='confirmed' and archived_at is null"));
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots"));
        }
    }
    @Test void moveTransfersReservationAndRollbackRestoresBothSlots() throws Exception {
        try (Connection c = connect()) {
            secondSlot(c);
            String a = request(c); confirm(c,a);
            c.setAutoCommit(false);
            change(c,a,"requested_time='11:00'");
            assertEquals("t",scalar(c,"select is_available from appointment_availability_slots where slot_time='09:00'"));
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots where slot_time='11:00'"));
            assertThrows(SQLException.class, () -> execute(c,"select 1/0"));
            c.rollback(); c.setAutoCommit(true);
            assertEquals("09:00:00",scalar(c,"select requested_time from appointment_requests"));
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots where slot_time='09:00'"));
            assertEquals("t",scalar(c,"select is_available from appointment_availability_slots where slot_time='11:00'"));
            change(c,a,"requested_time='11:00'");
            assertEquals("11:00:00",scalar(c,"select requested_time from appointment_requests"));
            assertEquals("t",scalar(c,"select is_available from appointment_availability_slots where slot_time='09:00'"));
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots where slot_time='11:00'"));
        }
    }
    @Test void occupiedMovePreservesOriginalReservation() throws Exception {
        try (Connection c = connect()) {
            secondSlot(c);
            String a=request(c), b=request(c);
            change(c,b,"requested_time='11:00'"); confirm(c,a); confirm(c,b);
            SQLException error=assertThrows(SQLException.class, () -> change(c,a,"requested_time='11:00'"));
            assertTrue(error.getMessage().contains("appointment_slot_unavailable"));
            assertEquals("2",scalar(c,"select count(distinct requested_time) from appointment_requests where status='confirmed'"));
            assertEquals("0",scalar(c,"select count(*) from appointment_availability_slots where is_available"));
        }
    }
    @Test void directConfirmedInsertIsRejectedAndCompletedBehaviorIsPreserved() throws Exception {
        try (Connection c = connect()) {
            SQLException error=assertThrows(SQLException.class, () -> execute(c,"""
                insert into appointment_requests(customer_name,customer_phone,service_type,requested_date,requested_time,status)
                values ('Test','05550000000','Kaynak',current_date+10,'09:00','confirmed')
                """));
            assertTrue(error.getMessage().contains("appointment_confirmation_requires_update"));
            assertEquals("0",scalar(c,"select count(*) from appointment_requests"));
            String a=request(c); confirm(c,a); change(c,a,"status='completed'");
            assertEquals("f",scalar(c,"select is_available from appointment_availability_slots"));
        }
    }
    @Test void dateMoveRejectsHiddenDayThenTransfersAndDeleteReleases() throws Exception {
        try (Connection c = connect()) {
            execute(c,"insert into appointment_availability_days(work_date,is_visible) values(current_date+11,false)");
            execute(c,"insert into appointment_availability_slots(day_id,slot_time) select id,'09:00' from appointment_availability_days where work_date=current_date+11");
            String a=request(c); confirm(c,a);
            assertThrows(SQLException.class, () -> change(c,a,"requested_date=current_date+11"));
            assertEquals("t",scalar(c,"select requested_date=current_date+10 from appointment_requests"));
            execute(c,"update appointment_availability_days set is_visible=true");
            change(c,a,"requested_date=current_date+11");
            assertEquals("t",scalar(c,"select s.is_available from appointment_availability_slots s join appointment_availability_days d on d.id=s.day_id where d.work_date=current_date+10"));
            assertEquals("f",scalar(c,"select s.is_available from appointment_availability_slots s join appointment_availability_days d on d.id=s.day_id where d.work_date=current_date+11"));
            execute(c,"delete from appointment_requests");
            assertEquals("2",scalar(c,"select count(*) from appointment_availability_slots where is_available"));
        }
    }
}
