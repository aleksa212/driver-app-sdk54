// "YYYY-MM-DD" using the DEVICE's local calendar day -- not
// .toISOString(), which reads UTC components and would shift to the
// previous/next day near midnight in any timezone behind/ahead of UTC.
// This matches how the backend already treats PUdate everywhere else in
// this app: a UTC-midnight instant standing in for a plain calendar day,
// not a real timezone-aware moment. Keeping the driver's date picker on
// the exact same convention is what keeps "today" on the picker and
// "today" on the server always meaning the same day.
export function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// The reverse -- for feeding a "YYYY-MM-DD" key into the native date
// picker's `value`, which displays/edits in local time.
export function keyToLocalDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey() {
  return dateToKey(new Date());
}
