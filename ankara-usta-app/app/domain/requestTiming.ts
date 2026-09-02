export const requestTimings = {
  urgent: {label: 'Mümkün olan en kısa sürede', days: 0},
  this_week: {label: 'Bu hafta içinde', days: 7},
  next_two_weeks: {label: 'Önümüzdeki iki hafta', days: 14},
  flexible: {label: 'Tarih konusunda esneğim', days: 30},
} as const;
export type RequestTiming = keyof typeof requestTimings;
const legacy: Record<string, RequestTiming> = {
  'Bugün / acil': 'urgent', 'Hemen / Bugün': 'urgent',
  'Mümkün olan en kısa sürede': 'urgent', 'Bu hafta': 'this_week',
  'Bu hafta içinde': 'this_week', 'Önümüzdeki iki hafta': 'next_two_weeks',
  'Tarih konusunda esneğim': 'flexible', 'Tarih esnek': 'flexible',
};
export function normalizeRequestTiming(value: string): RequestTiming {
  if (Object.hasOwn(requestTimings, value)) return value as RequestTiming;
  if (Object.hasOwn(legacy, value)) return legacy[value];
  throw new Error('Invalid timing preference.');
}
export function requestTimingLabel(value: string): string {
  try { return requestTimings[normalizeRequestTiming(value)].label; }
  catch { return value; }
}
