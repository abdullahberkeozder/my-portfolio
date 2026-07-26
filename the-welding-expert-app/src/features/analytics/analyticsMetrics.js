export function calcRate(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function countUniqueSessions(events, eventName, predicate = () => true) {
  return new Set(
    events
      .filter((event) => event.event_name === eventName && predicate(event))
      .map((event) => event.session_id)
      .filter(Boolean),
  ).size;
}

export function percentile(values, percentage) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentage / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function collectSessionDurations(events, startEvent, endEvent, endPredicate = () => true) {
  const sessions = new Map();

  events.forEach((event) => {
    if (!event.session_id || !event.created_at) return;
    const timestamp = new Date(event.created_at).getTime();
    if (!Number.isFinite(timestamp)) return;

    const current = sessions.get(event.session_id) || {};
    if (event.event_name === startEvent) {
      current.start = Math.min(current.start ?? timestamp, timestamp);
    }
    if (event.event_name === endEvent && endPredicate(event)) {
      current.end = Math.min(current.end ?? timestamp, timestamp);
    }
    sessions.set(event.session_id, current);
  });

  return Array.from(sessions.values())
    .filter(({ start, end }) => Number.isFinite(start) && Number.isFinite(end) && end >= start)
    .map(({ start, end }) => Math.round((end - start) / 1000));
}

export function buildJourneyTimingData(events, minimumSampleSize = 5) {
  const journeys = [
    ["İlk ihtiyaç seçimi", "public_page_viewed", "booking_service_group_selected"],
    ["Zaman tercihi", "booking_wizard_started", "booking_slot_selected"],
    ["Talep tamamlama", "booking_wizard_started", "booking_submitted"],
  ];

  return journeys.map(([label, startEvent, endEvent]) => {
    const durations = collectSessionDurations(events, startEvent, endEvent);
    return {
      label,
      sampleSize: durations.length,
      medianSeconds: percentile(durations, 50),
      p75Seconds: percentile(durations, 75),
      sufficientData: durations.length >= minimumSampleSize,
    };
  });
}

export function buildChannelConversionData(events, started) {
  const channels = [
    ["Sistem formu", "booking_submitted"],
    ["WhatsApp", "booking_whatsapp_clicked"],
    ["E-posta", "booking_email_clicked"],
  ];

  return channels.map(([channel, eventName]) => {
    const count = countUniqueSessions(events, eventName);
    return { channel, count, rate: calcRate(count, started) };
  });
}

export function buildHeroChannelData(events, visitors) {
  const channels = [
    ["Randevu", "appointment"],
    ["WhatsApp", "whatsapp"],
    ["Telefon", "phone"],
  ];

  return channels.map(([channel, cta]) => {
    const count = countUniqueSessions(
      events,
      "hero_cta_clicked",
      (event) => event.properties?.cta === cta,
    );

    return { channel, count, rate: calcRate(count, visitors) };
  });
}

export function buildGalleryContributionData(events) {
  const cases = new Map();

  events.forEach((event) => {
    if (
      event.event_name !== "gallery_case_viewed" &&
      event.event_name !== "gallery_booking_cta_clicked"
    ) return;

    const caseId = event.properties?.case_id;
    if (!caseId) return;

    const current = cases.get(caseId) || {
      caseId,
      caseName: event.properties?.case_title || "İsimsiz vaka",
      viewedSessions: new Set(),
      bookingSessions: new Set(),
    };

    if (event.session_id) {
      if (event.event_name === "gallery_case_viewed") {
        current.viewedSessions.add(event.session_id);
      } else {
        current.bookingSessions.add(event.session_id);
      }
    }

    cases.set(caseId, current);
  });

  return Array.from(cases.values())
    .map((item) => ({
      caseId: item.caseId,
      caseName: item.caseName,
      views: item.viewedSessions.size,
      bookingClicks: item.bookingSessions.size,
      rate: calcRate(item.bookingSessions.size, item.viewedSessions.size),
    }))
    .sort((a, b) => b.views - a.views || b.bookingClicks - a.bookingClicks)
    .slice(0, 8);
}

export function buildCancellationReasonData(events) {
  const reasons = new Map();

  events.forEach((event) => {
    if (
      event.event_name !== "self_service_action_submitted" ||
      event.properties?.action !== "cancel_requested"
    ) return;

    const reason = event.properties?.cancellation_reason || "Belirtilmedi";
    reasons.set(reason, (reasons.get(reason) || 0) + 1);
  });

  return Array.from(reasons, ([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason, "tr"));
}

const CHANNEL_LABELS = {
  system: "Sistem formu",
  whatsapp: "WhatsApp",
  email: "E-posta",
};

function summarizeRequests(requests) {
  const total = requests.length;
  const qualified = requests.filter((request) => request.lead_quality === "qualified").length;
  const confirmed = requests.filter(
    (request) =>
      request.lead_quality === "qualified" &&
      ["confirmed", "completed"].includes(request.status),
  ).length;
  const completed = requests.filter((request) => request.status === "completed").length;

  return {
    requests: total,
    qualified,
    qualifiedRate: calcRate(qualified, total),
    confirmed,
    confirmationRate: calcRate(confirmed, qualified),
    completed,
    completionRate: calcRate(completed, total),
  };
}

export function buildOperationalFunnelData(requests) {
  const group = (key, labeler = (value) => value || "Belirtilmedi") => {
    const groups = new Map();
    requests.forEach((request) => {
      const value = request[key] || "unknown";
      groups.set(value, [...(groups.get(value) || []), request]);
    });

    return Array.from(groups, ([value, items]) => ({
      key: value,
      label: labeler(value),
      ...summarizeRequests(items),
    })).sort((a, b) => b.requests - a.requests || a.label.localeCompare(b.label, "tr"));
  };

  return {
    summary: summarizeRequests(requests),
    byChannel: group("channel", (value) => CHANNEL_LABELS[value] || value),
    byService: group("service_type"),
  };
}
