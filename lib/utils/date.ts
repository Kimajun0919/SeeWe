export function formatClock(value: string | number | Date | null | undefined): string {
  if (!value) {
    return "정보없음";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatSourceTime(value: string | null | undefined): string {
  if (!value) {
    return "정보없음";
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  return value;
}

export function minutesSince(value: string | null | undefined, now = new Date()): number | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return Math.max(0, (now.getTime() - parsed.getTime()) / 60000);
}
