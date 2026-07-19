import { CLOSING_HOUR, OPENING_HOUR } from "../config/business";

const BUSINESS_TIME_ZONE = "Europe/Istanbul";

function getHourInIstanbul(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === "hour")?.value);
}

export function isWithinBusinessHours(date = new Date()) {
  const hour = getHourInIstanbul(date);
  return hour >= OPENING_HOUR && hour < CLOSING_HOUR;
}

export function getResponseExpectation(date = new Date()) {
  if (isWithinBusinessHours(date)) {
    return {
      isOpen: true,
      title: "Çalışma saatleri içindeyiz",
      message: "Talebiniz mümkün olan en kısa sürede incelenir. Ekip teyit için sizinle iletişime geçer.",
    };
  }

  return {
    isOpen: false,
    title: "Talebinizi şimdi bırakabilirsiniz",
    message: `Şu an çalışma saatleri dışındayız. Ekibimiz talebinizi ${String(OPENING_HOUR).padStart(2, "0")}:00'dan sonra sırayla inceler.`,
  };
}
