const HOUR_IN_MS = 60 * 60 * 1000;
const CONFIRMED_STATUSES = new Set(["confirmed", "completed"]);

function round(value, precision = 1) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function calculateRate(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null;
}

function median(values) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function calculateResponseTimeMetric(requests) {
  const durations = requests.flatMap((request) => {
    if (!request.created_at || !request.first_contacted_at) return [];

    const createdAt = Date.parse(request.created_at);
    const contactedAt = Date.parse(request.first_contacted_at);
    const duration = contactedAt - createdAt;

    return Number.isFinite(duration) && duration >= 0 ? [duration / HOUR_IN_MS] : [];
  });

  return {
    medianHours: durations.length > 0 ? round(median(durations)) : null,
    averageHours:
      durations.length > 0
        ? round(durations.reduce((total, duration) => total + duration, 0) / durations.length)
        : null,
    sampleSize: durations.length,
    missingCount: requests.length - durations.length,
  };
}

export function calculateConfirmationMetric(requests) {
  const qualifiedRequests = requests.filter(
    (request) => request.lead_quality === "qualified",
  );
  const confirmedCount = qualifiedRequests.filter((request) =>
    CONFIRMED_STATUSES.has(request.status),
  ).length;

  return {
    rate: calculateRate(confirmedCount, qualifiedRequests.length),
    confirmedCount,
    qualifiedCount: qualifiedRequests.length,
  };
}

export function calculateOutsideAreaMetric(requests) {
  const taggedRequests = requests.filter((request) => Boolean(request.lead_quality));
  const outsideAreaCount = taggedRequests.filter(
    (request) => request.lead_quality === "outside_area",
  ).length;

  return {
    rate: calculateRate(outsideAreaCount, taggedRequests.length),
    outsideAreaCount,
    taggedCount: taggedRequests.length,
    untaggedCount: requests.length - taggedRequests.length,
    taggingRate: calculateRate(taggedRequests.length, requests.length),
  };
}

function getDelta(current, previous) {
  return current === null || previous === null ? null : round(current - previous);
}

export function buildOperationalKpis(currentRequests, previousRequests = []) {
  const responseTime = calculateResponseTimeMetric(currentRequests);
  const previousResponseTime = calculateResponseTimeMetric(previousRequests);
  const confirmation = calculateConfirmationMetric(currentRequests);
  const previousConfirmation = calculateConfirmationMetric(previousRequests);
  const outsideArea = calculateOutsideAreaMetric(currentRequests);
  const previousOutsideArea = calculateOutsideAreaMetric(previousRequests);

  return {
    responseTime: {
      ...responseTime,
      delta: getDelta(responseTime.medianHours, previousResponseTime.medianHours),
    },
    confirmation: {
      ...confirmation,
      delta: getDelta(confirmation.rate, previousConfirmation.rate),
    },
    outsideArea: {
      ...outsideArea,
      delta: getDelta(outsideArea.rate, previousOutsideArea.rate),
    },
  };
}

export function splitRequestsByPeriod(requests, { now, days }) {
  const periodEnd = new Date(now).getTime();
  const periodDuration = days * 24 * HOUR_IN_MS;
  const currentStart = periodEnd - periodDuration;
  const previousStart = currentStart - periodDuration;
  const current = [];
  const previous = [];

  requests.forEach((request) => {
    const createdAt = Date.parse(request.created_at);
    if (!Number.isFinite(createdAt) || createdAt > periodEnd) return;

    if (createdAt >= currentStart) current.push(request);
    else if (createdAt >= previousStart) previous.push(request);
  });

  return { current, previous };
}
