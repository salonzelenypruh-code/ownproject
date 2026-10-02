export const fmtDateTime = (d: Date) =>
  d.toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });
export const fmtDate = (iso: string) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric", year: "numeric" }) : "");
