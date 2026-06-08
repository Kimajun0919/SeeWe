import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

type GateEstimateCardProps = {
  estimate: GateEstimate;
};

export function GateEstimateCard({ estimate }: GateEstimateCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl">
      <div className="min-w-0">
        <h3 className="break-keep font-semibold text-white">{estimate.gateName}</h3>
        <p className="mt-1 text-sm text-slate-300">
          {formatPopulation(estimate.estimatedMin)} - {formatPopulation(estimate.estimatedMax)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <Metric label="중앙값" value={formatPopulation(estimate.estimatedMid)} />
        <Metric label="가중치" value={`${Math.round(estimate.weight * 1000) / 10}%`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/50 px-3 py-2">
      <span className="text-xs text-slate-400">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}
