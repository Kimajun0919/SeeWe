export function populationMarkerClass(value: number): string {
  if (value >= 1100) {
    return "border-red-200/80 bg-red-500/90 text-white";
  }

  if (value >= 800) {
    return "border-orange-200/80 bg-orange-400/90 text-slate-950";
  }

  if (value >= 500) {
    return "border-yellow-200/80 bg-yellow-300/90 text-slate-950";
  }

  return "border-emerald-200/80 bg-emerald-400/90 text-slate-950";
}

export function populationMarkerFill(value: number): string {
  if (value >= 1100) {
    return "#ef4444";
  }

  if (value >= 800) {
    return "#fb923c";
  }

  if (value >= 500) {
    return "#fde047";
  }

  return "#34d399";
}
