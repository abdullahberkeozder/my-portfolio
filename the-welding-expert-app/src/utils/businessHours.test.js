import { describe, expect, it } from "vitest";
import { getResponseExpectation, isWithinBusinessHours } from "./businessHours";

describe("businessHours", () => {
  it("uses Istanbul time for an open-hours response", () => {
    const date = new Date("2026-07-20T09:00:00.000Z");

    expect(isWithinBusinessHours(date)).toBe(true);
    expect(getResponseExpectation(date).isOpen).toBe(true);
  });

  it("sets a clear next-review expectation outside business hours", () => {
    const date = new Date("2026-07-20T20:00:00.000Z");

    expect(isWithinBusinessHours(date)).toBe(false);
    expect(getResponseExpectation(date).message).toContain("09:00'dan sonra");
  });
});
