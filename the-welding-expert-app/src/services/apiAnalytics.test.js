import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_EVENTS } from "../analytics/events";
import { getSupabaseClient } from "./getSupabaseClient";
import { logEvent } from "./apiAnalytics";

vi.mock("./getSupabaseClient", () => ({ getSupabaseClient: vi.fn() }));

describe("logEvent", () => {
  const insert = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    insert.mockReset().mockResolvedValue({ error: null });
    getSupabaseClient.mockResolvedValue({
      from: vi.fn(() => ({ insert })),
    });
  });

  it("rejects events outside the central taxonomy", async () => {
    await expect(logEvent("unknown_event")).resolves.toBe(false);
    expect(getSupabaseClient).not.toHaveBeenCalled();
  });

  it("attaches UTM attribution and deduplicates the same operation", async () => {
    window.history.replaceState({}, "", "/?utm_source=google&utm_medium=cpc");
    const properties = { operation_id: "request-1", channel: "system" };

    await expect(logEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, properties)).resolves.toBe(true);
    await expect(logEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, properties)).resolves.toBe(false);

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      event_name: ANALYTICS_EVENTS.BOOKING_SUBMITTED,
      properties: expect.objectContaining({
        source: "google",
        medium: "cpc",
        operation_id: "request-1",
      }),
    }));
  });

  it("allows retry after an analytics write failure", async () => {
    insert
      .mockResolvedValueOnce({ error: new Error("offline") })
      .mockResolvedValueOnce({ error: null });
    const properties = { operation_id: "request-2" };

    await expect(logEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, properties)).resolves.toBe(false);
    await expect(logEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, properties)).resolves.toBe(true);
    expect(insert).toHaveBeenCalledTimes(2);
  });
});
