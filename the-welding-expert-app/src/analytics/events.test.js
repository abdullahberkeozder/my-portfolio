import { beforeEach, describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENTS,
  captureAttribution,
  getEventDedupeKey,
  normalizeEvent,
  readUtmParameters,
} from "./events";

describe("analytics event contract", () => {
  beforeEach(() => sessionStorage.clear());

  it("rejects unknown events and unsupported nested property values", () => {
    expect(normalizeEvent("made_up_event")).toBeNull();
    expect(normalizeEvent(ANALYTICS_EVENTS.PUBLIC_PAGE_VIEWED, {
      source: " hero ",
      nested: { unsafe: true },
    })).toEqual({
      eventName: ANALYTICS_EVENTS.PUBLIC_PAGE_VIEWED,
      properties: { source: "hero" },
    });
  });

  it("normalizes the five standard UTM fields", () => {
    expect(readUtmParameters("?utm_source=google&utm_medium=cpc&utm_campaign=kaynak&utm_content=a&utm_term=usta&other=x"))
      .toEqual({ source: "google", medium: "cpc", campaign: "kaynak", content: "a", term: "usta" });
  });

  it("keeps attribution for the current session", () => {
    expect(captureAttribution("?utm_source=instagram&utm_campaign=yaz")).toEqual({ source: "instagram", campaign: "yaz" });
    expect(captureAttribution("")).toEqual({ source: "instagram", campaign: "yaz" });
  });

  it("creates a stable key only for explicitly identified operations", () => {
    expect(getEventDedupeKey("booking_submitted", { operation_id: "request-1" })).toBe("booking_submitted:request-1");
    expect(getEventDedupeKey("booking_submitted", {})).toBeNull();
  });

  it("drops personal contact and free-text properties", () => {
    expect(normalizeEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, {
      customer_name: "Test Kullanıcı",
      phone: "05550000000",
      email: "test@example.com",
      notes: "Serbest metin",
      service_type: "Kaynak",
    })).toEqual({
      eventName: ANALYTICS_EVENTS.BOOKING_SUBMITTED,
      properties: { service_type: "Kaynak" },
    });
  });
});
