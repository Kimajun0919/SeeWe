import type { CongestionLevel } from "@/types/seoul";

const congestionRank: Record<string, number> = {
  정보없음: 0,
  여유: 1,
  보통: 2,
  "약간 붐빔": 3,
  붐빔: 4,
};

export function normalizeCongestionLevel(
  value: CongestionLevel | null | undefined,
): "여유" | "보통" | "약간 붐빔" | "붐빔" | "정보없음" {
  if (!value) {
    return "정보없음";
  }

  if (value.includes("약간")) {
    return "약간 붐빔";
  }

  if (value.includes("붐빔") || value.includes("혼잡") || value.includes("매우")) {
    return "붐빔";
  }

  if (value.includes("보통")) {
    return "보통";
  }

  if (value.includes("여유") || value.includes("한산")) {
    return "여유";
  }

  return "정보없음";
}

export function maxCongestionLevel(
  levels: Array<CongestionLevel | null | undefined>,
): "여유" | "보통" | "약간 붐빔" | "붐빔" | "정보없음" {
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
