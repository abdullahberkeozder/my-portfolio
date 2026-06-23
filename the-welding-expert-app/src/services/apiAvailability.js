import supabase from "./supabase";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;
const SLOT_DURATION_HOURS = 2;
const DEFAULT_DAY_NOTE =
  "Ortalama iş süresi iki saattir. 09:00 - 21:00 arasında randevu alınabilir.";

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);
  return nextDate;
}

function buildDateRange(startDate, endDate) {
  const dates = [];
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  for (
    let current = start;
    current <= end;
    current = addDays(current, 1)
  ) {
    dates.push(formatDateKey(current));
  }

  return dates;
}

function buildStandardSlotTimes() {
  return Array.from(
    { length: (CLOSING_HOUR - OPENING_HOUR) / SLOT_DURATION_HOURS },
    (_, index) => `${padNumber(OPENING_HOUR + index * SLOT_DURATION_HOURS)}:00`,
  );
}

export async function getAvailabilityDays({ startDate, endDate } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = startDate || today;
  const toDate = endDate || fromDate;

  const { data, error } = await supabase
    .from("appointment_availability_days")
    .select(
      "id, work_date, status, note, appointment_availability_slots(id, slot_time, is_available, note)",
    )
    .gte("work_date", fromDate)
    .lte("work_date", toDate)
    .eq("is_visible", true)
    .order("work_date", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Müsaitlik bilgileri yüklenemedi.");
  }

  return data;
}

export async function ensureAvailabilityRange({ startDate, endDate }) {
  const workDates = buildDateRange(startDate, endDate);

  const { data: existingDays, error: existingDaysError } = await supabase
    .from("appointment_availability_days")
    .select("id, work_date")
    .gte("work_date", startDate)
    .lte("work_date", endDate);

  if (existingDaysError) {
    console.error(existingDaysError);
    throw new Error("Müsaitlik günleri kontrol edilemedi.");
  }

  const existingDateSet = new Set(
    existingDays.map((day) => day.work_date),
  );
  const missingDays = workDates
    .filter((workDate) => !existingDateSet.has(workDate))
    .map((workDate) => ({
      work_date: workDate,
      status: "available",
      note: DEFAULT_DAY_NOTE,
      is_visible: true,
    }));

  if (missingDays.length > 0) {
    const { error: insertDaysError } = await supabase
      .from("appointment_availability_days")
      .insert(missingDays);

    if (insertDaysError) {
      console.error(insertDaysError);
      throw new Error("Müsaitlik günleri oluşturulamadı.");
    }
  }

  const { data: days, error: daysError } = await supabase
    .from("appointment_availability_days")
    .select("id, work_date")
    .gte("work_date", startDate)
    .lte("work_date", endDate);

  if (daysError) {
    console.error(daysError);
    throw new Error("Müsaitlik günleri yüklenemedi.");
  }

  const standardSlotTimes = buildStandardSlotTimes();
  const slotRows = days.flatMap((day) =>
    standardSlotTimes.map((slotTime) => ({
      day_id: day.id,
      slot_time: slotTime,
      is_available: true,
    })),
  );

  const { error: insertSlotsError } = await supabase
    .from("appointment_availability_slots")
    .upsert(slotRows, {
      onConflict: "day_id,slot_time",
      ignoreDuplicates: true,
    });

  if (insertSlotsError) {
    console.error(insertSlotsError);
    throw new Error("Randevu saatleri oluşturulamadı.");
  }

  return true;
}

export async function updateAvailabilitySlot({ slotId, isAvailable }) {
  const { data, error } = await supabase
    .from("appointment_availability_slots")
    .update({ is_available: isAvailable })
    .eq("id", slotId)
    .select("id, is_available")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Randevu saati güncellenemedi.");
  }

  return data;
}

export async function updateAvailabilityDay({ dayId, updates }) {
  const { data, error } = await supabase
    .from("appointment_availability_days")
    .update(updates)
    .eq("id", dayId)
    .select("id, status, note")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Müsaitlik günü güncellenemedi.");
  }

  return data;
}

export async function updateAvailabilitySlots({ slotIds, isAvailable }) {
  const { data, error } = await supabase
    .from("appointment_availability_slots")
    .update({ is_available: isAvailable })
    .in("id", slotIds)
    .select("id, is_available");

  if (error) {
    console.error(error);
    throw new Error("Randevu saatleri güncellenemedi.");
  }

  return data;
}
