import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

export function MapLegend({ estimates }: { estimates: GateEstimate[] }) {
  const values = estimates.map((estimate) => estimate.estimatedMid);
  const min = values.length > 0 ? Math.min(...values) : null;
  const max = values.length > 0 ? Math.max(...values) : null;

  return (
    <div className="absolute bottom-4 right-4 z-30 rounded-2xl border border-white/15 bg-slate-950/85 p-3 text-xs text-slate-200 shadow-xl backdrop-blur">
      <p className="font-semibold text-white">인구 범례</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-sky-300" />
        <span>낮음 {formatPopulation(min)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-5 w-5 rounded-full bg-sky-500" />
        <span>높음 {formatPopulation(max)}</span>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">출입구 값은 모두 추정 범위입니다.</p>
    </div>
  );
}
