import { StatusBadge } from "@/components/common/StatusBadge";
import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

type GateEstimateCardProps = {
  estimate: GateEstimate;
};

export function GateEstimateCard({ estimate }: GateEstimateCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{estimate.gateName}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {formatPopulation(estimate.estimatedMin)} - {formatPopulation(estimate.estimatedMax)}
          </p>
        </div>
        <StatusBadge tone="warning">추정</StatusBadge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge level={estimate.congestionLevel}>{estimate.congestionLevel}</StatusBadge>
        <StatusBadge tone={estimate.confidence === "높음" ? "success" : estimate.confidence === "낮음" ? "danger" : "info"}>
          신뢰도 {estimate.confidence}
        </StatusBadge>
      </div>

      <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-300">
        {estimate.reasons.slice(0, 3).map((reason) => (
          <li key={reason}>- {reason}</li>
        ))}
      </ul>
    </article>
  );
}
