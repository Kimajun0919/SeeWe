import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

type GateMarkerProps = {
  estimate: GateEstimate;
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  onSelect: (gateId: string) => void;
};

export function GateMarker({ estimate, x, y, size, isSelected, onSelect }: GateMarkerProps) {
  return (
    <div className="absolute z-20" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <button
        type="button"
        onClick={() => onSelect(estimate.gateId)}
        className="flex items-center justify-center rounded-full border-2 border-white/80 bg-sky-400/80 text-[10px] font-bold text-slate-950 shadow-xl shadow-slate-950/40 backdrop-blur transition hover:scale-105"
        style={{ width: Math.max(size, 44), height: Math.max(size, 44) }}
        aria-label={`${estimate.gateName} 추정 인구`}
      >
        {Math.round(estimate.estimatedMid / 100) / 10}천
      </button>

      {isSelected ? (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-950/95 p-3 text-left shadow-2xl sm:w-64">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-keep font-semibold text-white">{estimate.gateName}</p>
              <p className="mt-1 text-xs text-slate-300">
                추정 {formatPopulation(estimate.estimatedMin)} - {formatPopulation(estimate.estimatedMax)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 rounded-2xl bg-white/[0.06] p-3 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span>중앙값</span>
              <strong className="text-sm text-white">{formatPopulation(estimate.estimatedMid)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>가중치</span>
              <strong className="text-sm text-white">{Math.round(estimate.weight * 1000) / 10}%</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
