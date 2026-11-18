// Date-only values ("YYYY-MM-DD", or the same day at UTC midnight as the API
// may send it) describe a calendar day, not an instant. `new Date("2026-03-04")`
// parses as UTC midnight, so formatting it in Colombia (UTC-5) shows the
// previous day. Format them in UTC, and build "today" from local fields.

export function formatDateOnly(value: string, locale = "es-CO"): string {
  return new Date(value).toLocaleDateString(locale, { timeZone: "UTC" });
}

export function todayDateOnly(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
