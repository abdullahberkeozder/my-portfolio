import { afterEach, expect, it, vi } from "vitest";
import { getSpringAvailability, getSpringServices } from "./springReads";

afterEach(() => vi.unstubAllGlobals());
it("maps services without losing feature points", async () => {
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "a", serviceKey: "paint", points: ["A"] }] }));
  expect((await getSpringServices())[0]).toMatchObject({ service_key: "paint", points: ["A"] });
});
it("groups slots while preserving closed status and notes", async () => {
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ ok: true, json: async () => [
    { id: "s", dayId: "d", date: "2026-09-11", time: "09:00:00", available: false, dayStatus: "closed", dayNote: "Closed", note: "Note" },
  ] }));
  expect(await getSpringAvailability({ startDate: "2026-09-11", endDate: "2026-09-11" })).toEqual([
    { id: "d", work_date: "2026-09-11", status: "closed", note: "Closed", appointment_availability_slots: [
      { id: "s", slot_time: "09:00:00", is_available: false, note: "Note" },
    ] },
  ]);
});
it("rejects backend failure without a fallback request", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: false });
  vi.stubGlobal("fetch",fetch);
  await expect(getSpringServices()).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
});
