import { describe, expect, it } from "vitest";

import {
  buildOperationalKpis,
  calculateConfirmationMetric,
  calculateOutsideAreaMetric,
  calculateResponseTimeMetric,
  splitRequestsByPeriod,
} from "./operationalKpis";

describe("operational KPI calculations", () => {
  it("uses immutable first-contact timestamps for median response time", () => {
    const metric = calculateResponseTimeMetric([
      {
        created_at: "2026-07-20T09:00:00+03:00",
        first_contacted_at: "2026-07-20T07:00:00Z",
        updated_at: "2026-07-25T12:00:00Z",
      },
      {
        created_at: "2026-07-20T09:00:00Z",
        first_contacted_at: "2026-07-20T13:00:00Z",
      },
      {
        created_at: "2026-07-20T09:00:00Z",
        first_contacted_at: null,
      },
    ]);

    expect(metric).toEqual({
      medianHours: 2.5,
      averageHours: 2.5,
      sampleSize: 2,
      missingCount: 1,
    });
  });

  it("returns partial-data states instead of estimating missing response times", () => {
    expect(calculateResponseTimeMetric([
      { created_at: "2026-07-20T09:00:00Z", updated_at: "2026-07-20T10:00:00Z" },
    ])).toEqual({
      medianHours: null,
      averageHours: null,
      sampleSize: 0,
      missingCount: 1,
    });
  });

  it("uses only qualified leads in the confirmation denominator", () => {
    expect(calculateConfirmationMetric([
      { lead_quality: "qualified", status: "confirmed" },
      { lead_quality: "qualified", status: "new" },
      { lead_quality: "outside_area", status: "confirmed" },
      { lead_quality: null, status: "completed" },
    ])).toEqual({
      rate: 50,
      confirmedCount: 1,
      qualifiedCount: 2,
    });
  });

  it("reports outside-area and untagged data separately", () => {
    expect(calculateOutsideAreaMetric([
      { lead_quality: "outside_area" },
      { lead_quality: "qualified" },
      { lead_quality: "spam" },
      { lead_quality: null },
    ])).toEqual({
      rate: 33,
      outsideAreaCount: 1,
      taggedCount: 3,
      untaggedCount: 1,
      taggingRate: 75,
    });
  });

  it("compares the current period with the previous equal period", () => {
    const { current, previous } = splitRequestsByPeriod([
      {
        id: "current",
        created_at: "2026-07-25T12:00:00Z",
        first_contacted_at: "2026-07-25T14:00:00Z",
        lead_quality: "qualified",
        status: "confirmed",
      },
      {
        id: "previous",
        created_at: "2026-07-15T12:00:00Z",
        first_contacted_at: "2026-07-15T16:00:00Z",
        lead_quality: "qualified",
        status: "new",
      },
    ], {
      now: "2026-07-26T12:00:00Z",
      days: 7,
    });

    expect(current.map((request) => request.id)).toEqual(["current"]);
    expect(previous.map((request) => request.id)).toEqual(["previous"]);
    expect(buildOperationalKpis(current, previous)).toMatchObject({
      responseTime: { medianHours: 2, delta: -2 },
      confirmation: { rate: 100, delta: 100 },
    });
  });
});
