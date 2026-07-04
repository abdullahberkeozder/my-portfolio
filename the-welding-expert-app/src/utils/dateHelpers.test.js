import { describe, expect, it } from "vitest";
import {
  padNumber,
  formatDateKey,
  parseDateKey,
  addDays,
} from "./dateHelpers";

describe("dateHelpers Utilities", () => {
  describe("padNumber", () => {
    it("pads single digit numbers with a leading zero", () => {
      expect(padNumber(5)).toBe("05");
      expect(padNumber(0)).toBe("00");
    });

    it("does not pad double digit numbers", () => {
      expect(padNumber(12)).toBe("12");
      expect(padNumber(99)).toBe("99");
    });
  });

  describe("formatDateKey", () => {
    it("formats dates as YYYY-MM-DD", () => {
      const date = new Date("2026-07-04T12:00:00");
      expect(formatDateKey(date)).toBe("2026-07-04");
    });

    it("handles single digit days and months correctly", () => {
      const date = new Date("2026-01-09T12:00:00");
      expect(formatDateKey(date)).toBe("2026-01-09");
    });
  });

  describe("parseDateKey", () => {
    it("parses YYYY-MM-DD strings back into Date objects", () => {
      const dateKey = "2026-07-04";
      const parsed = parseDateKey(dateKey);
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(6); // 0-indexed July is 6
      expect(parsed.getDate()).toBe(4);
    });
  });

  describe("addDays", () => {
    it("adds positive amount of days correctly", () => {
      const start = new Date("2026-07-04T12:00:00");
      const result = addDays(start, 5);
      expect(result.getDate()).toBe(9);
    });

    it("handles negative amount of days correctly", () => {
      const start = new Date("2026-07-04T12:00:00");
      const result = addDays(start, -3);
      expect(result.getDate()).toBe(1);
    });
  });
});
