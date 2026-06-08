import { StatusBadge } from "@/components/common/StatusBadge";
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
        style={{ width: size, height: size }}
        aria-label={`${estimate.gateName} 추정 인구`}
      >
        {Math.round(estimate.estimatedMid / 100) / 10}천
      </button>

      {isSelected ? (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-950/95 p-3 text-left shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{estimate.gateName}</p>
              <p className="mt-1 text-xs text-slate-300">
                추정 {formatPopulation(estimate.estimatedMin)} - {formatPopulation(estimate.estimatedMax)}
              </p>
            </div>
            <StatusBadge tone="warning">추정</StatusBadge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge level={estimate.congestionLevel}>{estimate.congestionLevel}</StatusBadge>
            <StatusBadge tone={estimate.confidence === "낮음" ? "danger" : "info"}>
              신뢰도 {estimate.confidence}
            </StatusBadge>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-300">
            {estimate.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
