export function padNumber(value) {
  return String(value).padStart(2, "0");
}

export function formatDateKey(date) {
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

export function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}
