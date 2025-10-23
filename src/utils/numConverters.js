export default function formatNumber(num) {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/**
 * formatChatTimestamp(isoString, options) -> friendly chat label
 *
 * Examples:
 *  - Today 08:00
 *  - Yesterday 14:30
 *  - Mon 16:05
 *  - 12 Oct 08:00
 *  - 21 Jun 2024 09:00
 *
 * Options:
 *  - timeZone (string) : IANA tz (default: 'Africa/Accra')
 *  - locale (string)   : locale for weekday/month names (default: undefined -> runtime locale)
 */
export function formatChatTimestamp(
  isoString,
  { timeZone = "Africa/Accra", locale } = {}
) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  // Helper: get date parts (year, month, day, hour, minute, weekday) for a given Date in the requested timeZone
  function partsFor(dt) {
    const fmt = new Intl.DateTimeFormat(locale, {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      weekday: "short",
      hour12: false,
    });
    // formatToParts gives reliable numeric parts for the timezone
    const parts = fmt.formatToParts(dt).reduce((acc, p) => {
      if (p.type === "year") acc.year = Number(p.value);
      if (p.type === "month") acc.month = Number(p.value);
      if (p.type === "day") acc.day = Number(p.value);
      if (p.type === "hour") acc.hour = p.value.padStart(2, "0");
      if (p.type === "minute") acc.minute = p.value;
      if (p.type === "weekday") acc.weekday = p.value;
      return acc;
    }, {});
    return parts;
  }

  const t = partsFor(date);
  const now = new Date();
  const n = partsFor(now);

  // Build UTC-midnight timestamps for both dates (these represent the date in the chosen timezone)
  const targetMidUtc = Date.UTC(t.year, t.month - 1, t.day);
  const nowMidUtc = Date.UTC(n.year, n.month - 1, n.day);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((nowMidUtc - targetMidUtc) / msPerDay);

  // formatted time "HH:MM" (24h)
  const timeStr = `${t.hour}:${t.minute}`;

  if (diffDays === 0) {
    return `Today ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Yesterday ${timeStr}`;
  }
  if (diffDays > 1 && diffDays < 7) {
    // short weekday (Mon, Tue, ...)
    return `${t.weekday} ${timeStr}`;
  }

  // older than a week: show date; include year if not this year
  const sameYear = t.year === n.year;

  // month short name + day (and optionally year)
  const monthName = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone,
  }).format(date);
  const day = String(t.day).padStart(2, "0");

  if (sameYear) {
    return `${day} ${monthName} ${timeStr}`; // e.g. "12 Oct 08:00"
  } else {
    return `${day} ${monthName} ${t.year} ${timeStr}`; // e.g. "21 Jun 2024 09:00"
  }
}
