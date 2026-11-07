export const springReadsEnabled = import.meta.env.VITE_BOOKING_READ_BACKEND === "spring";

async function read(path) {
  const response = await fetch(`/api/v1/${path}`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Bilgiler su anda yuklenemiyor. Lutfen tekrar deneyin.");
  return response.json();
}

export async function getSpringServices() {
  const items = await read("services");
  return items.map((item) => ({
    id: item.id, service_key: item.serviceKey, title: item.title,
    description: item.description, price_tagline: item.priceTagline, image_url: item.imageUrl, points: item.points,
  }));
}

export async function getSpringAvailability({ startDate, endDate }) {
  const params = new URLSearchParams({ from: startDate, to: endDate });
  const slots = await read(`availability?${params}`);
  const days = new Map();
  for (const slot of slots) {
    if (!days.has(slot.dayId)) days.set(slot.dayId, {
      id: slot.dayId, work_date: slot.date, status: slot.dayStatus, note: slot.dayNote,
      appointment_availability_slots: [],
    });
    days.get(slot.dayId).appointment_availability_slots.push({
      id: slot.id, slot_time: slot.time, is_available: slot.available, note: slot.note,
    });
  }
  return [...days.values()];
}
