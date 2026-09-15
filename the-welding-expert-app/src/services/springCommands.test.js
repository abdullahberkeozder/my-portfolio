import { afterEach, expect, it, vi } from "vitest";
import { createSpringAppointment } from "./springCommands";
afterEach(() => vi.unstubAllGlobals());
it("posts only allowed request fields and preserves the tracking token", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "id", public_token: "token" }) });
  vi.stubGlobal("fetch",fetch);
  expect(await createSpringAppointment({ customer_name: "Test", status: "confirmed", notes: "note" }))
    .toEqual({ id: "id", public_token: "token" });
  const body=JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.customer_note).toBe("note");
  expect(body).not.toHaveProperty("status");
});
it("reports conflicts without retrying or falling back", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: false, status: 409 });
  vi.stubGlobal("fetch",fetch);
  await expect(createSpringAppointment({})).rejects.toThrow("artık müsait değil");
  expect(fetch).toHaveBeenCalledTimes(1);
});
