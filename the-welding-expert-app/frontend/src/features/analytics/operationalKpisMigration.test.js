import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/sprint_8_operational_kpis.sql",
  "utf8",
);

describe("Sprint 3 operational KPI migration", () => {
  it("adds an immutable first-contact timestamp without an unreliable backfill", () => {
    expect(migration).toContain(
      "add column if not exists first_contacted_at timestamptz",
    );
    expect(migration).toContain(
      "old.first_contacted_at is not null",
    );
    expect(migration).toContain(
      "new.first_contacted_at := old.first_contacted_at",
    );
    expect(migration).toContain(
      "new.first_contacted_at := clock_timestamp()",
    );
    expect(migration).not.toMatch(
      /update\s+public\.appointment_requests[\s\S]+first_contacted_at/i,
    );
  });
});
