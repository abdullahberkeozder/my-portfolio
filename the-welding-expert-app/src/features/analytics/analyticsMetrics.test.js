import { describe, expect, it } from "vitest";

import {
  buildChannelConversionData,
  buildCancellationReasonData,
  buildGalleryContributionData,
  buildHeroChannelData,
  buildJourneyTimingData,
  buildOperationalFunnelData,
  countUniqueSessions,
  percentile,
} from "./analyticsMetrics";

const events = [
  { event_name: "public_page_viewed", session_id: "a" },
  { event_name: "public_page_viewed", session_id: "b" },
  { event_name: "public_page_viewed", session_id: "c" },
  { event_name: "hero_cta_clicked", session_id: "a", properties: { cta: "appointment" } },
  { event_name: "hero_cta_clicked", session_id: "a", properties: { cta: "appointment" } },
  { event_name: "hero_cta_clicked", session_id: "b", properties: { cta: "whatsapp" } },
  { event_name: "booking_submitted", session_id: "a" },
];

describe("analytics metrics", () => {
  it("counts each session once", () => {
    expect(countUniqueSessions(events, "hero_cta_clicked")).toBe(2);
  });

  it("builds hero channel rates from public page visitors", () => {
    expect(buildHeroChannelData(events, 3)).toEqual([
      { channel: "Randevu", count: 1, rate: 33 },
      { channel: "WhatsApp", count: 1, rate: 33 },
      { channel: "Telefon", count: 0, rate: 0 },
    ]);
  });

  it("keeps completed channel conversion based on wizard starts", () => {
    expect(buildChannelConversionData(events, 2)[0]).toEqual({
      channel: "Sistem formu",
      count: 1,
      rate: 50,
    });
  });

  it("aggregates unique case views and booking contribution by session", () => {
    const galleryEvents = [
      { event_name: "gallery_case_viewed", session_id: "a", properties: { case_id: "1", case_title: "Kapı onarımı" } },
      { event_name: "gallery_case_viewed", session_id: "a", properties: { case_id: "1", case_title: "Kapı onarımı" } },
      { event_name: "gallery_case_viewed", session_id: "b", properties: { case_id: "1", case_title: "Kapı onarımı" } },
      { event_name: "gallery_booking_cta_clicked", session_id: "a", properties: { case_id: "1", case_title: "Kapı onarımı" } },
      { event_name: "gallery_booking_cta_clicked", session_id: "a", properties: { case_id: "1", case_title: "Kapı onarımı" } },
    ];

    expect(buildGalleryContributionData(galleryEvents)).toEqual([
      {
        caseId: "1",
        caseName: "Kapı onarımı",
        views: 2,
        bookingClicks: 1,
        rate: 50,
      },
    ]);
  });

  it("groups submitted cancellation reasons without mixing change requests", () => {
    const actionEvents = [
      { event_name: "self_service_action_submitted", properties: { action: "cancel_requested", cancellation_reason: "Planım değişti" } },
      { event_name: "self_service_action_submitted", properties: { action: "change_requested" } },
      { event_name: "self_service_action_submitted", properties: { action: "cancel_requested", cancellation_reason: "Planım değişti" } },
      { event_name: "self_service_action_submitted", properties: { action: "cancel_requested", cancellation_reason: "Diğer" } },
    ];

    expect(buildCancellationReasonData(actionEvents)).toEqual([
      { reason: "Planım değişti", count: 2 },
      { reason: "Diğer", count: 1 },
    ]);
  });

  it("builds a closed request funnel by channel and service", () => {
    const requests = [
      { channel: "system", service_type: "Kaynak", status: "new", lead_quality: "qualified" },
      { channel: "system", service_type: "Kaynak", status: "completed", lead_quality: "qualified" },
      { channel: "whatsapp", service_type: "Boya", status: "confirmed", lead_quality: "outside_area" },
    ];
    const funnel = buildOperationalFunnelData(requests);

    expect(funnel.summary).toEqual({
      requests: 3,
      qualified: 2,
      qualifiedRate: 67,
      confirmed: 2,
      confirmationRate: 67,
      completed: 1,
      completionRate: 33,
    });
    expect(funnel.byChannel[0]).toMatchObject({ label: "Sistem formu", requests: 2, qualifiedRate: 100 });
    expect(funnel.byService).toHaveLength(2);
  });

  it("reports median and P75 without hiding a small sample", () => {
    expect(percentile([4, 8, 12, 20], 50)).toBe(8);
    expect(percentile([4, 8, 12, 20], 75)).toBe(12);

    const timingEvents = [
      { event_name: "booking_wizard_started", session_id: "a", created_at: "2026-07-19T10:00:00Z" },
      { event_name: "booking_slot_selected", session_id: "a", created_at: "2026-07-19T10:00:12Z" },
      { event_name: "booking_wizard_started", session_id: "b", created_at: "2026-07-19T10:01:00Z" },
      { event_name: "booking_slot_selected", session_id: "b", created_at: "2026-07-19T10:01:20Z" },
    ];
    const timePreference = buildJourneyTimingData(timingEvents).find(
      (item) => item.label === "Zaman tercihi",
    );

    expect(timePreference).toMatchObject({
      sampleSize: 2,
      medianSeconds: 12,
      p75Seconds: 20,
      sufficientData: false,
    });
  });
});
