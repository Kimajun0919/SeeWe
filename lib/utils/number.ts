export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value).replace(/[,명\s]/g, "");
  if (cleaned === "" || cleaned === "-") {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toRoundedNumber(value: unknown, fallback = 0): number {
  const parsed = toNumber(value);
  return parsed === null ? fallback : Math.round(parsed);
}

export function formatPopulation(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "정보없음";
  }

  return `${Math.round(value).toLocaleString("ko-KR")}명`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "정보없음";
  }

  return `${value.toFixed(1)}%`;
}
