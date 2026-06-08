import type { CongestionLevel, NormalizedCongestionLevel } from "@/types/seoul";

const congestionRank: Record<NormalizedCongestionLevel, number> = {
  정보없음: 0,
  여유: 1,
  보통: 2,
  "약간 붐빔": 3,
  붐빔: 4,
};

export function normalizeCongestionLevel(
  value: CongestionLevel | null | undefined,
): NormalizedCongestionLevel {
  if (!value) {
    return "정보없음";
  }

  const normalized = String(value).trim();
  const lower = normalized.toLowerCase();

  if (normalized.includes("약간") || lower.includes("slightly")) {
    return "약간 붐빔";
  }

  if (
    normalized.includes("붐빔") ||
    normalized.includes("혼잡") ||
    normalized.includes("매우") ||
    lower.includes("crowded")
  ) {
    return "붐빔";
  }

  if (normalized.includes("보통") || lower.includes("normal")) {
    return "보통";
  }

  if (normalized.includes("여유") || normalized.includes("원활") || lower.includes("smooth")) {
    return "여유";
  }

  return "정보없음";
}

export function maxCongestionLevel(
  levels: Array<CongestionLevel | null | undefined>,
): NormalizedCongestionLevel {
  return levels
    .map(normalizeCongestionLevel)
    .sort((a, b) => congestionRank[b] - congestionRank[a])[0];
}

export function congestionTone(level: CongestionLevel | null | undefined): string {
  switch (normalizeCongestionLevel(level)) {
    case "여유":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "보통":
      return "bg-blue-100 text-blue-800 ring-blue-200";
    case "약간 붐빔":
      return "bg-orange-100 text-orange-800 ring-orange-200";
    case "붐빔":
      return "bg-red-100 text-red-800 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function congestionMarkerColor(level: CongestionLevel | null | undefined): string {
  switch (normalizeCongestionLevel(level)) {
    case "여유":
      return "#10b981";
    case "보통":
      return "#2563eb";
    case "약간 붐빔":
      return "#f97316";
    case "붐빔":
      return "#ef4444";
    default:
      return "#64748b";
  }
}
