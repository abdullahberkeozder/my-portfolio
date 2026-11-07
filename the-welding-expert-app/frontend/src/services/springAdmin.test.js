import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { getSpringAdminAppointments, updateSpringAdminAppointment } from "./springAdmin";

const { session, details, from } = vi.hoisted(() => ({ session: vi.fn(), details: vi.fn(), from: vi.fn() }));
vi.mock("./getSupabaseClient", () => ({ getSupabaseClient: async () => ({
  auth: { getSession: session }, from,
}) }));
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });
beforeEach(() => {
  vi.clearAllMocks();
  session.mockResolvedValue({ data: { session: { access_token: "synthetic-token" } } });
  from.mockReturnValue({ select: () => ({ in: details }) });
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

it("maps filters and one-based pagination while preserving Spring order and RLS details", async () => {
  fetch.mockResolvedValue(response({ page: 1, total: 42, items: [
    { id: "b", customerName: "B", status: "confirmed", date: "2026-10-01", time: "11:00" },
    { id: "a", customerName: "A", status: "new" },
  ] }));
  details.mockResolvedValue({ data: [{ id: "a" }, { id: "b", customer_phone: "synthetic", status: "new" }] });
  const result = await getSpringAdminAppointments({ page: 2, showArchived: true, search: "  a%_  ",
    leadQuality: "untagged", status: "archived", from: "2026-10-01", to: "2026-10-02",
    createdAfter: "2026-09-01T00:00:00Z", createdBefore: "2026-10-01T00:00:00Z" });
  const params = new URL(fetch.mock.calls[0][0], "http://localhost").searchParams;
  expect(Object.fromEntries(params)).toMatchObject({ page: "1", size: "20", archived: "true", search: "a%_",
    sort: "newest", leadQuality: "untagged", from: "2026-10-01", to: "2026-10-02" });
  expect(params.has("status")).toBe(false);
  expect(params.get("createdBefore")).toBe("2026-10-01T00:00:00Z");
  expect(result.count).toBe(42);
  expect(result.data.map(row => row.id)).toEqual(["b", "a"]);
  expect(result.data[0]).toMatchObject({ customer_phone: "synthetic", status: "confirmed", requested_time: "11:00" });
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer synthetic-token");
});

it("fetches all pages without sending all filter sentinels", async () => {
  fetch.mockResolvedValueOnce(response({ page: 0, total: 2, items: [{ id: "a" }] }))
    .mockResolvedValueOnce(response({ page: 1, total: 2, items: [{ id: "b" }] }));
  details.mockResolvedValue({ data: [{ id: "a" }, { id: "b" }] });
  expect((await getSpringAdminAppointments({ fetchAll: true, status: "all", leadQuality: "all" })).data).toHaveLength(2);
  const params = new URL(fetch.mock.calls[1][0], "http://localhost").searchParams;
  expect(params.get("page")).toBe("1"); expect(params.get("size")).toBe("100");
  expect(params.has("leadQuality")).toBe(false);
});

it.each([["confirmed", "confirm"], ["cancelled", "cancel"]])("routes %s to its command", async (status, command) => {
  fetch.mockResolvedValue(response({ id: "a", status }));
  await updateSpringAdminAppointment({ id: "a", updates: { status } });
  expect(fetch).toHaveBeenCalledWith(`/api/v1/admin/appointments/a/${command}`, expect.objectContaining({ method: "POST" }));
  expect(from).not.toHaveBeenCalled();
});

it("preserves 409 and never falls back to a Supabase write", async () => {
  fetch.mockResolvedValue(response({ code: "appointment_slot_unavailable" }, 409));
  await expect(updateSpringAdminAppointment({ id: "a", updates: { requested_date: "2026-10-01", requested_time: "11:00" } }))
    .rejects.toMatchObject({ status: 409, message: expect.stringContaining("artık müsait değil") });
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ requested_date: "2026-10-01", requested_time: "11:00" });
  expect(from).not.toHaveBeenCalled();
});

it("rejects unsupported or mixed commands before sending anything", () => {
  for (const updates of [{ status: "completed" }, { status: "confirmed", admin_note: "note" }])
    expect(() => updateSpringAdminAppointment({ id: "a", updates })).toThrow("desteklenmiyor");
  expect(fetch).not.toHaveBeenCalled();
});

it("rejects missing sessions and partial detail reads", async () => {
  session.mockResolvedValueOnce({ data: { session: null } });
  await expect(getSpringAdminAppointments()).rejects.toThrow("Oturumunuz");
  expect(fetch).not.toHaveBeenCalled();
  fetch.mockResolvedValue(response({ page: 0, total: 1, items: [{ id: "a" }] }));
  details.mockResolvedValue({ data: [] });
  await expect(getSpringAdminAppointments()).rejects.toThrow("Liste değişti");
});
