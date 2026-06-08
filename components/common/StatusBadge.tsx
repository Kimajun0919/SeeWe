import { clsx } from "clsx";
import { congestionTone } from "@/lib/utils/congestion";
import type { CongestionLevel } from "@/types/seoul";

type StatusBadgeProps = {
  children: React.ReactNode;
  level?: CongestionLevel | null;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
};

const toneClass = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-amber-200",
  danger: "bg-red-100 text-red-800 ring-red-200",
  info: "bg-sky-100 text-sky-800 ring-sky-200",
};

export function StatusBadge({ children, level, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        level ? congestionTone(level) : toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
